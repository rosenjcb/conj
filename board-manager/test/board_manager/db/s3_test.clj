(ns board-manager.db.s3-test
  (:require [board-manager.query.db.s3 :as db.s3]
            [cognitect.aws.client.api :as aws]
            [clojure.test :refer [deftest is testing]]))

(defn- peek-object-fake [_ _ filename]
  (some? (#{"test.png" "test-1.png" "test-2.png" "test-3.png" "test-4.png"} filename)))

(deftest upload-object
  (testing "Uploading nonexistant file works first loop"
    (with-redefs [aws/invoke (constantly nil)
                  db.s3/peek-object (constantly false)]
      (is (= {:filename "test.png" :location "https://conj-images.s3.amazonaws.com/test.png"}
             (db.s3/upload-object nil "conj-images" "test.png" nil)))))
  (testing "Uploading existant file works after some retries"
    (with-redefs [aws/invoke (constantly nil)
                  db.s3/peek-object peek-object-fake]
      (is (= {:filename "test-5.png" :location "https://conj-images.s3.amazonaws.com/test-5.png"}
             (db.s3/upload-object nil "conj-images" "test.png" nil))))))