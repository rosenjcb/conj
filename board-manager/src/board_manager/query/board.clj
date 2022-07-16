(ns board-manager.query.board
  (:require
   [board-manager.query.db.postgres :as sql]
   [honey.sql :as sql.helper]))

(defn- q-get-count [board]
  {:select [:count]
   :from [:board]
   :where [:= :name board]})

(def q-list-boards
  {:select-distinct [:name]
   :from [:board]})

(defn- q-increment-count [board count]
  {:update [:board]
   :set {:count count}
   :where [:= :name board]})

(defn get-count! [db-conn board]
  (->> (sql/execute-one! (db-conn) (sql.helper/format (q-get-count board)))
       (:count)))

(defn increment-counter! [db-conn board]
  (let [count (inc (get-count! db-conn board))]
    (sql/execute-one! (db-conn) (sql.helper/format (q-increment-count board count)))))

(defn list-boards! [db-conn]
  (->> (sql/execute! (db-conn) (sql.helper/format q-list-boards))
       (map :name)))
