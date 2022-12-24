(ns board-manager.routes.thread
  (:require [board-manager.middleware :as middleware]
            [board-manager.query.board :as query.board]
            [board-manager.query.db.redis :as db.redis]
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
        multipart-params (:multipart-params req)
        board (get-in req [:path-params :board])
        account (:account req)]
    (try 
      (log/info "Creating new thread")
      (->> multipart-params 
           (query.thread/create-thread! db-conn s3-client redis-conn board account)
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
        db-conn (get-in req [:components :db-conn])
        multipart-params (:multipart-params req)
        id (get-in req [:parameters :path :id])
        board (get-in req [:parameters :path :board])]
    (try
      (->> multipart-params 
           (query.thread/add-post! db-conn s3-client redis-conn account board id)
           response/response)
      (catch Exception e
        (log/infof "%s" (.getMessage e))
        (response/bad-request (.getMessage e))))))

(defn kill-thread! [req]
  (let [db-conn (get-in req [:components :db-conn])
        redis-conn (get-in req [:components :redis-conn])
        s3-client (get-in req [:components :s3-client])
        thread-id (get-in req [:parameters :path :id])
        board (get-in req [:parameters :path :board])]
    (try
      (query.thread/delete-thread-by-id! db-conn redis-conn s3-client board thread-id)
      (response/response (format "Thread No. %s has been deleted" thread-id))
      (catch Exception e
        (log/infof "%s" (.getMessage e))
        (response/bad-request (.getMessage e))))))

(defn nuke-threads! [req]
  (let [db-conn (get-in req [:components :db-conn])
        redis-conn (get-in req [:components :redis-conn])
        s3-client (get-in req [:components :s3-client])
        board (get-in req [:path-params :board])]
    (query.thread/delete-all-threads! db-conn redis-conn s3-client board)
    (response/response (format "Threads deleted from board %s" board))))

(defn list-boards! [req]
  (let [db-conn (get-in req [:components :db-conn])]
    (response/response (query.board/list-boards! db-conn))))

(defn flush-all! [req]
  (let [redis-conn (get-in req [:components :redis-conn])]
    (db.redis/flush-all redis-conn)
    (response/response "Boards have been purged and redis cache is clear!")))

(def thread-path
  [:map
   [:board string?]
   [:id int?]])

(def post-body
  [:map
   [:subject string?
    :comment string?
    :image string?]])

(def thread-body
  [:map
    [:subject {:optional true} string?]
    [:comment {:optional true} string?]
    [:image [:map
             [:filename string?]
             [:tempfile any?]]
     :is_anonymous boolean?]])

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
      :delete {:summary "Deletes a thread"
               :parameters {:path thread-path}
               :coercion malli.coercion/coercion
               :middleware [[middleware/wrap-admin]]
               :handler kill-thread!}}]])
