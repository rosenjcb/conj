(ns board-manager.model.thread
  (:require 
    [clojure.tools.logging :as log]
    [board-manager.model.post :as m.post]))

(def schema 
  [:vector
   [:map m.post/schema]])

;; (defn model->data [t])
;; (defn data->model [d])

(defn req&id->thread
  "Takes a given API request and generates a new thread"
  [req id]
    (let [{:strs [name subject comment image]} req]
      [{:id id :name name :subject subject :comment comment :image image}]))

(defn add-post [post thread]
  (conj thread post))

(def id :id)

(def image :image)