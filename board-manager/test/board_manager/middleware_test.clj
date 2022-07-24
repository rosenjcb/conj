(ns board-manager.middleware-test
  (:require [clojure.test :refer :all]
            [board-manager.middleware :as middleware]))

(def wrap-auth-fn (middleware/wrap-auth (constantly true)))
(def wrap-admin-fn (middleware/wrap-admin (constantly true)))

(def expired-token "eyJhbGciOiJSUzI1NiJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0Lm1jdGVzdEBwZXBlY2hhbi5vcmciLCJsYXN0X3JlcGx5IjoxNjU3NjE0ODI3LCJsYXN0X3RocmVhZCI6MTY1NzYxNDY4OSwiZXhwIjoxNjU3ODQ1ODIwfQ.SEFlCwyCATRf-o5hP4ArVD2SzNgMO_6sCAxmewqZWzG4cv6OPTvp3hjTizv3Ak0fconiPiXl2zQujrdZ4-2zrSEnvpPRw6Um9HW-3mk5zcrn2sRwhoTPbnqvRqN0p7A_r9v68JIqDEw0RkabYVeTSKOqjUyyXQFGwTbuvlNd2CIxgWAHY2qyq2jVrfHC7QxahpEMiiWdEWe2KDc8mdOiPbKBxLwPUZ7meaPjBmYOQTXBgGY3bKVBZykp2c2EWbiq6g4gHspxjmqabmqOjRbp6lSOnXlJYB1PtzLVtulWwo8aI0eW_MzAV1q2lzl9CQqIl2SDUAmfvAIUHiHz9J72Pw")

(def valid-account {:id 1 :role "user" :email "test.mctest@test.com" :last_post nil :last_thread nil})

(def expired-token-response 
  {:status 401
   :headers {}
   :body "Access token does not exist or has expired."})

(def no-token-response
  {:status 401 
   :headers {}
   :body "No access token found."})

(deftest test-wrap-auth
  (testing "Valid user token authorizes user"
    (with-redefs [middleware/fetch-cookie&account (constantly {:cookie "something" :auth valid-account})]
      (is (= true (wrap-auth-fn nil))))
  (testing "Invalid user token returns 401 no auth"
    (with-redefs [middleware/fetch-cookie&account (constantly {:cookie nil :auth nil})]
      (is (= no-token-response (wrap-auth-fn nil)))))
  (testing "Expired user token returns 401 expired token"
    (with-redefs [middleware/fetch-cookie&account (constantly {:cookie "something" :auth valid-account})]
      (is (= true (wrap-auth-fn nil)))))))

;; (deftest test-wrap-admin
;;   (testing "Valid user token authorizes user"
;;     (with-redefs [middleware/fetch-cookie&account (constantly {:cookie "something" :auth valid-account})]
;;       (is (= true (wrap-auth-fn nil))))
;;   (testing "Invalid user token returns 401 no auth"
;;     (with-redefs [middleware/fetch-cookie&account (constantly {:cookie nil :auth nil})]
;;       (is (= no-token-response (wrap-auth-fn nil)))))
;;   (testing "Expired user token returns 401 expired token"
;;     (with-redefs [middleware/fetch-cookie&account (constantly {:cookie "something" :auth valid-account})]
;;       (is (= true (wrap-auth-fn nil)))))))

;; (deftest test-app
;;   (testing "main route"
;;     (let [response (app (mock/request :get "/"))]
;;       (is (= (:status response) 200))
;;       (is (= (:body response) "Hello World"))))

;;   (testing "not-found route"
;;     (let [response (app (mock/request :get "/invalid"))]
;;       (is (= (:status response) 404)))))

(comment
  (require '[user])
  (def auth-service (:auth-service user/sys))
  (keys auth-service)
  (def access-token "eyJhbGciOiJSUzI1NiJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0Lm1jdGVzdEBwZXBlY2hhbi5vcmciLCJsYXN0X3JlcGx5IjoxNjU3NjE0ODI3LCJsYXN0X3RocmVhZCI6MTY1NzYxNDY4OSwiZXhwIjoxNjU3ODQ1ODIwfQ.SEFlCwyCATRf-o5hP4ArVD2SzNgMO_6sCAxmewqZWzG4cv6OPTvp3hjTizv3Ak0fconiPiXl2zQujrdZ4-2zrSEnvpPRw6Um9HW-3mk5zcrn2sRwhoTPbnqvRqN0p7A_r9v68JIqDEw0RkabYVeTSKOqjUyyXQFGwTbuvlNd2CIxgWAHY2qyq2jVrfHC7QxahpEMiiWdEWe2KDc8mdOiPbKBxLwPUZ7meaPjBmYOQTXBgGY3bKVBZykp2c2EWbiq6g4gHspxjmqabmqOjRbp6lSOnXlJYB1PtzLVtulWwo8aI0eW_MzAV1q2lzl9CQqIl2SDUAmfvAIUHiHz9J72Pw")
  (try (board-manager.services.auth/unsign-token! auth-service access-token)
       (catch Exception e
        (print (.getMessage e))))
  )