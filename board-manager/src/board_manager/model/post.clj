(ns board-manager.model.post)

(def schema
  [:map
   [:name {:optional true} string?]
   [:image {:optional true} map?]
   [:comment string?]
   [:time inst?]
   [:is_anonymous boolean?]
   [:account_id {:optional true} int?]])

(defn ->post
  "Takes a given API request and generates a new thread"
  [req account-id id]
  (let [{:strs [comment image is_anonymous]} req]
    {:id id :account_id account-id :comment comment :image image :is_anonymous (Boolean/valueOf is_anonymous)}))

(def id :id)

(def image :image)

(def subject :subject)

#_{:clj-kondo/ignore [:redefined-var]}
(def comment :comment)

#_{:clj-kondo/ignore [:redefined-var]}
(def name :name)

(def is-anonymous :is_anonymous)

(def account-id :account_id)
