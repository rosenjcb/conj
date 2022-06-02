(ns board-manager.query.thread
  (:require
   [board-manager.model.account :as m.account]
   [board-manager.model.thread :as m.thread]
   [board-manager.model.post :as m.post]
   [board-manager.query.counter :as q.counter]
   [board-manager.query.db.redis :as db.redis]
   [board-manager.model.image :as m.image]
   [board-manager.query.account :as q.account] 
   [board-manager.query.accountinventory :as q.accountinventory]
   [board-manager.query.image :as q.image]
   [board-manager.model.accountinventory :as m.accountinventory]
   [clojure.tools.logging :as log]
   [clj-time :as t]
   [java-time :as t]))


(def min-character-count 15)
(def max-character-count 5000)

(def max-name-count 30)
(def max-subject-count 50)

(defn- trim-preview [t]
  (let [no-op (drop 1 t)]
  (conj (take-last 4 no-op) (first t))))

(defn peek-threads! 
  [redis-conn]
  (let [thread-ids (db.redis/get-keys redis-conn "*")]
    (->> thread-ids
         (map #(db.redis/get redis-conn %))
         (map trim-preview))))

(defn- validate-subject
  [subject]
  (when (> (count subject) max-subject-count)
    (throw (Exception. (format "Subject is above character limit %s/%s." (count subject) max-subject-count)))))

(defn- validate-name
  [name]
  (when (> (count name) max-name-count)
    (throw (Exception. (format "Name is above character limit %s/%s." (count name) max-name-count)))))

(defn ^:private ^:test validate-add-post 
  [post]
  (let [_ (validate-name (m.post/name post))
        _ (validate-subject (m.post/subject post))
        comment (m.post/comment post)
        image (m.post/image post)]
    (cond
      (> (count comment) max-character-count)
      (throw (Exception. (format "Comment is above character limit %s/%s." (count comment) max-character-count)))

      (and (= (count comment) 0) (= image ""))
      (throw (Exception. "Either a non-empty comment or image is required for replies."))

      :else nil)))

(defn ^:private ^:test validate-create-thread 
  [post]
  (let [_ (validate-name (m.post/name post))
        _ (validate-subject (m.post/subject post))
        comment (m.post/comment post)
        image (m.post/image post)]
    (cond
      (> (count comment) max-character-count)
      (throw (Exception. (format "Comment is above character limit %s/%s." (count comment) max-character-count)))

      (< (count comment) min-character-count)
      (throw (Exception. (format "Comment is below %s characters." min-character-count)))

      (= image "")
      (throw (Exception. "An image is required for posting threads. Try replying to a thread to collect pepes."))

      :else nil)))

(defn ^:private ^:test validate-thread-time
  [account]
  (let [last-thread (m.account/last-thread account)
        last-thread-instant (t/instant last-thread)
        lapsed-time (t/time-between :minutes last-thread-instant (t/instant))]
    (when (< lapsed-time 5)
      (throw (Exception. (format "Only %s minutes have passed since your last thread. You must wait 5 minutes between creating new threads." lapsed-time))))))

(defn ^:private ^:test validate-reply-time
  [account]
  (let [last-reply (m.account/last-reply account)
        last-reply-instant(t/instant last-reply)
        lapsed-time (t/time-between :seconds last-reply-instant (t/instant))]
    (when (< lapsed-time 60)
      (throw (Exception. (format "Only %s seconds have passed since your last reply. You must wait 60 seconds between replies." lapsed-time))))))

(defn create-thread! 
  [db-conn redis-conn account req]
  (let [account-id (:id account)
        db-account (q.account/find-account-by-id! db-conn account-id)
        post-count (q.counter/get-count! db-conn)
        thread (m.thread/req&id->thread req post-count)
        op (first thread)
        _ (validate-thread-time db-account)
        _ (validate-create-thread op)
        id (m.thread/id op)
        image-name (m.thread/image op)
        image (q.image/get-image-by-name! db-conn image-name)
        image-id (m.image/id image)
        item (q.accountinventory/get-item-from-inventory-by-account-id&image-id db-conn account-id image-id)
        item-id (m.accountinventory/id item)
        enriched-thread (vector (assoc op :image (into {} image) :time (t/zoned-date-time)))]
    (if (some? item) 
      (do
        (q.accountinventory/delete-inventory-item-by-id! db-conn item-id)
        (db.redis/set redis-conn id enriched-thread)
        (q.counter/increment-counter db-conn)
        (q.account/update-last-thread! db-conn account-id)
        enriched-thread)
      (throw (Exception. "The image requested does not exist in the account's inventory.")))))

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
        db-account (q.account/find-account-by-id! db-conn account-id)
        _ (validate-reply-time db-account)
        post-count (q.counter/get-count! db-conn)
        not-empty? (complement empty?)
        post (m.post/req&id->post post-body post-count)
        _ (validate-add-post post)
        image-name (m.post/image post)
        image (into {} (q.image/get-image-by-name! db-conn image-name))
        image-id (m.image/id image)
        item (q.accountinventory/get-item-from-inventory-by-account-id&image-id db-conn account-id image-id)
        item-id (m.accountinventory/id item)
        old-thread (find-thread-by-id! redis-conn thread-id)
        enriched-post (assoc post :image (dissoc image :id) :time (t/zoned-date-time))
        updated-thread (m.thread/add-post enriched-post old-thread)]
    (when (not-empty? image-name)
      (if item-id
        (q.accountinventory/delete-inventory-item-by-id! db-conn item-id)
        (throw (Exception. "Couldn't find the image in your inventory."))))
    (update-thread! redis-conn thread-id updated-thread)
    (q.counter/increment-counter db-conn)
    (q.account/update-last-reply! db-conn account-id)
    updated-thread))

(defn delete-thread-by-id! [redis-conn thread-id]
  (let [thread (find-thread-by-id! redis-conn thread-id)]
    (if thread
      (db.redis/del redis-conn thread-id)
      (throw (Exception. (format "Thread No. %s not found." thread-id))))))

(defn delete-all-threads! [redis-conn]
  (db.redis/flush-all redis-conn))
