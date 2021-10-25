(ns board-manager.model.thread)

(def schema 
  [:map
   ["name" {:optional true} string?] 
   ["subject" {:optional true} string?]
   ["comment" string?]])

(defn req->thread
  "Takes a given API request and generates a new thread"
  [req]
    (let [{:strs [name subject comment]} req]
      {:id 1 :name name :subject subject :comment comment}))

(def id :id)