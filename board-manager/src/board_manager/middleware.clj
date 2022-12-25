(ns board-manager.middleware 
  (:require [board-manager.model.account :as m.account]
            [board-manager.query.account :as q.account]
            [board-manager.services.auth :as auth.service]))

(defn- fetch-cookie&account [request]
  (let [auth-service (get-in request [:components :auth-service])
        cookie (:cookies request)
        access-token (get-in cookie ["access_token" :value])
        unsigned-auth (when access-token (auth.service/unsign-token! auth-service access-token))]
    {:cookie cookie :auth unsigned-auth}))

(defn wrap-onboarding [handler]
  (fn [request]
    (let [{:keys [auth]} (fetch-cookie&account request)
      db-conn (get-in request [:components :db-conn])
      account-id (m.account/id auth)
      account (q.account/find-account-by-id! db-conn account-id)
      is-onboarding (m.account/is-onboarding account)]
    (if (not is-onboarding)
      (handler request)
      {:status 401 :headers {} :body "You need to complete onboarding before doing that."}))))

(defn wrap-auth [handler]
  (fn [request]
    (try
      (let [{:keys [cookie auth]} (fetch-cookie&account request)]
        (if cookie
          (if auth 
            (handler (assoc request :account auth))
            {:status 401
             :headers {}
             :body "Access token does not exist or has expired."})
          {:status 401 
           :headers {}
           :body "No access token found."}))
      (catch Exception e
        {:status 401
         :headers {}
         :body (.getMessage e)}))))

(defn full-wrap-auth [handler]
  (-> handler
      wrap-auth
      wrap-onboarding))

(defn wrap-admin [handler]
  (fn [request]
    (let [{:keys [auth]} (fetch-cookie&account request)
          db-conn (get-in request [:components :db-conn])
          account-id (m.account/id auth)
          account (q.account/find-account-by-id! db-conn account-id)
          role (m.account/role account)]
      (condp = role
        m.account/user-role {:status 401 :headers {} :body "You have insufficient permissions to do that."}
        m.account/admin-role (handler request)
        {:status 401 :headers {} :body "You have insufficient permissions to do that."}))))
