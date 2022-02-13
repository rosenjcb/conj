(ns board-manager.query.thread
  (:require
   [board-manager.model.thread :as m.thread]
   [board-manager.model.post :as m.post]
   [board-manager.query.counter :as q.counter]
   [board-manager.query.db.redis :as db.redis]
   [board-manager.model.image :as m.image]
   [board-manager.query.accountinventory :as q.accountinventory]
   [board-manager.query.image :as q.image]
   [board-manager.model.accountinventory :as m.accountinventory]))

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
        image-url (m.thread/image (first thread))
        image (q.image/get-image-by-location! db-conn image-url)
        image-id (m.image/id image)
        item (q.accountinventory/get-item-from-inventory-by-account-id&image-id db-conn 4 image-id)
        item-id (m.accountinventory/id item)]
    (if (some? item) 
      (do
        (q.accountinventory/delete-inventory-item-by-id! db-conn item-id)
        (db.redis/set redis-conn id thread)
        (q.counter/increment-counter db-conn)
        thread)
      (throw (Exception. "No image provided or the image requested does not exist in the account's inventory.")))))

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
        not-empty? (complement empty?)
        post (m.post/req&id->post post-body post-count)
        image-url (m.post/image post)
        image (q.image/get-image-by-location! db-conn image-url)
        image-id (m.image/id image)
        item (q.accountinventory/get-item-from-inventory-by-account-id&image-id db-conn 4 image-id)
        item-id (m.accountinventory/id item)
        old-thread (find-thread-by-id! redis-conn thread-id)
        updated-thread (m.thread/add-post post old-thread)]
    (when (not-empty? image-url)
      (if item-id
        (q.accountinventory/delete-inventory-item-by-id! db-conn item-id)
        (throw (Exception. "Couldn't find the image in your inventory."))))
    (update-thread! redis-conn thread-id updated-thread)
    (q.counter/increment-counter db-conn)
    updated-thread))
