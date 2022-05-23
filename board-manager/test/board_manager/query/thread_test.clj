(ns board-manager.query.thread-test
  (:require [board-manager.query.accountinventory :as q.accountinventory]
            [board-manager.query.counter :as q.counter]
            [board-manager.query.db.redis :as db.redis]
            [board-manager.query.image :as q.image]
            [board-manager.query.thread :as q.thread]
            [clojure.test :refer [deftest is testing]]))

(def example-account {:id 19 :email "test@test.com"})

(def base-request {:id 1 :name "Anonymous" :subject "" :comment "" :image ""})

(def example-image {:id 19 :name "snot-pepe" :location "" :rarity "common"})

(def basic-thread [{:id 100 :name "Anonymous" :subject "" :image ""}])

(def example-item [{:id 1 :account_id 1 :image_id 19}])

(deftest validate-post
  (testing "Valid original posts return nil (do not throw)"
    (let [post-comment "Lorem ipsum facto 15 char."
          image-name "snot-pepe"
          valid-thread-post (assoc base-request :comment post-comment :image image-name)]
      (is (= nil (#'q.thread/validate-create-thread valid-thread-post)))))
  (testing "Invalid subjects and names throw errors"
    (let [invalid-subject (apply str (repeat 51 "a"))
          invalid-name (apply str (repeat 31 "a"))
          subject-too-long (assoc base-request :subject invalid-subject)
          name-too-long (assoc base-request :name invalid-name)]
      (is (thrown-with-msg? java.lang.Exception #"Subject is above character limit 51/50" (#'q.thread/validate-create-thread subject-too-long)))
      (is (thrown-with-msg? java.lang.Exception #"Name is above character limit 31/30." (#'q.thread/validate-create-thread name-too-long)))))
  (testing "Valid original posts return nil (do not throw)"
    (let [post-comment "Lorem ipsum facto 15 char."
          image-name "snot-pepe"
          valid-thread-post (assoc base-request :comment post-comment :image image-name)]
      (is (= nil (#'q.thread/validate-create-thread valid-thread-post)))))
   (testing "Invalid original posts throw errors"
       (let [too-short "spam"
             too-long (apply str (repeat 5001 "a"))
             valid-comment "Lorem ipsum facto 15 char."
             image-name "snot-pepe"
             not-enough-chars (assoc base-request :image image-name :comment too-short)
             too-many-chars (assoc base-request :image image-name :comment too-long)
             no-image-provided (assoc base-request :image "" :comment valid-comment)]
        (is (thrown-with-msg? java.lang.Exception #"Comment is below 15 characters." (#'q.thread/validate-create-thread not-enough-chars)))
        (is (thrown-with-msg? java.lang.Exception #"Comment is above character limit 5001/5000." (#'q.thread/validate-create-thread too-many-chars)))
        (is (thrown-with-msg? java.lang.Exception #"An image is required for posting threads. Try replying to a thread to collect pepes." (#'q.thread/validate-create-thread no-image-provided)))))
  (testing "Valid original posts return nil (do not throw)"
    (let [post-comment "Lorem ipsum facto 15 char."
          image-name "snot-pepe"
          valid-via-image (assoc base-request :image image-name)
          valid-via-comment (assoc base-request :comment post-comment)
          valid-via-comment&image (assoc base-request :comment post-comment :image image-name)]
      (is (= nil (#'q.thread/validate-add-post valid-via-image)))
      (is (= nil (#'q.thread/validate-add-post valid-via-comment)))
      (is (= nil (#'q.thread/validate-add-post valid-via-comment&image)))))
   (testing "Invalid replies throw errors"
       (let [too-long (apply str (repeat 5001 "a"))
             image-name "snot-pepe"
             too-many-chars (assoc base-request :image image-name :comment too-long)
             blank-reply base-request]
        (is (thrown-with-msg? java.lang.Exception #"Comment is above character limit 5001/5000." (#'q.thread/validate-add-post too-many-chars)))
        (is (thrown-with-msg? java.lang.Exception #"Either a non-empty comment or image is required for replies." (#'q.thread/validate-add-post blank-reply))))))
