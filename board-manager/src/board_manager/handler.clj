(ns board-manager.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults api-defaults]]
            [ring.adapter.jetty :as ring-jetty]
            [ring.middleware.json :as middleware]
            [reitit.ring :as ring]
            [ring.adapter.jetty :as jetty]
            [board-manager.routes.threads :as threads]))

;; (defroutes app-routes
;;   (GET "/dog" [] "Hello Dog"))

;; (def all-routes
;;   (routes 
;;    app-routes threads/thread-routes))

(def app
  (ring/ring-handler
    (ring/router 
     [threads/thread-routes]
     {:data {:middleware
             [middleware/wrap-json-body
              middleware/wrap-json-response]}})
    (ring/create-default-handler)))

;; (def app
;;   (app-routes))

(defn start []
  (jetty/run-jetty #'app {:port 3000, :join? false})
  (println "server running in port 3000"))
;; (def app
;;   app-routes)

;; (def app
;;   (-> all-routes
;;       (middleware/wrap-json-response)
;;       (middleware/wrap-json-body)
;;       (wrap-defaults api-defaults)))


(comment
  (start))
  ;; (ring-jetty/run-jetty app {:port 3000}))
  







