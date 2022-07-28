(ns board-manager.query.account
  (:require
    [honey.sql :as sql.helper]
    [board-manager.query.db.postgres :as sql]
    [board-manager.model.account :as m.account]
    [java-time :as t]))

(defn- q-account-by-id [id]
  {:select [:id :email :last_reply :last_thread :role :username]
   :from [:account]
   :where [:= m.account/id id]})

(defn- q-account-by-email [email]
  {:select :*
   :from [:account]
   :where [:= m.account/email email]})

(defn- q-add-account [{:keys [email pass username]}]
  {:insert-into [:account]
   :columns [:email :pass :username :role]
   :values [[email pass username m.account/user-role]]})

(defn- q-update-last-reply [account-id]
  {:update [:account]
   :set {:last_reply (t/sql-timestamp)}
   :where [:= m.account/id account-id]})

(defn- q-update-last-thread [account-id]
  {:update [:account]
   :set {:last_thread (t/sql-timestamp)}
   :where [:= m.account/id account-id]})

(defn- q-update-account [update account-id]
  {:update [:account]
   :set update
   :where [:= m.account/id account-id]})

(defn find-account-by-id! [db-conn id]
  (sql/execute-one! (db-conn) (sql.helper/format (q-account-by-id id))))

(defn find-account-by-email! [db-conn email]
  (sql/execute-one! (db-conn) (sql.helper/format (q-account-by-email email))))

(defn create-account! [db-conn account]
  (sql/execute-one! (db-conn) (sql.helper/format (q-add-account account))))

(defn update-last-reply! [db-conn account-id]
  (sql/execute-one! (db-conn) (sql.helper/format (q-update-last-reply account-id))))

(defn update-last-thread! [db-conn account-id]
  (sql/execute-one! (db-conn) (sql.helper/format (q-update-last-thread account-id))))

(defn update-account! [db-conn update account-id]
  (sql/execute-one! (db-conn) (sql.helper/format (q-update-account update account-id))))

(comment
  (require '[user])
  (keys user/sys)
  (keys (:redis-conn user/sys))
  (print (:db-conn user/sys))
  (get user/sys :api :db-conn)
  (def db-conn (:db-conn user/sys))
  (print db-conn)
  (type db-conn)
  (update-account! db-conn {:username "jacobr248"} 1)
  )

