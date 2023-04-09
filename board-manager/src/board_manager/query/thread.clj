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
            [java-time :as t]))

(def ^:const min-character-count 5)
(def ^:const max-character-count 5000)
(def ^:const max-subject-count 50)
(def ^:const max-thread-count 30)
(def ^:const max-post-count 300)

(def ^:const image-size-limit 5)

(def ^:const s3-bucket "conj-images")

(defn- s3-image-path [env board-name thread-id]
  (str "/" env "/boards/" board-name "/" thread-id "/"))

(defn- sort-threads [sort? threads]
  (if sort?
    (m.thread/sort threads)
    threads))

(defn- enrich-post [[post account]]
  (let [username (m.account/username account)
        avatar (m.account/avatar account)]
    (api.post/model->response post username avatar)))

(defn- purge-image-by-post [s3-client env board-name thread-id post]
  (let [post-id (m.post/id post)
        image (m.post/image post)
        path (s3-image-path env board-name thread-id)]
    (when image
      (log/infof "Deleting image %s (found in post %s) from s3" image post-id)
      (db.s3/delete-object s3-client s3-bucket path (:filename image)))))

(defn- post&account [accounts post]
  (let [account (first (filter #(= (m.post/account-id post) (m.account/id %)) accounts))]
    [post account]))

(defn- maybe-trim-post [anonymous? post]
  (if anonymous? 
    (-> (dissoc post api.post/account-id)
        (dissoc api.post/username)
        (dissoc api.post/avatar))
    post))

(defn ^:private ^:test stitch-threads
  ([posts] (stitch-threads posts []))
  ([posts state]
    (let [post (first posts)
          anonymous? (m.post/is-anonymous post)
          op? (:op post)
          trimmed-post (maybe-trim-post anonymous? post)
          trimmed-post (dissoc trimmed-post :op) ;; maybe actually keep this? Probably a good idea to always mark the OP even though threads are sequential
          rest (into [] (rest posts))
          thread (or (last state) [])
          index (max 0 (dec (count state)))]
      (if (empty? posts)
        state
        (if op? 
          (->> (conj state [trimmed-post])
               (stitch-threads rest))
          (->> (conj thread trimmed-post)
              (assoc state index)
              (stitch-threads rest)))))))

(defn- mark-op [thread]
  (assoc-in thread [0 :op] true))

(defn ^:private ^:test enrich-threads [db-conn enrich? threads]
  (if (and enrich? (seq threads))
    (let [threads (mapv mark-op threads)
          posts (flatten threads)
          account-ids (set (mapv m.post/account-id posts))
          accounts (q.account/find-accounts-by-ids! db-conn account-ids)
          posts&accounts (mapv (partial post&account accounts) posts)
          enriched-posts (mapv enrich-post posts&accounts)
          final-threads (stitch-threads enriched-posts)]
      final-threads)
    (into [] threads)))

(defn fetch-threads! 
  ([db-conn redis-conn board] 
   (fetch-threads! db-conn redis-conn board {}))
  ([db-conn redis-conn board {:keys [sort? preview-length enrich?]}]
   (let [threads (db.redis/get redis-conn board)]
     (when (not (some? threads)) (db.redis/set redis-conn board []))
     (if (seq threads)
       (some->> threads
                (mapv (if preview-length (partial m.thread/preview preview-length) identity))
                (sort-threads sort?)
                (enrich-threads db-conn enrich?))
        []))))

(defn- validate-subject
  [subject]
  (when (> (count subject) max-subject-count)
    (throw (Exception. (format "Subject is above character limit %s/%s." (count subject) max-subject-count)))))

(defn ^:private ^:test validate-add-post 
  [post]
  (let [_ (validate-subject (m.post/subject post))
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
  (let [_ (validate-subject (m.post/subject post))
        comment (m.post/comment post)]
    (cond
      (> (count comment) max-character-count)
      (throw (Exception. (format "Comment is above character limit %s/%s." (count comment) max-character-count)))

      (< (count comment) min-character-count)
      (throw (Exception. (format "Comment is below %s characters." min-character-count)))

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

(defn- bytes->mb [byte-len]
  (/ byte-len 1048576))

(defn- upload-image
  [s3-client env board-name thread-id {:keys [filename tempfile]}]
  (when (>= (bytes->mb (.length tempfile)) image-size-limit) (throw (ex-info (format "Image is over the size limit of %s MB." image-size-limit) {:type :image-size-limit})))
  (db.s3/upload-object s3-client s3-bucket (s3-image-path env board-name thread-id) filename (io/input-stream tempfile)))

(defn find-thread-by-id!
  [db-conn redis-conn board id]
  (let [threads (fetch-threads! db-conn redis-conn board {:enrich? true :sort? true})]
    (first (filter #(= id (m.post/id (first %))) threads))))

(defn- delete-thread [redis-conn board thread-id]
  (let [threads (fetch-threads! nil redis-conn board)
        new-threads (filter #((complement =) thread-id (m.post/id (first %))) threads)]
      (db.redis/set redis-conn board new-threads)))

(defn delete-thread-by-id! [db-conn redis-conn s3-client env board thread-id]
  (let [thread (find-thread-by-id! db-conn redis-conn board thread-id)]
    (if thread
      (do 
        (delete-thread redis-conn board thread-id)
        (doseq [post thread]
          (purge-image-by-post s3-client env board thread-id post)))
      (throw (Exception. (format "Thread No. %s not found." thread-id))))))

(defn ^:test ^:private add-thread-to-board! [db-conn redis-conn s3-client env board thread]
  (let [sorted-threads (fetch-threads! db-conn redis-conn board {:sort? true})
        thread-count (count sorted-threads)
        expired-threads (when (> thread-count max-thread-count) (subvec sorted-threads max-thread-count thread-count))
        new-threads (set/difference (conj sorted-threads thread) expired-threads)]
    (doseq [original-post (map first expired-threads)
            :let [post-id (m.post/id original-post)]]
      (when post-id 
        (log/infof "Deleting expired thread %s" post-id)
        (delete-thread-by-id! db-conn redis-conn s3-client env board post-id)))
    (db.redis/set redis-conn board new-threads)))

(defn create-thread! 
  [db-conn s3-client redis-conn env board account req]
  (let [account-id (:id account)
        db-account (q.account/find-account-by-id! db-conn account-id)
        account-id (m.account/id db-account)
        post-count (q.board/get-count! db-conn board)
        thread (m.thread/->thread req account-id post-count)
        op (first thread)
        _ (validate-thread-time db-account)
        _ (validate-create-thread op)
        image (m.post/image op)
        uploaded-image (when image (upload-image s3-client env board (m.post/id op) image))
        updated-op (assoc op :image uploaded-image :time (t/zoned-date-time))
        final-thread (vector updated-op)]
    (add-thread-to-board! db-conn redis-conn s3-client env board final-thread)
    (q.board/increment-counter! db-conn board)
    (q.account/update-last-thread! db-conn account-id)
    final-thread))

(defn ^:private ^:test update-thread! [db-conn redis-conn board thread-id updated-thread]
  (let [old-threads (fetch-threads! db-conn redis-conn board)
        final-thread (if (> (count updated-thread) max-post-count) (assoc-in updated-thread [0 :locked] true) updated-thread)
        new-threads (mapv #(if (= (m.post/id (first %)) thread-id) final-thread %) old-threads)]
    (db.redis/set redis-conn board new-threads)
    final-thread))

(defn delete-post-by-id! [db-conn redis-conn s3-client env board thread-id reply-id]
  (let [thread (find-thread-by-id! db-conn redis-conn board thread-id)
        op (m.thread/op thread)
        op? (= (m.post/id op) reply-id)
        post (m.thread/find-post thread reply-id)
        trimmed-thread (into [] (filter #(not (= reply-id (m.post/id %))) thread))]
    (cond
      (or (= post nil) (= thread nil))
      (throw (Exception. (format "Post No %s of Thread No %s not found" reply-id (m.post/id op))))

      ;; for now we just delete the entire thread
      (= op? true) 
      (delete-thread-by-id! db-conn redis-conn s3-client env board thread-id)

      (some? thread)
      (if thread
        (do
          (purge-image-by-post s3-client env board thread-id post)
          (update-thread! db-conn redis-conn board thread-id trimmed-thread))
        (throw (Exception. (format "Thread No. %s not found" thread-id)))))))

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
  [db-conn s3-client redis-conn env account board thread-id post-body]
  (let [account-id (:id account)
        old-thread (find-thread-by-id! db-conn redis-conn board thread-id)
        _ (validate-thread-lock board old-thread)
        db-account (q.account/find-account-by-id! db-conn account-id)
        account-id (m.account/id db-account)
        _ (validate-reply-time db-account)
        post-count (q.board/get-count! db-conn board)
        post (m.post/->post post-body account-id post-count)
        _ (validate-add-post post)
        image (m.post/image post)
        _ (when (nil? old-thread) (throw (Exception. "Thread does not exist")))
        uploaded-image (when image (upload-image s3-client env board thread-id image))
        enriched-post (assoc post :image uploaded-image :time (t/zoned-date-time))
        updated-thread (m.thread/add-post enriched-post old-thread)] 
    (update-thread! db-conn redis-conn board thread-id updated-thread)
    (q.board/increment-counter! db-conn board)
    (q.account/update-last-reply! db-conn account-id)
    updated-thread))

;; can probably be replaced with generic "del all redis keys and images" without validating the relationships 
(defn delete-all-threads! [db-conn redis-conn s3-client env board]
  (let [threads (fetch-threads! nil redis-conn board)]
    (dorun 
     (map #(delete-thread-by-id! db-conn redis-conn s3-client env board (m.post/id (first %))) threads))))
