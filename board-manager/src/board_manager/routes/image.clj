(ns board-manager.routes.image
  (:require
   [board-manager.query.image :as q.image]
   [ring.util.response :as response]))

(defn get-images! [req]
  (let [db-conn (get-in req [:components :db-conn])]
    (response/response (q.image/get-images! db-conn))))

(def image-routes
  [["/images"
    {:get {:summary "Get all available images"
           :handler get-images!}}]])