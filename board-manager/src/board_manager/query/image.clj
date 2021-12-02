(ns board-manager.query.image
  (:require
   [next.jdbc :as jdbc]
   [next.jdbc.result-set :as rs]))

(defn get-images! [db-conn]
  (jdbc/execute! (db-conn) ["SELECT * FROM images"] {:builder-fn rs/as-unqualified-lower-maps}))