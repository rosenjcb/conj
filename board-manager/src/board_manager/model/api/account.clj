(ns board-manager.model.api.account
  (:require [board-manager.model.api.common :as api.common]))

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
    any?]])

(def new-account
  [:map
   email
   pass
   username
   (api.common/optional avatar)])

(def auth-account 
  [:map
   email
   pass])

(def update-me
  [:map
   {:closed true}
   (api.common/optional username)
   (api.common/optional email)])