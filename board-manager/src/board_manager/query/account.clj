(ns board-manager.query.account
  (:require
    [honey.sql :as sql.helper]
    [board-manager.query.db.postgres :as sql]
    [board-manager.model.account :as m.account]))

(defn- q-account-by-id [id]
  {:select [:id :email]
   :from [:account]
   :where [:= m.account/id id]})

(defn- q-account-by-email [email]
  {:select :*
   :from [:account]
   :where [:= m.account/email email]})

(defn- q-add-account [{:keys [email pass]}]
  {:insert-into [:account]
   :columns [:email :pass]
   :values [[email pass]]})

(defn find-account-by-id! [db-conn id]
  (sql/execute-one! (db-conn) (sql.helper/format (q-account-by-id id))))

(defn find-account-by-email! [db-conn email]
  (sql/execute-one! (db-conn) (sql.helper/format (q-account-by-email email))))

(defn create-account! [db-conn account]
  (sql/execute-one! (db-conn) (sql.helper/format (q-add-account account))))
