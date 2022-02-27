(ns board-manager.query.refresh-token
  (:require
   [board-manager.query.db.postgres :as sql]
   [honey.sql :as sql.helper]))

(defn- q-add-refresh-token [{:keys [account_id expiry token valid]}]
  {:insert-into [:refresh_token]
   :columns [:account_id :expiry :token :valid]
   :values [[account_id expiry token valid]]})

(defn- q-find-by-token [token]
  {:select :*
   :where [:= :token token]
   :from [:refresh_token]})

(defn- q-delete-by-id [id]
  {:delete-from [:refresh_token]
   :where [:= :account_id id]})

(defn add-refresh-token! [db-conn token]
  (sql/execute-one! (db-conn) (sql.helper/format (q-add-refresh-token token))))

(defn find-by-token! [db-conn token]
  (sql/execute-one! (db-conn) (sql.helper/format (q-find-by-token token))))

(defn delete-by-account-id [db-conn account-id]
  (sql/execute-one! (db-conn) (sql.helper/format (q-delete-by-id account-id))))

