(ns board-manager.query.counter
  (:require
   [next.jdbc :as jdbc]
   [next.jdbc.result-set :as rs]))

(defn get-counter! [db-conn]
  (jdbc/execute-one! (db-conn) ["SELECT * FROM counter where board = 'random'"] {:builder-fn rs/as-unqualified-lower-maps}))

(defn get-count! [db-conn]
  (-> (jdbc/execute-one! (db-conn) 
                          ["SELECT * FROM counter where board = 'random'"] 
                          {:builder-fn rs/as-unqualified-lower-maps})
       (get :count)))

(defn increment-counter [db-conn]
  (let [count (inc (get-count! db-conn))
        query (str "UPDATE counter SET count = " count " where board = 'random'")]
    (jdbc/execute! (db-conn) [query])))
