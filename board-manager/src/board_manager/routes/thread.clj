(ns board-manager.routes.thread
  (:require [board-manager.middleware :as middleware]
            [board-manager.query.board :as query.board]
            [board-manager.query.thread :as query.thread]
            [clojure.tools.logging :as log]
            [reitit.coercion.malli :as malli.coercion]
            [ring.util.response :as response]))

(defn peek-threads! [req]
  (let [redis-conn (get-in req [:components :redis-conn])
        board (get-in req [:path-params :board])
        threads (query.thread/fetch-threads! redis-conn board {:sort? true})]
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
        (log/infof "Error: %s" e)
        (->> (str (.getMessage e))
             response/bad-request)))))

(defn get-thread! [req]
  (let [redis-conn (get-in req [:components :redis-conn])
        id (get-in req [:parameters :path :id])
        board (get-in req [:parameters :path :board])
        thread (query.thread/find-thread-by-id! redis-conn board id)]
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
  (let [redis-conn (get-in req [:components :redis-conn])
        s3-client (get-in req [:components :s3-client])
        thread-id (get-in req [:parameters :path :id])
        board (get-in req [:parameters :path :board])]
    (try
      (query.thread/delete-thread-by-id! redis-conn s3-client board thread-id)
      (response/response (format "Thread No. %s has been deleted" thread-id))
      (catch Exception e
        (log/infof "%s" (.getMessage e))
        (response/bad-request (.getMessage e))))))

(defn nuke-threads! [req]
  (let [redis-conn (get-in req [:components :redis-conn])
        s3-client (get-in req [:components :s3-client])
        board (get-in req [:path-params :board])]
    (query.thread/delete-all-threads! redis-conn s3-client board)
    (response/response (format "Threads deleted from board %s" board))))

(defn list-boards! [req]
  (let [db-conn (get-in req [:components :db-conn])]
    (response/response (query.board/list-boards! db-conn))))

(def thread-req
  [:map
   [:board string?]
   [:id int?]])

(def thread-routes
  [["/boards"
    {:get list-boards!}]
   ["/boards/:board"
   {:get peek-threads! 
    :post {:summary "Create a Thread" 
           :middleware [[middleware/wrap-auth]]
           :handler create-thread!}
    :delete {:summary "Nukes the entire board"
             :middleware [[middleware/wrap-admin]]
             :handler nuke-threads!}}]
    ["/boards/:board/threads/:id"
     {:get {:summary "Get a thread by id"
            :parameters {:path thread-req}
            :coercion malli.coercion/coercion
            :handler get-thread!}
      :put {:summary "Inserts a post into a thread by id"
            :parameters {:path thread-req}
            :coercion malli.coercion/coercion
            :middleware [[middleware/wrap-auth]]
            :handler put-thread!}
      :delete {:summary "Deletes a thread"
               :parameters {:path thread-req}
               :coercion malli.coercion/coercion
               :middleware [[middleware/wrap-admin]]
               :handler kill-thread!}}]])
