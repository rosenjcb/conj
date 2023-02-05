(ns board-manager.routes.thread
  (:require [board-manager.middleware :as middleware]
            [board-manager.model.account :as m.account]
            [board-manager.model.post :as m.post]
            [board-manager.model.thread :as m.thread]
            [board-manager.query.account :as q.account]
            [board-manager.query.board :as query.board]
            [board-manager.query.db.redis :as db.redis]
            [board-manager.query.db.s3 :as db.s3]
            [board-manager.query.thread :as query.thread]
            [clojure.tools.logging :as log]
            [reitit.coercion.malli :as malli.coercion]
            [ring.util.response :as response]))

(defn peek-threads! [req]
  (let [db-conn (get-in req [:components :db-conn])
        redis-conn (get-in req [:components :redis-conn])
        board (get-in req [:path-params :board])
        threads (query.thread/fetch-threads! db-conn redis-conn board {:sort? true :enrich? true})]
    (if threads
      (response/response threads)
      (response/not-found (format "Board %s does not exist" board)))))

(defn create-thread! [req]
  (let [redis-conn (get-in req [:components :redis-conn])
        db-conn (get-in req [:components :db-conn])
        s3-client (get-in req [:components :s3-client])
        env (get-in req [:components :env])
        multipart-params (:multipart-params req)
        board (get-in req [:path-params :board])
        account (:account req)]
    (try 
      (log/info "Creating new thread")
      (->> multipart-params 
           (query.thread/create-thread! db-conn s3-client redis-conn env board account)
           response/response)
      (catch Exception e
        (log/errorf e "Error for req: %s" req)
        (->> (str (.getMessage e))
             response/bad-request)))))

(defn get-thread! [req]
  (let [db-conn (get-in req [:components :db-conn])
        redis-conn (get-in req [:components :redis-conn])
        id (get-in req [:parameters :path :id])
        board (get-in req [:parameters :path :board])
        thread (query.thread/find-thread-by-id! db-conn redis-conn board id)]
    (if thread
      (response/response thread)
      (response/not-found (format "No thread found with the id %s" id)))))

(defn put-thread! [req]
  (let [redis-conn (get-in req [:components :redis-conn])
        s3-client (get-in req [:components :s3-client])
        account (:account req)
        env (get-in req [:components :env])
        db-conn (get-in req [:components :db-conn])
        multipart-params (:multipart-params req)
        id (get-in req [:parameters :path :id])
        board (get-in req [:parameters :path :board])]
    (try
      (->> multipart-params 
           (query.thread/add-post! db-conn s3-client redis-conn env account board id)
           response/response)
      (catch Exception e
        (log/infof "%s" (.getMessage e))
        (response/bad-request (.getMessage e))))))

(defn kill-thread-or-post! [req]
  (try
    (let [db-conn (get-in req [:components :db-conn])
          redis-conn (get-in req [:components :redis-conn])
          s3-client (get-in req [:components :s3-client])
          env (get-in req [:components :env])
          thread-id (get-in req [:parameters :path :id])
          board (get-in req [:parameters :path :board])
          reply-no (get-in req [:parameters :query :replyNo])
          ban (get-in req [:parameters :query :ban])
          request-account (get-in req [:account])
          thread (query.thread/find-thread-by-id! db-conn redis-conn board thread-id)
          post (or (m.thread/find-post thread reply-no) (m.thread/op thread))
          author-account-id (m.post/account-id post)
          author-account (q.account/find-account-by-id! db-conn author-account-id)
          delete-reply? (some? reply-no)
          can-ban? (= (m.account/role request-account) m.account/admin-role)
          can-delete? (or (= (m.account/id request-account) author-account-id) can-ban?)
          success-message (if delete-reply?
                            (format "Reply No. %s of Thread No. %s deleted" reply-no thread-id)
                            (format "Thread No. %s has been deleted" thread-id))]
      (when (not can-delete?) (throw (Exception. "You can only delete your own posts.")))
      (when (and ban can-ban?)
        (log/infof "Banning account-id %s" author-account-id)
        (q.account/update-account!
         db-conn
         (assoc author-account m.account/status m.account/status-banned)
         author-account-id))
      (if delete-reply?
        (query.thread/delete-post-by-id! db-conn redis-conn s3-client env board thread-id reply-no)
        (query.thread/delete-thread-by-id! db-conn redis-conn s3-client env board thread-id))
      (response/response success-message))
    (catch Exception e
      (log/infof "Something went wrong trying to delete this post/thread %s" (.getMessage e))
      (response/bad-request (.getMessage e)))))

(defn nuke-threads! [req]
  (let [db-conn (get-in req [:components :db-conn])
        redis-conn (get-in req [:components :redis-conn])
        s3-client (get-in req [:components :s3-client])
        env (get-in req [:components :env])
        board (get-in req [:path-params :board])]
    (query.thread/delete-all-threads! db-conn redis-conn s3-client env board)
    (response/response (format "Threads deleted from board %s" board))))

(defn list-boards! [req]
  (let [db-conn (get-in req [:components :db-conn])]
    (response/response (query.board/list-boards! db-conn))))

(defn flush-all! [req]
  (let [redis-conn (get-in req [:components :redis-conn])
        s3-client (get-in req [:components :s3-client])
        env (get-in req [:components :env])
        boards-path (str env "/boards/")]
    (db.redis/flush-all redis-conn)
    (db.s3/delete-directory s3-client "conj-images" boards-path)
    (response/response "Boards have been purged and redis cache is clear!")))

(def thread-path
  [:map
   [:board string?]
   [:id int?]])

(def thread-query
  [:map
   [:replyNo {:optional true} int?]
   [:ban {:optional true} boolean?]])

(def post-body
  [:map
   [:subject string?]
   [:comment string?]
   [:image string?]])

(def thread-body
  [:map
   [:subject {:optional true} string?]
   [:comment {:optional true} string?]
   [:image [:map
            [:filename string?]
            [:tempfile any?]]]
   [:is_anonymous boolean?]])

(def thread-routes
  [["/boards"
    {:get list-boards!
     :delete {:summary "Purges all boards from cache"
              :middleware [[middleware/wrap-admin]]
              :handler flush-all!}}]
   ["/boards/:board"
   {:get peek-threads! 
    :post {:summary "Create a Thread" 
           :middleware [[middleware/full-wrap-auth]]
           :coercion malli.coercion/coercion
           :parameters {:multipart-params thread-body}
           :handler create-thread!}
    :delete {:summary "Nukes the entire board"
             :middleware [[middleware/wrap-admin]]
             :handler nuke-threads!}}]
    ["/boards/:board/threads/:id"
     {:get {:summary "Get a thread by id"
            :parameters {:path thread-path}
            :coercion malli.coercion/coercion
            :handler get-thread!}
      :put {:summary "Inserts a post into a thread by id"
            :parameters {:path thread-path
                         :multipart-params post-body}
            :coercion malli.coercion/coercion
            :middleware [[middleware/full-wrap-auth]]
            :handler put-thread!}
      :delete {:summary "Deletes a thread (or reply). Pass an optional parameter to ban the post author."
               :parameters {:path thread-path
                            :query thread-query}
               :coercion malli.coercion/coercion
               :middleware [[middleware/full-wrap-auth]]
               :handler kill-thread-or-post!}}]])
