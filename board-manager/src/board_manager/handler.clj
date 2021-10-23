(ns board-manager.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [ring.adapter.jetty :as ring-jetty]
            [board-manager.routes.threads :as threads]))

(defroutes app-routes
  (GET "/threads" [] "Hello World")
  (route/not-found "Not Found"))

(def all-routes
  (routes app-routes threads/thread-routes))

(def app
  (wrap-defaults app-routes site-defaults))

(defn start []
  (ring-jetty/run-jetty app {:port 3000}))

(comment
  (ring-jetty/run-jetty app {:port 3000}))







