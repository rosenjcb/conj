(ns board-manager.services.auth
  (:require [board-manager.model.account :as m.account]
            [board-manager.query.account :as q.account]
            [buddy.core.keys :as ks]
            [buddy.hashers :as hashers]
            [buddy.sign.jwt :as jwt]
            [clojure.java.io :as io]
            [clojure.tools.logging :as log]
            [com.stuartsierra.component :as component]
            [java-time :as t]))

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

(defn- make-access-token! [auth-conf account]
  (let [now (t/zoned-date-time)
        exp (-> (t/plus now (t/days 1)) (t/sql-timestamp))]
    (jwt/sign (dissoc account :pass) (privkey auth-conf) {:alg :rs256 :exp exp})))

(defn create-auth-token! [auth-service credentials provider]
  (let [auth-conf (:auth-conf auth-service)
        db-conn (:db-conn auth-service)
        account (q.account/find-account-by-email! db-conn (:email credentials))
        auth-account (or (not= m.account/conj-provider provider) (hashers/check (:pass credentials) (:pass account)))]
    (when auth-account
      {:access-token (make-access-token! auth-conf account)})))

(defn add-account! [auth-service provider account]
  (let [db-conn (:db-conn auth-service)
        password (m.account/pass account)
        encrypted-password (encrypt auth-service password)]
    (-> (q.account/create-account! db-conn (assoc account :pass encrypted-password))
        (assoc :refresh-token (create-auth-token! auth-service (select-keys account [:email :pass]) provider)))))

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
