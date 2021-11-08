(ns board-manager.query.thread
  (:require
   [board-manager.model.thread :as m.thread]
   [board-manager.model.post :as m.post]
   [taoensso.carmine :as car]
   [clojure.tools.logging :as log]))

(def redis-conn {:pool {} :spec {:uri "redis://localhost:6379"}})

(def counter (atom 0))

(defmacro wcar* [& body] `(car/wcar redis-conn ~@body))

(defn inc-thread-counter []
  (swap! counter inc))

(defn create-thread! 
  [req]
  (let [thread (m.thread/req&id->thread req @counter)
        id (m.thread/id (first thread))]
    (wcar* (car/set id thread))
    (inc-thread-counter)
    thread))

(defn find-thread-by-id!
  [id]
  (let [thread-data (wcar* (car/get id))]
    thread-data)) 

(defn update-thread! [thread-id updated-thread]
  (wcar* (car/set thread-id updated-thread)))

(defn add-post!
  "Grabs a thread by its id, adds a post to it, and saves it to the database"  
  [thread-id post-body]
  (let [post (m.post/req&id->post post-body @counter)
        old-thread (find-thread-by-id! thread-id)
        updated-thread (m.thread/add-post post old-thread)]
    (update-thread! thread-id updated-thread)
    (inc-thread-counter)
    updated-thread))


(comment
  (wcar* (car/set "1" "set"))
  (wcar* (car/get "1"))
  (wcar* (car/get "1382091")))
