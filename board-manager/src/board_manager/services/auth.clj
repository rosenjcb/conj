(ns board-manager.services.auth
  (:require [board-manager.model.account :as m.account]
            [board-manager.query.account :as q.account]
            [buddy.hashers :as hashers] 
            [buddy.sign.jwt :as jwt]
            [buddy.sign.util :as buddy.util]
            [buddy.core.keys :as ks]
            [clojure.tools.logging :as log]
            [clojure.java.io :as io]
            [com.stuartsierra.component :as component]
            [java-time :as t]
            [board-manager.query.refresh-token :as q.refresh-token]
            [buddy.sign.jws :as jws]))


(defn- encrypt [auth-service pass]
  (let [salt (:salt auth-service)]
    (hashers/derive pass {:salt salt})))

(defn- pubkey [auth-conf]
  (ks/public-key (io/resource (:pubkey auth-conf))))

(defn- privkey [auth-conf]
  (ks/private-key
   (io/resource (:privkey auth-conf))
   (:passphrase auth-conf)))

(defn unsign-token! [auth-service token]
  (let [auth-conf (:auth-conf auth-service)]
    (when ((complement empty?) token)
      (jwt/unsign token (pubkey auth-conf) {:alg :rs256}))))

(defn- auth-account! [db-conn credentials]
  (let [account (q.account/find-account-by-email! db-conn (:email credentials))]
    (if account 
      (if (hashers/check (:pass credentials) (:pass account))
        account
        false)
      false)))

(defn- make-access-token! [auth-conf account]
  (let [now (t/zoned-date-time)
        exp (-> (t/plus now (t/days 1)) (t/sql-timestamp))]
    (jwt/sign (dissoc account :pass) (privkey auth-conf) {:alg :rs256 :exp exp})))

(defn- make-refresh-token! [db-conn auth-conf account]
  (let [iat (t/sql-timestamp (t/zoned-date-time))
        expiry (->> (t/plus (t/zoned-date-time) (t/days 30))
                    (t/sql-timestamp))
        token (jwt/sign {:account-id (:id account)}
                        (privkey auth-conf)
                        {:alg :rs256 :iat iat :exp expiry})
        refresh-token {:account_id (:id account) :expiry expiry :token token :valid true}]
    (q.refresh-token/add-refresh-token! db-conn refresh-token)
    token))

(defn create-auth-token! [auth-service credentials]
  (let [auth-conf (:auth-conf auth-service)
        db-conn (:db-conn auth-service)
        account (auth-account! db-conn credentials)
        id (:id account)]
    (when account
      (q.refresh-token/delete-by-account-id db-conn id)  
      {:access-token (make-access-token! auth-conf account)
       :refresh-token (make-refresh-token! db-conn auth-conf account)})))

(defn add-account! [auth-service account]
  (let [db-conn (:db-conn auth-service)
        password (m.account/pass account)
        encrypted-password (encrypt auth-service password)]
    (q.account/create-account! db-conn (assoc account :pass encrypted-password))
    (create-auth-token! auth-service (select-keys account [:email :pass]))))

(defrecord Service [salt auth-conf db-conn]
  component/Lifecycle
  (start [this]
    (log/infof "Starting the Auth Service")
    (assoc this :db-conn db-conn :salt salt :auth-conf auth-conf))
  (stop [this]
    (log/infof "Stopping the Auth Service")
    (assoc this :db-conn nil :salt nil :auth-conf nil)))

(defn new-service [{:keys [salt auth-conf]}]
  (map->Service {:seed salt :auth-conf auth-conf}))
