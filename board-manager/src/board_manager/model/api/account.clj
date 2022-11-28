(ns board-manager.model.api.account
  (:require [board-manager.model.api.common :as api.common]
            [board-manager.util.uri :as util.uri]))

(def conj-provider "conj")
(def google-provider "google")
(def oauth-providers #{conj-provider google-provider})

(defn oauth-provider? 
  [s]
  (some? (oauth-providers s)))

(defn email? [s]
  (let [re-email #"[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"]
    (and (string? s) (some? (re-matches re-email s)))))

(defn pass? [s]
  (let [re-pass #"[A-Za-z\d@$!%*?&]{6,20}$"]
    (and (string? s) (some? (re-matches re-pass s)))))

(defn username? [s]
  (let [re-username #"[A-Za-z\d@$!%*?&]{1,16}$"]
    (and (string? s) (some? (re-matches re-username s)))))

(def email
  [:email 
   [:fn 
    {:error/message "Email must be a valid address."}
    email?]])

(def pass 
  [:pass 
   [:fn 
    {:error/message "Password must be between 6 and 20 alphanumeric characters."}
    pass?]])

(def username
  [:username
   [:fn
    {:error/message "Username must be between 1 and 16 characters"}
    username?]])

(def avatar
  [:avatar
   [:fn
    {:error/message "Avatar picture must be a valid image file"}
    map?]])

(def provider-fn
  [:provider
   [:fn
    {:error/message "No valid oauth provider found"}
    oauth-provider?]])

(def code-fn
  [:code
   [:fn
    {:error/message "No valid oauth provider found"}
    string?]])

(def redirect-uri
  [:redirectUri
   [:fn
    {:error/message "No valid redirect-uri found"}
    util.uri/uri?]])

(def conj-account
  [:map
   email
   pass
   username
   (api.common/optional avatar)])

(def google-account
  [:map
   provider-fn
   username
   (api.common/optional avatar)])

(def new-account
  [:enum
   conj-account
   google-account])

(def conj-auth
  [:map
    {:closed true}
    email
    pass
    provider-fn])

(def google-auth 
  [:map
   {:closed true}
   provider-fn
   code-fn
   redirect-uri])

(def auth-account 
  [:or
   conj-auth
   google-auth])

(def update-me
  [:map
   {:closed true}
   (api.common/optional username)
   (api.common/optional email)
   (api.common/optional avatar)])
