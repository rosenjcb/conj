(ns board-manager.routes.account
  (:require
   [board-manager.query.account :as q.account]
   [board-manager.services.auth :as s.auth]
   [board-manager.services.item-generation :as item-generation.service]
   [board-manager.model.account :as m.account]
   [board-manager.query.accountinventory :as q.accountinventory]
   [board-manager.middleware :as middleware]
   [clojure.tools.logging :as log]
   [reitit.coercion.malli :as malli]
   [ring.util.response :as response])
  (:import [org.postgresql.util PSQLException]))

(defn get-my-account! [req]
  (let [db-conn (get-in req [:components :db-conn])
        user-id (get-in req [:account :id])
        account (q.account/find-account-by-id! db-conn user-id)]
    (if account
      (response/response account)
      (response/not-found (format "No account with the id %s was found" user-id)))))

(defn get-inventory-by-account-id! [req]
  (let [db-conn (get-in req [:components :db-conn])
        auth-service (get-in req [:components :auth-service])
        cookie (:cookies req)
        access-token (get-in cookie ["access_token" :value])
        account (when access-token (s.auth/unsign-token! auth-service access-token))
        user-id (:id account)
        inventory (q.accountinventory/get-inventory-by-account-id! db-conn user-id)]
    (response/response inventory)))

(defn- set-cookies [response {:keys [access-token refresh-token]}]
  (assoc response :cookies {"refresh_token" refresh-token "access_token" access-token}))

(defn create-account! [req]
  (let [auth-service (get-in req [:components :auth-service])
        item-gen-service (get-in req [:components :item-generation-service])
        account-req (get-in req [:parameters :body])]
    (try 
      (let [account (s.auth/add-account! auth-service account-req)
            account-id (m.account/id account)]  
        (dotimes [_ 3] (item-generation.service/draw-item! item-gen-service account-id))
        (->> (:refresh-token account)
             (set-cookies (response/status 200))))
      (catch PSQLException _
        (response/bad-request "An account with that email already exists")))))

(defn authenticate-account! [req]
  (let [auth-service (get-in req [:components :auth-service])
        credentials (get-in req [:parameters :body])
        pepetoken (s.auth/create-auth-token! auth-service credentials)]
    (if pepetoken 
      (-> (response/status 200)  
          (set-cookies pepetoken))
      (response/bad-request "Wrong username or password. Please try again."))))

(defn logout! [_]
 (let [resp (response/status 200)] 
   (assoc resp :cookies {:access_token {:value nil} :refresh_token {:value nil}})))

(defn- email? [email]
  (let [re-email #"[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"]
    (and (string? email) (re-matches re-email email))))

(defn- pass? [s]
  (let [re-pass #"[A-Za-z\d@$!%*?&]{6,20}$"]
    (some? (re-matches re-pass s))))

(def ^:private email-schema 
  [:email 
   [:fn 
    {:error/message "Email must be a valid address."}
    email?]])

(def ^:private pass-schema 
  [:pass 
   [:fn 
    {:error/message "Password must be between 6 and 20 alphanumeric characters."}
    pass?]])

(def account-routes
  [["/accounts"
    {:post {:name ::create-account
            :summary "Creates a new account"
            :coercion malli/coercion
            :parameters {:body [:map 
                                email-schema 
                                pass-schema]}
            :handler create-account!}}]
   ["/ping"
    {:get {:name ::ping
           ::summary "A testing endpoint that returns a simple message"
           :handler (constantly (response/response "Ok"))}}]
   ["/me"
    {:get {:name ::account-by-id
           :summary "Grab an account by id"
           :coercion malli/coercion
           :middleware [[middleware/wrap-auth]]
           :handler get-my-account!}}]
   ["/inventory"
    {:get {:name ::inventory-by-account-id
           :summary "Grab an account's inventory"
           :coercion malli/coercion
           :middleware [[middleware/wrap-auth]]
           :handler get-inventory-by-account-id!}}]
   ["/authenticate"
    {:post {:name ::authenticate-account
            :summary "Authenticates an existing account"
            :coercion malli/coercion
            :parameters {:body [:map [:email string?] pass-schema]}
            :handler authenticate-account!}}]
   ["/logout"
    {:get {:name ::logout
            :summary "Logs the user out and deletes their cookies"
            :coercion malli/coercion
            :handler logout!}}]])
