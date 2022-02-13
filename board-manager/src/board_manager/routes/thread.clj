(ns board-manager.routes.thread
  (:require 
    [board-manager.query.thread :as query.thread]
    [board-manager.services.item-generation :as item-generation.service]
    [clojure.tools.logging :as log] 
    [ring.util.response :as response]))


(defn peek-threads! [req]
  (let [redis-conn (get-in req [:components :redis-conn])]
    (response/response (query.thread/peek-threads! redis-conn))))

(defn create-thread! [req]
  (let [redis-conn (get-in req [:components :redis-conn])
        db-conn (get-in req [:components :db-conn])
        body-params (:body-params req)]
    (try 
      (->> body-params
          (query.thread/create-thread! db-conn redis-conn)
          response/response)
      (catch Exception e
        (log/info (str (.getMessage e)))
        (->> (str (.getMessage e))
             response/bad-request)))))

(defn get-thread! [req]
  (let [redis-conn (get-in req [:components :redis-conn])
        path-params (:path-params req)
        id (:id path-params)
        thread (query.thread/find-thread-by-id! redis-conn id)]
    (if thread
      (response/response thread)
      (response/not-found (format "No thread found with the id %s" id)))))

(defn put-thread! [req]
  (let [redis-conn (get-in req [:components :redis-conn])
        db-conn (get-in req [:components :db-conn])
        item-gen (get-in req [:components :item-generation-service])
        body-params (:body-params req)
        path-params (:path-params req)
        id (:id path-params)]
    (try
      (let [added-post (->> body-params
                            (query.thread/add-post! db-conn redis-conn id)
                            response/response)
            random-pick (item-generation.service/draw-item! item-gen 4)]
        (log/infof "Post added to thread %s" id)
        (log/infof "Lucky draw was a %s" random-pick)
        added-post) 
      (catch Exception e
        (log/infof "%s" (.getMessage e))
        (response/bad-request (.getMessage e))))))

(def thread-routes
  [["/threads"
   {:get peek-threads! 
    :post {:summary "Create a Thread" 
           :handler create-thread!}}]
    ["/threads/:id"
     {:get {:summary "Get a thread by id"
            :handler get-thread!}
      :put {:summary "Inserts a post into a thread by id"
            :handler put-thread! }}]])
