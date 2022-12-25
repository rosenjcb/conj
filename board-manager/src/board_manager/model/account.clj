(ns board-manager.model.account 
  (:require [board-manager.util.uri :as util.uri]))

(def conj-provider "conj")
(def google-provider "google")

(def ^:const user-role "user")

(def ^:const admin-role "admin")

(defn- valid-provider? [provider]
  (#{conj-provider google-provider} provider))

(def id :id)

(def email :email)

(def pass :pass)

(def last-reply :last_reply)

(def last-thread :last_thread)

(def role :role)

(def username :username)

(def avatar :avatar)

(def provider :provider)

(def is-onboarding :is_onboarding)

(def schema 
  [:map
   [id number?]
   [email string?]
   [pass string?]
   [last-reply inst?]
   [last-thread inst?]
   [role [:enum user-role admin-role]]
   [username string?]
   [avatar util.uri/uri?]
   [is-onboarding boolean?]])

(def default 
  {role user-role
   email ""
   pass ""
   username ""
   avatar ""
   provider conj-provider
   is-onboarding true})

(defn new-account
  [account]
  (-> (merge default account)
      (select-keys (keys default))))

(defn finish-onboarding
  ([account new-username] 
   (finish-onboarding account new-username nil))
  ([account new-username new-avatar]
   (assoc account username new-username avatar new-avatar is-onboarding false)))