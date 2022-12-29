(ns board-manager.model.thread
  (:require 
    [board-manager.model.post :as m.post]))

(def schema 
  [:vector
   [:map m.post/schema]])

#_{:clj-kondo/ignore [:redefined-var]}
(defn sort [threads] 
  (if (seq threads)
    (->> (sort-by (comp - :id last) threads))
    threads))

(defn preview [length t]
  (let [no-op (drop 1 t)]
  (conj (take-last length no-op) (first t))))

(defn ->thread
  "Takes a given API request and generates a new thread"
  [req account-id thread-id]
  (let [{:strs [subject comment image is_anonymous]} req]
    [{:id thread-id :account_id account-id :subject subject :comment comment :image image :is_anonymous (boolean (Boolean/valueOf is_anonymous))}]))

(defn anonymous?
  [thread]
  (->> (first thread)
        m.post/is-anonymous))

(defn add-post [post thread]
  (conj thread post))

(defn locked? [thread]
  (let [op (first thread)]
    (:locked op)))

(defn op [thread]
  (first thread))

(defn find-post [thread post-id]
  (first (filter #(= (m.post/id %) post-id) thread)))
