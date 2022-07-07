(ns board-manager.model.post)

(def schema 
  [:map
    [:name {:optional true} string?] 
    [:subject {:optional true} string?]
    [:image {:optional true} map?]
    [:comment string?]])

(defn model->data [t])
(defn data->model [d])

(defn req&id->post
  "Takes a given API request and generates a new thread"
  [req id]
    (let [{:strs [name subject comment image]} req]
      {:id id :name name :subject subject :comment comment :image image}))

(def id :id)

(def image :image)

(def subject :subject)

#_{:clj-kondo/ignore [:redefined-var]}
(def comment :comment)

#_{:clj-kondo/ignore [:redefined-var]}
(def name :name)
