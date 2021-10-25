(ns board-manager.routes.thread
  (:require 
    [board-manager.query.thread :as query.thread]
    [compojure.core :refer :all]
    [clojure.tools.logging :as log] 
    [compojure.route :as route]
    [ring.util.response :refer [response]]))

(defn print-req [req]
  (log/infof (str req))
  (response {:key "value"}))

(defn hello-world [req]
  (response {:key "Hello World"}))


(def thread-routes
  ["/threads"
   ["/" {:post query.thread/create-thread!}] 
   ["/test" {:get hello-world :post print-req}]])

;; (defroutes thread-routes
;;   (context "/threads" []
;;     (GET "/test" [req] (response {:key "Hello World"}))
;;     (POST "/test" [req] print-req)
;;     (route/not-found "Not Found")))