(ns board-manager.query.db.postgres
  (:require
    [next.jdbc :as jdbc] 
    [next.jdbc.result-set :as rs]))

(defn execute! [db-conn query]
  (jdbc/execute! db-conn query {:builder-fn rs/as-unqualified-lower-maps}))

(defn execute-one! [db-conn query]
  (jdbc/execute-one! db-conn query {:builder-fn rs/as-unqualified-lower-maps}))
