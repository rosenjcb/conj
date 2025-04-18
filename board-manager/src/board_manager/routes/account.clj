(ns board-manager.routes.account
  (:require [board-manager.middleware :as middleware]
            [board-manager.model.account :as m.account]
            [board-manager.model.api.account :as api.account]
            [board-manager.query.account :as q.account]
            [board-manager.query.db.s3 :as db.s3]
            [board-manager.services.auth :as s.auth]
            [board-manager.util.jwt :as util.jwt]
            [clojure.java.io :as io]
            [clojure.tools.logging :as log]
            [clojure.walk :as walk]
            [reitit.coercion.malli :as malli]
            [ring.util.response :as response]
            [board-manager.services.google-client :as google.client])
  (:import [org.postgresql.util PSQLException]))

(def ^:private conj-bucket "conj-images")

(defn get-my-account! [req]
  (let [db-conn (get-in req [:components :db-conn])
        account-id (get-in req [:account :id])
        account (q.account/find-account-by-id! db-conn account-id)]
    (if account
      (response/response account)
      (response/not-found (format "No account with the id %s was found" account-id)))))

(defn- set-cookies [response {:keys [access-token refresh-token]}]
  (assoc response :cookies {"refresh_token" refresh-token "access_token" access-token}))

(defn- replace-avatar
  [s3-client env old-avatar {:keys [filename tempfile]}]
  (let [path (str "/" env "/avatars/")]
    (when old-avatar 
      (log/infof "Deleting old avatar %s" old-avatar)
      (db.s3/delete-object s3-client conj-bucket path old-avatar))
    (db.s3/upload-object s3-client conj-bucket path filename (io/input-stream tempfile))))

(defn create-account! [req]
  (let [auth-service (get-in req [:components :auth-service])
        s3-client (get-in req [:components :s3-client])
        env (get-in req [:components :env])
        account-req (:multipart-params req)]
    (try 
      (let [avatar (get account-req "image")
            {:keys [location]} (when avatar (replace-avatar s3-client env nil avatar))
            account (->> (assoc account-req m.account/avatar location m.account/provider m.account/conj-provider)
                         walk/keywordize-keys
                         (s.auth/add-account! auth-service :conj))]
        (->> (:refresh-token account)
             (set-cookies (response/status 200))))
      (catch PSQLException e
        (log/error e)
        (response/bad-request "An account with that email already exists")))))

(defmulti authenticate-account! (fn [req] (get-in req [:parameters :body :provider])))

(defn- do-authenticate-conj! [req]
  (let [auth-service (get-in req [:components :auth-service])
        credentials (get-in req [:parameters :body])
        conjtoken (s.auth/create-auth-token! auth-service credentials m.account/conj-provider)]
    (if conjtoken 
      (-> (response/status 200)  
          (set-cookies conjtoken))
      (response/bad-request "Wrong username or password. Please try again."))))

(defmethod authenticate-account! "conj" [req] (do-authenticate-conj! req))

(defn do-authenticate-google! [req]
  (try
    (let [db-conn (get-in req [:components :db-conn])
          auth-service (get-in req [:components :auth-service])
          google-client (get-in req [:components :google-client])
          {:keys [redirectUri code]} (get-in req [:parameters :body])
          {:keys [id_token]} (google.client/authorize google-client code redirectUri)
          {:keys [email]} (:payload (util.jwt/decode id_token))
          account (q.account/find-account-by-email! db-conn email)
          user-exists? (some? account)
          new-account (when-not user-exists? (m.account/new-account {m.account/email email m.account/provider m.account/google-provider}))] 
      (when-not user-exists? 
        (log/infof "Creating new google user %s" email)
        (q.account/create-account! db-conn new-account))
      (set-cookies (response/response (or account new-account)) (s.auth/create-auth-token! auth-service {:email email} m.account/google-provider)))
    (catch Exception e
      (log/error e)
      (response/bad-request "Couldn't authenticate Google"))))

(defmethod authenticate-account! "google" [req] (do-authenticate-google! req))

(defn logout! [_]
 (let [resp (response/status 200)] 
   (assoc resp :cookies {:access_token {:value nil} :refresh_token {:value nil}})))

(defn update-account! [req]
  (let [db (get-in req [:components :db-conn])
        s3-client (get-in req [:components :s3-client])
        env (get-in req [:components :env])
        account-id (get-in req [:account :id])
        account (q.account/find-account-by-id! db account-id)
        old-avatar (m.account/avatar account)
        update (walk/keywordize-keys (:multipart-params req))
        avatar (m.account/avatar update)
        {:keys [location]} (when avatar (replace-avatar s3-client env old-avatar avatar))
        final (assoc update m.account/avatar (or location (m.account/avatar account)))]
    (try
      (some-> (q.account/update-account! db final account-id)
              (dissoc m.account/pass)
              response/response)
      (catch Exception e
        (log/errorf e "Error found for account id %s" account-id)
        (response/bad-request "Couldn't update your account for some reason.")))))

(defn onboard-account! [req]
  (let [db (get-in req [:components :db-conn])
        s3-client (get-in req [:components :s3-client])
        env (get-in req [:components :env])
        account-id (get-in req [:account :id])
        account (q.account/find-account-by-id! db account-id)
        {:keys [avatar username]} (walk/keywordize-keys (:multipart-params req))
        is-onboarding (m.account/is-onboarding account)
        {:keys [location]} (when avatar (replace-avatar s3-client env nil avatar))
        final (m.account/finish-onboarding account username (or location (m.account/avatar account)))]
    (if is-onboarding
      (try
        (some-> (q.account/update-account! db final account-id)
                (dissoc m.account/pass)
                response/response)
        (catch Exception e
          (log/errorf e "Error found for account id %s" account-id)
          (response/bad-request "Couldn't finish onboarding the account for some reason.")))
      (response/bad-request "User has already completed onboarding."))))

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
     :put {:summary "Updates a pre-existing account (whoever is signed into the session)"
           :handler update-account!
           :middleware [[middleware/wrap-auth]]
           :coercion malli/coercion
           :parameters {:multipart-params api.account/update-me}}}]
   ["/authenticate"
    {:post {:name ::authenticate-account
            :operationId "authenticate"
            :summary "Authenticates an existing account"
            :coercion malli/coercion
            :parameters {:body api.account/auth-account}
            :handler authenticate-account!}}]
   ["/oauth"
    {:post {:name ::oauth
            :summary "Oauth signup/login an existing account"
            :coercion malli/coercion
            :parameters {:body api.account/google-auth}
            :handler do-authenticate-google!}}]
   ["/onboarding"
    {:post {:name ::onboarding
            :summary "Finishes onboarding for an existing account"
            :coercion malli/coercion
            :middleware [[middleware/wrap-auth]]
            :parameters {:multipart-params api.account/onboard-me}
            :handler onboard-account!}}]
   ["/logout"
    {:get {:name ::logout
           :summary "Logs the user out and deletes their cookies"
           :coercion malli/coercion
           :handler logout!}}]])
