(ns board-manager.middleware 
  (:require [board-manager.services.auth :as auth.service]))

(defn wrap-auth [handler]
  (fn [request]
    (let [auth-service (get-in request [:components :auth-service])
          cookie (:cookies request)
          access-token (get-in cookie ["access_token" :value])
          unsigned-auth (when access-token (auth.service/unsign-token! auth-service access-token))]
      (if cookie
        (if unsigned-auth 
          (handler (assoc request :account unsigned-auth))
          {:status 401
           :headers {}
           :body "Access token does not exist or has expired."})
        {:status 401 
         :headers {}
         :body "No access token found."}))))
