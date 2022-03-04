(ns board-manager.model.image
  (:refer-clojure :exclude [name]))

(def schema 
  [:map
   [:id number?]
   [:name string?]
   [:location uri?]
   [:rarity string?]])

(def id :id)

(def name :name)

(def location :location)

(def rarity :rarity)
