(ns board-manager.routes.thread
  (:require 
    [board-manager.query.thread :as query.thread]
    [board-manager.model.thread :as model.thread]
    [compojure.core :refer :all]
    [clojure.tools.logging :as log] 
    [compojure.route :as route]
    [ring.util.response :as response]
    [reitit.ring :as ring]))

(defn print-req [req]
  (log/infof (str req))
  (response/response {:hi "value"}))

;; (defn hello-world [req]
;;   (response {:key "Hello World"}))

(defn create-thread! [req]
  (let [body-params (:body-params req)]
    (->> body-params
         query.thread/create-thread!
         response/response)))

(defn get-thread! [req]
  (let [path-params (:path-params req)
        id (:id path-params)]
    (->> id
         query.thread/find-thread-by-id!
         response/response)))

(defn put-thread! [req]
  (let [body-params (:body-params req)
        path-params (:path-params req)
        id (:id path-params)]
    (query.thread/add-post! id body-params)
    (->> id
         (query.thread/find-thread-by-id!)
         (query.thread/update! id)
         (response/response))))

(def thread-routes
  [["/threads"
   {:get print-req
    :put print-req
    :post {:summary "Create a Thread" 
           :handler create-thread!}}]
    ["/threads/:id"
    ;; {:get print-req}]])
     {:get {:summary "Get a thread by id"
            :handler get-thread!}
      :put {:summary "Inserts a post into a thread by id"
            :handler put-thread! }}]])

;; (defroutes thread-routes
;;   (context "/threads" []
;;     (GET "/test" [req] (response {:key "Hello World"}))
;;     (POST "/test" [req] print-req)
;;     (route/not-found "Not Found")))

(comment
  (response/response {:key "value"}))