(ns board-manager.routes.threads
  (:require [compojure.core :refer :all]
            [compojure.route :as route]))

(defroutes thread-routes
  (GET "/Pie" [] {:key "value"})
  (route/not-found "Not Found"))