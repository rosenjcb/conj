(ns board-manager.model.thread
  (:require [clojure.tools.logging :as log]))

(def schema 
  [:vector
   [:map
    [:name {:optional true} string?] 
    [:subject {:optional true} string?]
    [:comment string?]]])

(defn model->data [t])
(defn data->model [d])

(defn req->thread
  "Takes a given API request and generates a new thread"
  [req]
    (log/infof (str req)) 
    (let [{:keys [name subject comment]} req]
      [{:id 1 :name name :subject subject :comment comment}]))

(def id :id)

