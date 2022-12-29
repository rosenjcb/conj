(ns board-manager.query.db.redis
  (:require 
   [taoensso.carmine :as car]))

(defn get-keys [redis-conn pattern]
  @(future (car/wcar redis-conn (car/keys pattern))))

#_{:clj-kondo/ignore [:redefined-var]}
(defn get [redis-conn key]
  @(future (car/wcar redis-conn (car/get key))))

#_{:clj-kondo/ignore [:redefined-var]}
(defn set [redis-conn key value]
  (future (car/wcar redis-conn (car/set key value))))

(defn del [redis-conn key]
  (future (car/wcar redis-conn (car/del key))))

(defn flush-all [redis-conn]
  (future (car/wcar redis-conn (car/flushall))))
