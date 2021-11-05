(ns board-manager.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults api-defaults]]
            [ring.adapter.jetty :as ring-jetty]
            [ring.middleware.json :as middleware]
            [reitit.ring :as ring]
            [board-manager.routes.thread :as thread]
            [ring.middleware.content-type :as content-type]
            [reitit.ring.coercion :as coercion]
            [reitit.ring.middleware.muuntaja :as muuntaja]
            [muuntaja.core :as m]
            [reitit.coercion.spec :as spec]
            [ring.middleware.cors :refer [wrap-cors]]))

;; (defroutes app-routes
;;   (GET "/dog" [] "Hello Dog"))

;; (def all-routes
;;   (routes 
;;    app-routes threads/thread-routes))
;; (def cors {"Access-Control-Allow-Origin" "*"
;;            "Access-Control-Allow-Headers" "Origin, Accept, Access-Control-Request-Method, Access-Control-Allow-Headers, Content-Type, *"})

(def app
  (ring/ring-handler
    (ring/router 
     [thread/thread-routes]
     {:data {:muuntaja m/instance
             :coercion spec/coercion
             :middleware
             [muuntaja/format-middleware
              coercion/coerce-exceptions-middleware
              coercion/coerce-request-middleware
              coercion/coerce-response-middleware]}})
    (ring/create-default-handler)))

;; (def app
;;   (wrap-cors app-routes :access-control-allow-origin ["*"] :access-control-allow-methods [:get :put :post :delete]))

;; (def app
;;   app-routes)

;; (def app
;;   (-> all-routes
;;       (middleware/wrap-json-response)
;;       (middleware/wrap-json-body)
;;       (wrap-defaults api-defaults)))


(comment
  (ring-jetty/run-jetty app {:port 8080}))
