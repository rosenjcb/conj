(ns board-manager.model.api.post)

(def username :username)

(def account-id :account_id)

(defn model->response [post name]
  (when post
    (if name 
      (assoc post username name)
      post)))
