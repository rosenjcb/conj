(ns board-manager.services.google-client
   (:require [clj-http.client :as client]
             [clojure.string :as str]
             [clojure.tools.logging :as log]
             [com.stuartsierra.component :as component]
             [lambdaisland.uri :as uri]))
 
 ;; See also https://developers.google.com/identity/protocols/OAuth2
 
 ;; This URL retrieves the OAuth code for access token retrieval
 (def auth-url "https://accounts.google.com/o/oauth2/v2/auth")
 (def token-refresh-url "https://www.googleapis.com/oauth2/v4/token")
 
 ;; See https://developers.google.com/identity/protocols/googlescopes
 (def oauth-scopes
   (str/join " "
             [;; For contacts
              "https://www.google.com/m8/feeds"
              ;; For calendar
              "https://www.googleapis.com/auth/calendar"
              ;; For email address
              "https://www.googleapis.com/auth/userinfo.email"
              ;; For first/last name
              "https://www.googleapis.com/auth/userinfo.profile"]))
 
 (def gmail-oauth-scope "https://www.googleapis.com/auth/gmail.readonly")
 
 (def prompt-type-select-account "select_account")
 ;; Use consent to include refresh_token in response
 (def prompt-type-select-account-consent "select_account consent")
 
 (def common-request-opts {:accept :json
                           :as :json
                           :socket-timeout 10000
                           :conn-timeout 10000
                           :throw-entire-message? true})
 
 (defn- do-authorize [client-id client-secret auth-code redirect-uri]
   {:pre [(not (str/blank? client-id))
          (not (str/blank? client-secret))
          (not (str/blank? auth-code))
          (not (str/blank? redirect-uri))]}
   (let [body {:code auth-code
               :client_id client-id
               :client_secret client-secret
               :redirect_uri redirect-uri
               :grant_type "authorization_code"}
         opts (assoc common-request-opts :form-params body)]
     (-> (client/post token-refresh-url opts)
         :body)))
 
 (defn- do-get-access-token [client-id client-secret refresh-token]
   {:pre [(not (str/blank? client-id))
          (not (str/blank? client-secret))
          (not (str/blank? refresh-token))]}
   (let [body {:refresh_token refresh-token
               :client_id client-id
               :client_secret client-secret
               :grant_type "refresh_token"}
         opts (assoc common-request-opts :form-params body)]
     (-> (client/post token-refresh-url opts)
         :body
         :access_token)))
 
 (defn- do-get-oauth-url
   ([client-id redirect-uri state]
    (do-get-oauth-url client-id redirect-uri state oauth-scopes prompt-type-select-account))
   ([client-id redirect-uri state scope prompt-type]
    {:pre [(not (str/blank? client-id))
           (not (str/blank? redirect-uri))]}
    (let [query-params
          {:access_type "offline"
           :client_id client-id
           :prompt prompt-type
           :redirect_uri redirect-uri
           :response_type "code"
           :scope scope
           :state state}]
      (str auth-url "?" (uri/map->query-string query-params)))))
 
 (defprotocol AuthApi
   (authorize [this auth-code redirect-uri]
     "Authorize using auth token, a success returns access and refresh tokens")
   (get-access-token [this refresh-token]
     "Gets the access-token given the refresh-token")
   (get-oauth-url [this redirect-uri state] [this redirect-uri state scope prompt-type]
     "Gets the OAuth URL from which the client will retrieve the OAuth code."))
 
 (defrecord AuthApiClient [client-id client-secret]
   component/Lifecycle
   (start [this]
     (log/info "Setting up AuthApiClient")
     this)
 
   (stop [this]
     (log/info "Tearing down AuthApiClient")
     this)
 
   AuthApi
   (authorize [this auth-code redirect-uri]
     (do-authorize client-id client-secret auth-code redirect-uri))
   (get-access-token [_ refresh-token]
     (do-get-access-token client-id client-secret refresh-token))
   (get-oauth-url [_ redirect-uri state]
     (do-get-oauth-url client-id redirect-uri state))
   (get-oauth-url [_ redirect-uri state scope prompt-type]
     (do-get-oauth-url client-id redirect-uri state scope prompt-type)))
 
 (defn new-api-client [client-id client-secret]
   {:pre [(not (str/blank? client-id))
          (not (str/blank? client-secret))]}
   (map->AuthApiClient {:client-id client-id
                        :client-secret client-secret}))


(comment
  (user/go)
  (def google-client (:google-client user/sys))
  (def code "4/0AfgeXvtuL1LOzW5kaR5CVxSEXOl3qGe-lBXQog4bHNZMIB16Pd2K-RSaMfyD9wK-ziEoIQ")
  (authorize google-client code "https://conj.app/oauth"))