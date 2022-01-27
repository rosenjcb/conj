(ns board-manager.query.account
  (:require
    [honey.sql :as sql.helper]
    [board-manager.query.db.postgres :as sql]
    [board-manager.model.account :as m.account]))

(defn- q-account-by-id [id]
  {:select :*
   :from [:account]
   :where [:= m.account/id id]})

(defn get-account-by-id! [db-conn id]
  (sql/execute-one! (db-conn) (sql.helper/format (q-account-by-id id))))
