(ns board-manager.model.account)

(def schema 
  [:map
   [:id number?]
   [:email string?]
   [:pass string?]])

(def id :id)

(def email :email)

(def pass :pass)
