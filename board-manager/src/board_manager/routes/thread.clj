(ns board-manager.routes.thread
  (:require 
    [board-manager.query.thread :as query.thread]
    [board-manager.model.thread :as model.thread]
    [compojure.core :refer :all]
    [clojure.tools.logging :as log] 
    [compojure.route :as route]
    [ring.util.response :as response]
    [reitit.ring :as ring]
    [next.jdbc :as jdbc]))


(defn peek-threads! [req]
  ;; (log/info "hello world")
  (let [redis-conn (get-in req [:components :redis-conn])]
    ;; (log/infof "Query res %s" (jdbc/execute! (db-conn) ["SELECT *
    ;;                           FROM pg_catalog.pg_tables
    ;;                           WHERE schemaname != 'pg_catalog' AND 
    ;;                           schemaname != 'information_schema';"]))
    ;; (log/infof "Req is %s" req)
    ;; (log/infof "Your connection looks like %s" db-conn)
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
        (log/info (assoc {} :error (str (.getMessage e))))
        (->> (str (.getMessage e))
             (assoc {} :error)
             response/bad-request)))))

(defn get-thread! [req]
  (let [redis-conn (get-in req [:components :redis-conn])
        path-params (:path-params req)
        id (:id path-params)]
    (->> id
         (query.thread/find-thread-by-id! redis-conn)
         response/response)))

(defn put-thread! [req]
  (let [redis-conn (get-in req [:components :redis-conn])
        db-conn (get-in req [:components :db-conn])
        body-params (:body-params req)
        path-params (:path-params req)
        id (:id path-params)]
    (->> body-params
         (query.thread/add-post! db-conn redis-conn id)
         response/response)))

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
