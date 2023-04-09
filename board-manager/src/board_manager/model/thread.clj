(ns board-manager.model.thread
  (:require 
    [board-manager.model.post :as m.post]))

(def schema 
  [:vector
   [:map m.post/schema]])

(defn ->thread [{:strs [subject] :as req} account-id post]
  (assoc (m.post/->post req account-id post) :subject subject))

#_{:clj-kondo/ignore [:redefined-var]}
(defn sort [threads] 
  (if (seq threads)
    (->> (sort-by (comp - :id last) threads))
    threads))

(defn preview [length t]
  (let [no-op (drop 1 t)]
  (conj (take-last length no-op) (first t))))

(defn add-post [post thread]
  (conj thread post))

(defn locked? [thread]
  (let [op (first thread)]
    (:locked op)))

(defn op [thread]
  (first thread))

(defn find-post [thread post-id]
  (first (filter #(= (m.post/id %) post-id) thread)))
