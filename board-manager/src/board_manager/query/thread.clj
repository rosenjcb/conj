(ns board-manager.query.thread
  (:require
   [board-manager.model.thread :as m.thread]
   [board-manager.model.post :as m.post]
   [clojure.tools.logging :as log]
   [board-manager.query.counter :as q.counter]
   [board-manager.query.db.redis :as db.redis]))

(defn peek-threads! 
  [redis-conn]
  (let [thread-ids (db.redis/get-keys redis-conn "*")]
    (->> thread-ids
         (map #(db.redis/get redis-conn %))
         (map #(take 6 %)))))

(defn create-thread! 
  [db-conn redis-conn req]
  (let [post-count (q.counter/get-count! db-conn)
        thread (m.thread/req&id->thread req post-count)
        id (m.thread/id (first thread))
        image (m.thread/image (first thread))]
    (if image 
      (do
        (db.redis/set redis-conn id thread)
        (q.counter/increment-counter db-conn)
        thread)
      (throw (Exception. "No image provided")))))

(defn find-thread-by-id!
  [redis-conn id]
  (let [thread-data (db.redis/get redis-conn id)]
    thread-data)) 

(defn update-thread! [redis-conn thread-id updated-thread]
  (db.redis/set redis-conn thread-id updated-thread))

(defn add-post!
  "Grabs a thread by its id, adds a post to it, and saves it to the database"  
  [db-conn redis-conn thread-id post-body]
  (let [post-count (q.counter/get-count! db-conn)
        post (m.post/req&id->post post-body post-count)
        old-thread (find-thread-by-id! redis-conn thread-id)
        updated-thread (m.thread/add-post post old-thread)]
    (update-thread! redis-conn thread-id updated-thread)
    (q.counter/increment-counter db-conn)
    updated-thread))
