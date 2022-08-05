(ns board-manager.model.post)

(def schema
  [:map
   [:name {:optional true} string?]
   [:subject {:optional true} string?]
   [:image {:optional true} map?]
   [:comment string?]
   [:time inst?]
   [:is_anonymous {:optional true} boolean?]
   [:account_id {:optional true} int?]])

(defn ->post
  "Takes a given API request and generates a new thread"
  [req account-id id]
  (let [{:strs [subject comment image]} req]
    {:id id :account_id account-id :subject subject :comment comment :image image}))

(def id :id)

(def image :image)

(def subject :subject)

#_{:clj-kondo/ignore [:redefined-var]}
(def comment :comment)

#_{:clj-kondo/ignore [:redefined-var]}
(def name :name)

(def is_anonymous :is_anonymous)

(def account_id :account_id)

(defn op? [post]
  (some? (is_anonymous post)))
