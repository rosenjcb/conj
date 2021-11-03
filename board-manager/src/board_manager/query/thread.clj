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
        id (model.thread/id thread)]
    (wcar* (car/set id thread))
    thread))

(defn find-thread-by-id! 
  [id]
  (wcar* (car/get id)))

(comment
  (wcar* (car/set "1382091" "set"))
  (wcar* (car/get "1382091")))
