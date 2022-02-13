(ns board-manager.query.accountinventory
   (:require
   [board-manager.query.db.postgres :as sql]
   [honey.sql :as sql.helper]
   [board-manager.model.accountinventory :as m.accountinventory]
   [board-manager.query.image :as q.image]
   [clojure.tools.logging :as log]))

(defn- q-inventory-by-account-id [id]
  {:select :*
   :from [:accountinventory]
   :where [:= m.accountinventory/account-id id]})

(defn- q-item-by-account-id&image-id [account-id image-id]
  {:select :*
   :from [:accountinventory] 
   :where [:and [:= :account_id account-id]
                [:= :image_id image-id]]})

(defn- q-add-item-to-account-inventory [account-id image-id]
  {:insert-into [:accountinventory]
   :columns [:account_id :image_id]
   :values [[account-id image-id]]})

(defn get-item-from-inventory-by-account-id&image-id [db-conn account-id image-id]
  (sql/execute-one! (db-conn) (sql.helper/format (q-item-by-account-id&image-id account-id image-id))))

(defn get-inventory-by-account-id! [db-conn id]
  (let [inventory (sql/execute! (db-conn) (sql.helper/format (q-inventory-by-account-id id)))]
    (->> (map m.accountinventory/image-id inventory)
         (map #(q.image/get-image-by-id! db-conn %)))))

(defn- q-delete-inventory-item [item-id]
  {:delete-from [:accountinventory :ai]
   :where [:= :ai.id item-id]})

(defn delete-inventory-item-by-id! [db-conn item-id]
  (sql/execute! (db-conn) (sql.helper/format (q-delete-inventory-item item-id))))

(defn add-item-to-account-inventory! [db-conn account-id item-id]
  (sql/execute! (db-conn) (sql.helper/format (q-add-item-to-account-inventory account-id item-id))))
