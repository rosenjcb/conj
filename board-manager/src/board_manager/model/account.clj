(ns board-manager.model.account)

(def schema 
  [:map
   [:id number?]
   [:email string?]
   [:pass string?]
   [:last_post inst?]
   [:last_thread inst?]])

(def id :id)

(def email :email)

(def pass :pass)

(def last-reply :last_reply)

(def last-thread :last_thread)
