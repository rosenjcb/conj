(ns board-manager.query.thread
  (:require [board-manager.model.account :as m.account]
            [board-manager.model.api.post :as api.post]
            [board-manager.model.post :as m.post]
            [board-manager.model.thread :as m.thread]
            [board-manager.query.account :as q.account]
            [board-manager.query.board :as q.board]
            [board-manager.query.db.redis :as db.redis]
            [board-manager.query.db.s3 :as db.s3]
            [clojure.java.io :as io]
            [clojure.set :as set]
            [clojure.tools.logging :as log]
            [java-time :as t]
            [ring.util.response :as response]))

(def ^:const min-character-count 15)
(def ^:const max-character-count 5000)
(def ^:const max-name-count 30)
(def ^:const max-subject-count 50)
(def ^:const max-thread-count 30)
(def ^:const max-post-count 30)

(def ^:const s3-folder "conj-images")

(defn- sort-threads [sort? threads]
  (if sort?
    (m.thread/sort threads)
    threads))

(defn- enrich-post [[post account]]
  (let [account-id (m.account/id account)
        username (m.account/username account)]
    (api.post/model->response post account-id username)))

(defn- post&account [accounts post]
  (let [account (first (filter #(= (m.post/account_id post) (m.account/id %)) accounts))]
    [post account]))

(defn- enrich-threads [db-conn enrich? threads]
  (if enrich?
    (let [posts (flatten threads)
          account-ids (set (map m.post/account_id posts))
          accounts (q.account/find-accounts-by-ids! db-conn account-ids)
          posts&accounts (map (partial post&account accounts) posts)
          enriched-posts (map enrich-post posts&accounts)
          final-threads (partition-by m.post/op? enriched-posts)]
      final-threads)
    threads))

(defn fetch-threads! 
  ([db-conn redis-conn board] 
   (fetch-threads! db-conn redis-conn board {}))
  ([db-conn redis-conn board {:keys [sort? preview-length enrich?]}]
   (let [threads (db.redis/get redis-conn board)]
     (if threads
      (some->> threads
                (map (if preview-length (partial m.thread/preview preview-length) identity))
                (sort-threads sort?)
                (enrich-threads db-conn enrich?))
       (do
        (db.redis/set redis-conn board [])
        [])))))

(comment
  (def redis-conn (:redis-conn user/sys))
  (def db-conn (:db-conn user/sys))
  (def threads (fetch-threads! db-conn redis-conn "random" {:enrich? true :sort? true}))
  (def res (q.account/find-accounts-by-ids! db-conn #{1 2 3 4 5 6}))
  (set '(1 2 3 4 5 5 5))
  (clojure.pprint/pprint threads)
  (response/response threads)
  (enrich-threads db-conn true res))

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

      (and (= (count comment) 0) ((complement some?) image))
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

      ((complement some?) image)
      (throw (Exception. "An image is required for posting threads."))

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

(defn- upload-image
  [s3-client {:keys [filename tempfile]}]
  (db.s3/upload-object s3-client s3-folder filename (io/input-stream tempfile)))

(defn- delete-image 
  [s3-client filename]
  (db.s3/delete-object s3-client s3-folder filename))

(defn find-thread-by-id!
  [redis-conn board id]
  (let [threads (db.redis/get redis-conn board)]
    (first (filter #(= id (m.post/id (first %))) threads))))

(defn- delete-thread [redis-conn board thread-id]
  (let [threads (fetch-threads! nil redis-conn board)
        new-threads (filter #((complement =) thread-id (m.post/id (first %))) threads)]
      (db.redis/set redis-conn board new-threads)))

(defn delete-thread-by-id! [redis-conn s3-client board thread-id]
  (let [thread (find-thread-by-id! redis-conn board thread-id)]
    (if thread
      (do 
        (delete-thread redis-conn board thread-id)
        (doseq [post thread
                :let [post-id (m.post/id post)
                      image (m.post/image post)]]
          (when image
            (log/infof "Deleting image %s from expired post %s" image post-id)
            (delete-image s3-client (:filename image)))))
      (throw (Exception. (format "Thread No. %s not found." thread-id))))))

(defn ^:test ^:private add-thread-to-board! [redis-conn s3-client board thread]
  (let [sorted-threads (fetch-threads! redis-conn board {:sort? true})
        thread-count (count sorted-threads)
        expired-threads (when (> thread-count max-thread-count) (subvec sorted-threads max-thread-count thread-count))
        new-threads (set/difference (conj sorted-threads thread) expired-threads)]
    (doseq [original-post (map first expired-threads)
            :let [post-id (m.post/id original-post)]]
      (when post-id 
        (log/infof "Deleting expired thread %s" post-id)
        (delete-thread-by-id! redis-conn s3-client board post-id)))
    (db.redis/set redis-conn board new-threads)))

(defn create-thread! 
  [db-conn s3-client redis-conn board account req]
  (let [account-id (:id account)
        db-account (q.account/find-account-by-id! db-conn account-id)
        account-id (m.account/id db-account)
        ;; username (m.account/username db-account)
        post-count (q.board/get-count! db-conn board)
        thread (m.thread/->thread req account-id post-count)
        ;; anonymous? (m.thread/anonymous? thread)
        ;; name (if anonymous? "Anonymous" username)
        op (first thread)
        ;; _ (validate-thread-time db-account)
        _ (validate-create-thread op)
        image (m.post/image op)
        uploaded-image (upload-image s3-client image)
        enriched-thread (vector (assoc op :image uploaded-image :time (t/zoned-date-time) :account_id account-id))] 
    (add-thread-to-board! redis-conn s3-client board enriched-thread)
    (q.board/increment-counter! db-conn board)
    (q.account/update-last-thread! db-conn account-id)
    enriched-thread))

(defn ^:private ^:test update-thread! [redis-conn board thread-id updated-thread]
  (let [old-threads (fetch-threads! nil redis-conn board)
        final-thread (if (> (count updated-thread) max-post-count) (assoc-in updated-thread [0 :locked] true) updated-thread)
        new-threads (map #(if (= (m.post/id (first %)) thread-id) final-thread %) old-threads)]
    (db.redis/set redis-conn board new-threads)
    final-thread))

(defn ^:private ^:test validate-thread-lock 
  [board thread]
  (let [post-count (count thread)
        overflow? (> post-count max-post-count)
        error-base (format "Thread %s on board /%s/ is locked." (m.post/id (first thread)) board)
        error-addition (format " Thread count is over the limit: %s/%s" post-count max-post-count)]
    (when (m.thread/locked? thread)
      (throw (Exception. (str error-base (when overflow? error-addition)))))))

(defn add-post!
  "Grabs a thread by its id, adds a post to it, and saves it to the database"  
  [db-conn s3-client redis-conn account board thread-id post-body]
  (let [account-id (:id account)
        old-thread (find-thread-by-id! redis-conn board thread-id)
        ;; anonymous? (m.thread/anonymous? old-thread)
        _ (validate-thread-lock board old-thread)
        db-account (q.account/find-account-by-id! db-conn account-id)
        ;; username (m.account/username db-account)
        account-id (m.account/id db-account)
        ;; name (if anonymous? "Anonymous" username)
        _ (validate-reply-time db-account)
        post-count (q.board/get-count! db-conn board)
        post (m.post/->post post-body account-id post-count)
        _ (validate-add-post post)
        image (m.post/image post)
        _ (when (nil? old-thread) (throw (Exception. "Thread does not exist")))
        uploaded-image (when image (upload-image s3-client image))
        enriched-post (assoc post :image uploaded-image :time (t/zoned-date-time) :name name)
        updated-thread (m.thread/add-post enriched-post old-thread)] 
    (update-thread! redis-conn board thread-id updated-thread)
    (q.board/increment-counter! db-conn board)
    (q.account/update-last-reply! db-conn account-id)
    updated-thread))

;; can probably be replaced with generic "del all redis keys and images" without validating the relationships 
(defn delete-all-threads! [redis-conn s3-client board]
  (let [threads (fetch-threads! nil redis-conn board)]
    (dorun 
     (map #(delete-thread-by-id! redis-conn s3-client board (m.post/id (first %))) threads))))
