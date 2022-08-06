(ns board-manager.model.account 
  (:require [board-manager.util.uri :as util.uri]))

(def schema 
  [:map
   [:id number?]
   [:email string?]
   [:pass string?]
   [:last_post inst?]
   [:last_thread inst?]
   [:role [:enum "user" "admin"]]
   [:username string?]
   [:avatar util.uri/uri?]])

(def id :id)

(def email :email)

(def pass :pass)

(def last-reply :last_reply)

(def last-thread :last_thread)

(def role :role)

(def ^:const user-role "user")

(def ^:const admin-role "admin")

(def username :username)

(def avatar :avatar)