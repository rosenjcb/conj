(ns board-manager.query.thread
  (:require
   [board-manager.model.thread :as model.thread]
   [taoensso.carmine :as car]
   [clojure.tools.logging :as log]))

(def redis-conn {:pool {} :spec {:uri "redis://localhost:6379"}})

(defmacro wcar* [& body] `(car/wcar redis-conn ~@body))

(defn create-thread! 
  [req]
  (let [thread (model.thread/req->thread req)
        id (model.thread/id (first thread))]
    (log/info id)
    (wcar* (car/set id thread))
    thread))

(defn find-thread-by-id!
  [id]
  (let [thread-data (wcar* (car/get id))]
    (model.thread/data->model thread-data)))

(defn add-post!
  "Grabs a thread by its id, adds a post to it, and saves it to the database"  
  [thread-id post-body]
  (let [model (model.thread/data->row post-body)]
    (->> thread-id
        find-thread-by-id!
        )))

(comment
  (wcar* (car/set "1" "set"))
  (wcar* (car/get "1"))
  (wcar* (car/get "1382091")))
