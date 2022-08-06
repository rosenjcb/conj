(ns board-manager.model.api.post)

(def username :username)

(def account-id :account_id)

(def avatar :avatar)

;; Think about adding schema validation here
(defn model->response [post username avatar]
  (when post
    (assoc post :username username :avatar avatar)))
