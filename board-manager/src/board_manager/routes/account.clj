(ns board-manager.routes.account
  (:require [board-manager.middleware :as middleware]
            [board-manager.model.account :as m.account]
            [board-manager.model.api.account :as api.account]
            [board-manager.query.account :as q.account]
            [board-manager.query.db.s3 :as db.s3]
            [board-manager.services.auth :as s.auth]
            [clojure.java.io :as io]
            [clojure.tools.logging :as log]
            [clojure.walk :as walk]
            [reitit.coercion.malli :as malli]
            [ring.util.response :as response])
  (:import [org.postgresql.util PSQLException]))

(defn get-my-account! [req]
  (let [db-conn (get-in req [:components :db-conn])
        account-id (get-in req [:account :id])
        account (q.account/find-account-by-id! db-conn account-id)]
    (if account
      (response/response account)
      (response/not-found (format "No account with the id %s was found" account-id)))))

(defn- set-cookies [response {:keys [access-token refresh-token]}]
  (assoc response :cookies {"refresh_token" refresh-token "access_token" access-token}))

(defn- upload-avatar
  [s3-client {:keys [filename tempfile]}]
  (db.s3/upload-object s3-client "conj-images" (str "avatars/" filename) (io/input-stream tempfile)))

(defn create-account! [req]
  (let [auth-service (get-in req [:components :auth-service])
        s3-client (get-in req [:components :s3-client])
        account-req (:multipart-params req)]
    (try 
      (let [avatar (get account-req "image")
            {:keys [location]} (when avatar (upload-avatar s3-client avatar))
            account (->> (assoc account-req m.account/avatar location)
                         walk/keywordize-keys
                         (s.auth/add-account! auth-service))]
        (->> (:refresh-token account)
             (set-cookies (response/status 200))))
      (catch PSQLException e
        (log/error e)
        (response/bad-request "An account with that email already exists")))))

(defn authenticate-account! [req]
  (let [auth-service (get-in req [:components :auth-service])
        credentials (get-in req [:parameters :body])
        conjtoken (s.auth/create-auth-token! auth-service credentials)]
    (if conjtoken 
      (-> (response/status 200)  
          (set-cookies conjtoken))
      (response/bad-request "Wrong username or password. Please try again."))))

(defn logout! [_]
 (let [resp (response/status 200)] 
   (assoc resp :cookies {:access_token {:value nil} :refresh_token {:value nil}})))

(defn update-account! [req]
  (let [db (get-in req [:components :db-conn])
        s3-client (get-in req [:components :s3-client])
        account-id (get-in req [:account :id])
        update (walk/keywordize-keys (:multipart-params req))
        avatar (m.account/avatar update)
        {:keys [location]} (when avatar (upload-avatar s3-client avatar))
        final (assoc update m.account/avatar location)]
    (try
      (some-> (q.account/update-account! db final account-id)
              (dissoc m.account/pass)
              response/response)
      (catch Exception e
        (log/errorf e "Error found for account id %s" account-id)
        (response/bad-request "Couldn't update your account for one reason or another.")))))

(def account-routes
  [["/accounts"
    {:post {:summary "Creates a new account"
            :coercion malli/coercion
            :parameters {:multipart-params api.account/new-account}
            :handler create-account!}}]
   ["/ping"
    {:get {:summary "A testing endpoint that returns a simple message"
           :handler (constantly (response/response "Ok"))}}]
   ["/me"
    {:get {:summary "Grab an account by id"
           :coercion malli/coercion
           :middleware [[middleware/wrap-auth]]
           :handler get-my-account!}
     :put {:summary "Updates a preexisting account"
           :handler update-account!
           :middleware [[middleware/wrap-auth]]
           :coercion malli/coercion
           :parameters {:multipart-params api.account/update-me}}}]
   ["/authenticate"
    {:post {:name ::authenticate-account
            :summary "Authenticates an existing account"
            :coercion malli/coercion
            :parameters {:body api.account/auth-account}
            :handler authenticate-account!}}]
   ["/logout"
    {:get {:name ::logout
           :summary "Logs the user out and deletes their cookies"
           :coercion malli/coercion
           :handler logout!}}]])
