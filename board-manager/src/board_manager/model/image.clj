(ns board-manager.model.image
  (:refer-clojure :exclude [name]))

(def schema 
  [:map
   [:id number?]
   [:name string?]
   [:location uri?]])

(def id :id)

(def name :name)

(def location :location)