(ns board-manager.query.thread
  (:require
   [board-manager.model.thread :as model.thread]
   [cheshire.core :as json]
   [taoensso.carmine :as car :refer (wcar)]
   [clojure.tools.logging :as log]))

(def redis-conn {:pool {} :spec {:uri "redis://localhost:6379"}})

(defmacro wcar* [& body] `(car/wcar redis-conn ~@body))

(defn create-thread! 
  [req]
  (log/infof (str req))
  (let [thread (model.thread/req->thread req)
        id (model.thread/id thread)
        payload (json/generate-string thread)]
    (wcar* (car/set id payload))
    payload))

(comment
  (wcar* (car/set "1382091" "set"))
  (wcar* (car/get "1382091")))