(ns board-manager.routes.account
  (:require
   [board-manager.query.account :as q.account]
   [ring.util.response :as response]
   [reitit.coercion.malli :as malli]))

(defn get-account-by-id! [req]
  (let [db-conn (get-in req [:components :db-conn])
        user-id (get-in req [:parameters :path :id])
        account (q.account/get-account-by-id! db-conn user-id)]
    (if account
      (response/response account)
      (response/not-found (format "No account with the id %s was found" user-id)))))

(def account-routes 
  [["/accounts/:id"
    {:get {:name ::account-by-id
           :summary "Grab an account by id"
           :coercion malli/coercion
           :parameters {:path [:map [:id integer?]]}
           :handler get-account-by-id!}}]])
