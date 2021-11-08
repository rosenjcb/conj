(ns board-manager.model.post)

(def schema 
  [:map
    [:name {:optional true} string?] 
    [:subject {:optional true} string?]
    [:comment string?]])

(defn model->data [t])
(defn data->model [d])

(defn req&id->post
  "Takes a given API request and generates a new thread"
  [req id]
    (let [{:keys [name subject comment]} req]
      {:id id :name name :subject subject :comment comment}))

(def id :id)