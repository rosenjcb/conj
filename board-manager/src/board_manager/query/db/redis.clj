(ns board-manager.query.db.redis
  (:require 
   [taoensso.carmine :as car]))

(defn get-keys [redis-conn pattern]
  (car/wcar redis-conn (car/keys pattern)))

(defn get [redis-conn key]
  (car/wcar redis-conn (car/get key)))

(defn set [redis-conn key value]
  (car/wcar redis-conn (car/set key value)))