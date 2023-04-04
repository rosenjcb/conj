(ns board-manager.query.thread-test
  (:require [board-manager.model.thread :as m.thread]
            [board-manager.query.account :as q.account]
            [board-manager.query.db.redis :as db.redis]
            [board-manager.query.thread :as q.thread]
            [clojure.test :refer [deftest is testing]]
            [java-time :as t]))

(def base-request {:id 1 :username "Anonymous" :subject "" :comment "" :image nil})

(def test-account {:id 1 :email "test@test.com" :username "test.mctest" :last_reply (t/sql-timestamp) :last_thread (t/sql-timestamp)})

(def jane-account (assoc test-account :id 2 :username "jane1992" :email "jane@gmail.com"))

(def bob-account (assoc test-account :id 3 :username "bobbyhill94" :email "bobby.hill@strickland.com"))

(def basic-post {:id 100 :account_id 1 :username "test.mctest" :subject "" :image nil :comment "" :is_anonymous false})

(def basic-thread [basic-post])

(def unsorted-threads (vec (map #(assoc-in basic-thread [0 :id] %) [101 99 87 22 94 105])))

(def sorted-threads (vec (map #(assoc-in basic-thread [0 :id] %) [105 101 99 94 87 22])))

(def max-thread (->> (repeat (+ q.thread/max-post-count 1) base-request)
                     (map-indexed (fn [i v] (assoc v :id (+ i (:id v)))))
                     (into [])))

(defn- subtract-minutes [min time]
  (let [instant (t/local-date-time time)]
    (t/sql-timestamp (t/minus instant (t/minutes min)))))

(defn- subtract-seconds [min time]
  (let [instant (t/local-date-time time)]
    (t/sql-timestamp (t/minus instant (t/seconds min)))))

(deftest validate-post
  (testing "Valid original posts return nil (do not throw)"
    (let [post-comment "Lorem ipsum facto 15 char."
          image {:filename "snot-pepe" :tempfile nil}
          valid-thread-post (assoc base-request :comment post-comment :image image)]
      (is (= nil (#'q.thread/validate-create-thread valid-thread-post)))))
  (testing "Invalid subjects and names throw errors"
    (let [invalid-subject (apply str (repeat 51 "a"))
          subject-too-long (assoc base-request :subject invalid-subject)]
      (is (thrown-with-msg? java.lang.Exception #"Subject is above character limit 51/50" (#'q.thread/validate-create-thread subject-too-long)))))
  (testing "Valid original posts return nil (do not throw)"
    (let [post-comment "Lorem ipsum facto 15 char."
          image {:filename "snot-pepe" :tempfile nil}
          valid-thread-post (assoc base-request :comment post-comment :image image)]
      (is (= nil (#'q.thread/validate-create-thread valid-thread-post))))
    (testing "Invalid original posts throw errors"
      (let [too-short "spam"
            too-long (apply str (repeat 5001 "a"))
            image {:filename "snot-pepe" :tempfile nil}
            not-enough-chars (assoc base-request :image image :comment too-short)
            too-many-chars (assoc base-request :image image :comment too-long)
            too-early (update test-account :last_thread (partial subtract-minutes 3))]
        (is (thrown-with-msg? java.lang.Exception #"Comment is below 5 characters." (#'q.thread/validate-create-thread not-enough-chars)))
        (is (thrown-with-msg? java.lang.Exception #"Comment is above character limit 5001/5000." (#'q.thread/validate-create-thread too-many-chars)))
        (is (thrown-with-msg? java.lang.Exception #"Only 3 minutes have passed since your last thread. You must wait 5 minutes between creating new threads." (#'q.thread/validate-thread-time too-early))))))
  (testing "Valid original posts return nil (do not throw)"
    (let [post-comment "Lorem ipsum facto 15 char."
          image {:filename "snot-pepe" :tempfile nil}
          valid-via-image (assoc base-request :image image)
          valid-via-comment (assoc base-request :comment post-comment)
          valid-via-comment&image (assoc base-request :comment post-comment :image image)]
      (is (= nil (#'q.thread/validate-add-post valid-via-image)))
      (is (= nil (#'q.thread/validate-add-post valid-via-comment)))
      (is (= nil (#'q.thread/validate-add-post valid-via-comment&image))))
    (testing "Invalid replies throw errors"
      (let [too-long (apply str (repeat 5001 "a"))
            image {:filename "snot-pepe" :tempfile nil}
            too-many-chars (assoc base-request :image image :comment too-long)
            blank-reply base-request
            too-early (update test-account :last_reply (partial subtract-seconds 30))]
        (is (thrown-with-msg? java.lang.Exception #"Comment is above character limit 5001/5000." (#'q.thread/validate-add-post too-many-chars)))
        (is (thrown-with-msg? java.lang.Exception #"Either a non-empty comment or image is required for replies." (#'q.thread/validate-add-post blank-reply)))
        (is (thrown-with-msg? java.lang.Exception #"Only 30 seconds have passed since your last reply. You must wait 60 seconds between replies." (#'q.thread/validate-reply-time too-early)))))))

(deftest sort-threads
  (testing "Empty threads sorts to empty threads and nil sorts to nil"
    (is (= [] (m.thread/sort [])))
    (is (= nil (m.thread/sort nil))))
  (testing "Unsorted threads sorts to sorted threads"
    (let [actual-sorted-threads (m.thread/sort unsorted-threads)]
      (is (= actual-sorted-threads sorted-threads)))))

(deftest enrich-threads
  (testing "enrich? flag is respected"
    (is (= [] (#'q.thread/enrich-threads nil false [])))
    (is (= [] (#'q.thread/enrich-threads nil false nil))))
  (testing "Empty threads enrich nothing"
    (is (= [] (#'q.thread/enrich-threads nil true [])))
    (is (= [] (#'q.thread/enrich-threads nil true nil))))
  (testing "Thread(s) enrich with nothing when accounts aren't discovered, will enrich with account and avatar when they are found"
    (with-redefs [q.account/find-accounts-by-ids! (constantly (list test-account jane-account bob-account))]
      (let [thread-with-unknown-ids [{:id 100 :account_id 100 :subject "" :image nil :comment "" :is_anonymous false :username nil :avatar nil}
                                     {:id 101 :account_id 101 :subject "" :image nil :comment "" :username nil :avatar nil}
                                     {:id 102 :account_id 102 :subject "" :image nil :comment "" :username nil :avatar nil}]
            thread-with-known-ids [{:id 100 :account_id 1 :subject "" :image nil :comment "" :is_anonymous false}
                                   {:id 101 :account_id 2 :subject "" :image nil :comment ""}
                                   {:id 102 :account_id 3 :subject "" :image nil :comment ""}]
            enriched-thread [{:id 100 :account_id 1 :subject "" :image nil :comment "" :is_anonymous false :username "test.mctest" :avatar nil}
                             {:id 101 :account_id 2 :subject "" :image nil :comment "" :username "jane1992" :avatar nil}
                             {:id 102 :account_id 3 :subject "" :image nil :comment "" :username "bobbyhill94" :avatar nil}]
            multiple-enriched-threads [[{:id 100 :account_id 1 :subject "" :image nil :comment "" :is_anonymous false :username "test.mctest" :avatar nil}
                                        {:id 101 :account_id 2 :subject "" :image nil :comment "" :username "jane1992" :avatar nil}
                                        {:id 102 :account_id 3 :subject "" :image nil :comment "" :username "bobbyhill94":avatar nil}]
                                       [{:id 103 :account_id 1 :subject "" :image nil :comment "" :is_anonymous false :username "test.mctest" :avatar nil}
                                        {:id 104 :account_id 2 :subject "" :image nil :comment "" :username "jane1992" :avatar nil}
                                        {:id 105 :account_id 3 :subject "" :image nil :comment "" :username "bobbyhill94" :avatar nil}]]
            multiple-known-threads [[{:id 100, :account_id 1, :subject "", :image nil, :comment "", :is_anonymous false} 
                                     {:id 101, :account_id 2, :subject "", :image nil, :comment ""} 
                                     {:id 102, :account_id 3, :subject "", :image nil, :comment ""}] 
                                    [{:id 103, :account_id 1, :subject "", :image nil, :comment "", :is_anonymous false} 
                                     {:id 104, :account_id 2, :subject "", :image nil, :comment ""} 
                                     {:id 105, :account_id 3, :subject "", :image nil, :comment ""}]]
            multiple-unknown-threads (list thread-with-unknown-ids thread-with-unknown-ids)]
        (is (= (list enriched-thread) (#'q.thread/enrich-threads nil true thread-with-known-ids)))
        (is (= (list thread-with-unknown-ids) (#'q.thread/enrich-threads nil true thread-with-unknown-ids)))
        (is (= multiple-enriched-threads (#'q.thread/enrich-threads nil true multiple-known-threads)))
        (is (= multiple-unknown-threads (#'q.thread/enrich-threads nil true multiple-unknown-threads)))))))

(deftest thread-locks
  (testing "Threads over the post limit are locked, those aren't are left unchanged."
    (with-redefs [db.redis/set (constantly nil)
                  q.thread/fetch-threads! (constantly nil)]
      (let [expected-thread (assoc-in max-thread [0 :locked] true)]
        (is (= expected-thread (#'q.thread/update-thread! nil nil nil max-thread)))
        (is (= basic-thread (#'q.thread/update-thread! nil nil nil basic-thread)))))))
