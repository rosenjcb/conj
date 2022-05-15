(ns board-manager.query.thread
  (:require
   [board-manager.model.thread :as m.thread]
   [board-manager.model.post :as m.post]
   [board-manager.query.counter :as q.counter]
   [board-manager.query.db.redis :as db.redis]
   [board-manager.model.image :as m.image]
   [board-manager.query.accountinventory :as q.accountinventory]
   [board-manager.query.image :as q.image]
   [board-manager.model.accountinventory :as m.accountinventory]
   [clojure.tools.logging :as log]))


(defn- trim-preview [t]
  (let [no-op (drop 1 t)]
  (conj (take-last 4 no-op) (first t))))

(defn peek-threads! 
  [redis-conn]
  (let [thread-ids (db.redis/get-keys redis-conn "*")]
    (->> thread-ids
         (map #(db.redis/get redis-conn %))
         (map trim-preview))))

(defn create-thread! 
  [db-conn redis-conn account req]
  (let [account-id (:id account)
        post-count (q.counter/get-count! db-conn)
        thread (m.thread/req&id->thread req post-count)
        op (first thread)
        id (m.thread/id op)
        image-name (m.thread/image op)
        image (q.image/get-image-by-name! db-conn image-name)
        image-id (m.image/id image)
        item (q.accountinventory/get-item-from-inventory-by-account-id&image-id db-conn account-id image-id)
        item-id (m.accountinventory/id item)
        enriched-thread (vector (assoc op :image (into {} image)))]
    (if (some? item) 
      (do
        (q.accountinventory/delete-inventory-item-by-id! db-conn item-id)
        (db.redis/set redis-conn id enriched-thread)
        (q.counter/increment-counter db-conn)
        enriched-thread)
      (throw (Exception. "No image provided or the image requested does not exist in the account's inventory.")))))

(defn find-thread-by-id!
  [redis-conn id]
  (let [thread-data (db.redis/get redis-conn id)]
    thread-data)) 

(defn update-thread! [redis-conn thread-id updated-thread]
  (db.redis/set redis-conn thread-id updated-thread))

(defn add-post!
  "Grabs a thread by its id, adds a post to it, and saves it to the database"  
  [db-conn redis-conn account thread-id post-body]
  (let [account-id (:id account)
        post-count (q.counter/get-count! db-conn)
        not-empty? (complement empty?)
        post (m.post/req&id->post post-body post-count)
        image-name (m.post/image post)
        image (into {} (q.image/get-image-by-name! db-conn image-name))
        image-id (m.image/id image)
        item (q.accountinventory/get-item-from-inventory-by-account-id&image-id db-conn account-id image-id)
        item-id (m.accountinventory/id item)
        old-thread (find-thread-by-id! redis-conn thread-id)
        enriched-post (assoc post :image (dissoc image :id))
        updated-thread (m.thread/add-post enriched-post old-thread)]
    (when (not-empty? image-name)
      (if item-id
        (q.accountinventory/delete-inventory-item-by-id! db-conn item-id)
        (throw (Exception. "Couldn't find the image in your inventory."))))
    (update-thread! redis-conn thread-id updated-thread)
    (q.counter/increment-counter db-conn)
    updated-thread))
