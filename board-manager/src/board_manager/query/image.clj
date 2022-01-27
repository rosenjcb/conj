(ns board-manager.query.image
  (:require
   [honey.sql :as sql.helper]
   [board-manager.query.db.postgres :as sql]))

(def image-map 
  {:select :*
   :from [:image]})

(defn get-images! [db-conn]
  (sql/execute! (db-conn) (sql.helper/format image-map)))
