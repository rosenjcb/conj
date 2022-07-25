(ns board-manager.middleware-test
  (:require [board-manager.middleware :as middleware]
            [board-manager.query.account :as q.account]
            [clojure.test :refer :all]))

(def wrap-auth-fn (middleware/wrap-auth (constantly true)))
(def wrap-admin-fn (middleware/wrap-admin (constantly true)))

(def expired-token "eyJhbGciOiJSUzI1NiJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0Lm1jdGVzdEBwZXBlY2hhbi5vcmciLCJsYXN0X3JlcGx5IjoxNjU3NjE0ODI3LCJsYXN0X3RocmVhZCI6MTY1NzYxNDY4OSwiZXhwIjoxNjU3ODQ1ODIwfQ.SEFlCwyCATRf-o5hP4ArVD2SzNgMO_6sCAxmewqZWzG4cv6OPTvp3hjTizv3Ak0fconiPiXl2zQujrdZ4-2zrSEnvpPRw6Um9HW-3mk5zcrn2sRwhoTPbnqvRqN0p7A_r9v68JIqDEw0RkabYVeTSKOqjUyyXQFGwTbuvlNd2CIxgWAHY2qyq2jVrfHC7QxahpEMiiWdEWe2KDc8mdOiPbKBxLwPUZ7meaPjBmYOQTXBgGY3bKVBZykp2c2EWbiq6g4gHspxjmqabmqOjRbp6lSOnXlJYB1PtzLVtulWwo8aI0eW_MzAV1q2lzl9CQqIl2SDUAmfvAIUHiHz9J72Pw")

(def valid-user {:id 1 :role "user" :email "test.mctest@test.com" :last_post nil :last_thread nil})

(def valid-admin {:id 1 :role "admin" :email "test.mctest@test.com" :last_post nil :last_thread nil})

(def expired-token-response 
  {:status 401
   :headers {}
   :body "Access token does not exist or has expired."})

(def no-token-response
  {:status 401 
   :headers {}
   :body "No access token found."})

(def insufficient-permissions-response 
  {:status 401 
   :headers {} 
   :body "You have insufficient permissions to do that."})

(deftest test-wrap-auth
  (testing "Valid user token authorizes user"
    (with-redefs [middleware/fetch-cookie&account (constantly {:cookie "something" :auth valid-user})]
      (is (= true (wrap-auth-fn nil))))
  (testing "Invalid user token returns 401 no auth"
    (with-redefs [middleware/fetch-cookie&account (constantly {:cookie nil :auth nil})]
      (is (= no-token-response (wrap-auth-fn nil)))))))
;;   (testing "Expired user token returns 401 expired token"
;;     (with-redefs [middleware/fetch-cookie&account (constantly {:cookie "something" :auth valid-user})]
;;       (is (= true (wrap-auth-fn nil)))))))

(deftest test-wrap-admin
  (testing "Valid user token authorizes user"
    (with-redefs [q.account/find-account-by-id! (constantly valid-admin)]
      (is (= true (wrap-admin-fn nil))))
  (testing "Invalid user token returns 401 no auth"
    (with-redefs [q.account/find-account-by-id! (constantly nil)]
      (is (= insufficient-permissions-response (wrap-admin-fn nil)))))))
