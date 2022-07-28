(ns board-manager.model.api.account-test
  (:require [board-manager.model.api.account :as api.account]
            [clojure.test :refer :all]))

(deftest username-tests 
  (let [too-big (apply str (repeat 33 "x"))
        valid-username "vallarta22"]
  (testing "Valid username should return true, invalid username returns false"
    (is (= false (api.account/username? nil)))
    (is (= false (api.account/username? "")))
    (is (= false (api.account/username? too-big)))
    (is (= true (api.account/username? valid-username))))))

(deftest pass-tests 
  (let [too-big (apply str (repeat 33 "x"))
        too-small "xjwu"
        invalid-characters "12345///"
        valid-username "vallarta22"]
  (testing "Valid username should return true, invalid username returns false"
    (is (= false (api.account/pass? nil)))
    (is (= false (api.account/pass? "")))
    (is (= false (api.account/pass? too-big)))
    (is (= false (api.account/pass? too-small)))
    (is (= false (api.account/pass? invalid-characters)))
    (is (= true (api.account/pass? valid-username))))))

(deftest email-tests 
  (let [no-domain "test"
        no-domain-name "haha@.com" 
        no-domain-extension "haha@test"
        valid-email "test@test.com"]
  (testing "Valid username should return true, invalid username returns false"
    (is (= false (api.account/email? nil)))
    (is (= false (api.account/email? "")))
    (is (= false (api.account/email? no-domain)))
    (is (= false (api.account/email? no-domain-name)))
    (is (= false (api.account/email? no-domain-extension)))
    (is (= true (api.account/email? valid-email))))))
