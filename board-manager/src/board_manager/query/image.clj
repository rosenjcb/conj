(ns board-manager.query.image
  (:require
   [honey.sql :as sql.helper]
   [board-manager.query.db.postgres :as sql]
   [board-manager.model.image :as m.image]
   [clojure.tools.logging :as log]))

(def image-map 
  {:select [:*]
   :from [:image]})

(defn- q-image-by-id [id]
  {:select [:*]
   :from [:image]
   :where [:= m.image/id id]})

(defn- q-image-by-location [location]
  {:select [:*]
   :from [:image]
   :where [:= m.image/location location]})

(defn- q-image-by-name [name]
  {:select [:*]
   :from [:image]
   :where [:= m.image/name name]})

(defn get-images! [db-conn]
  (sql/execute! (db-conn) (sql.helper/format image-map)))

(defn get-image-by-id! [db-conn id]
  (sql/execute-one! (db-conn) (sql.helper/format (q-image-by-id id))))

(defn get-image-by-location! [db-conn location]
  (sql/execute-one! (db-conn) (sql.helper/format (q-image-by-location location))))

(defn get-image-by-name! [db-conn name]
  (sql/execute-one! (db-conn) (sql.helper/format (q-image-by-name name))))
