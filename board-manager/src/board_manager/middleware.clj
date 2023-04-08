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

(defn wrap-status [handler]
  (fn [request]
    (let [{:keys [auth]} (fetch-cookie&account request)
      db-conn (get-in request [:components :db-conn])
      account-id (m.account/id auth)
      account (q.account/find-account-by-id! db-conn account-id)
      status (m.account/status account)]
    (if (not (= status m.account/status-banned))
      (handler request)
      {:status 401 :headers {} :body "You are banned. Please contact the administrator for further support."}))))

(defn wrap-auth [handler]
  (fn [request]
    (try
      (let [{:keys [cookie auth]} (fetch-cookie&account request)]
        (if cookie
          (if auth 
            (handler (assoc request :account auth))
            {:status 401
             :headers {}
             :body "You need to login before doing that."})
          {:status 401 
           :headers {}
           :body "You're not logged in."}))
      (catch Exception e
        (let [ex-map (ex-data e)
              response {:status 401 :headers {} :body nil}]
          (if (= :validation (:type ex-map))
            (assoc response :body "Your session has expired. Please log back in.")
            (assoc response :body (.getMessage e))))))))

;; The order of operations is last -> first in the threadding macro.
(defn full-wrap-auth [handler]
  (-> handler
      wrap-status
      wrap-auth))

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
