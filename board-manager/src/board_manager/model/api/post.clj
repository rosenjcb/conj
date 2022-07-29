(ns board-manager.model.api.post)

(defn model->response [post account-id username]
  (when post
    (assoc post :account-id account-id :username username)))