(ns board-manager.db.s3-test
  (:require [board-manager.query.db.s3 :as db.s3]
            [cognitect.aws.client.api :as aws]
            [clojure.test :refer [deftest is testing]]))

(defn- peek-object-fake [_ _ filename]
  (some? (#{"/avatars/test.png" "/avatars/test-1.png" "/avatars/test-2.png" "/avatars/test-3.png" "/avatars/test-4.png"} filename)))

(deftest upload-object
  (testing "Uploading nonexistant file works first loop"
    (with-redefs [aws/invoke (constantly nil)
                  db.s3/peek-object (constantly false)]
      (is (= {:filename "test.png" :location "https://conj-images.s3.amazonaws.com/avatars/test.png"}
             (db.s3/upload-object nil "conj-images" "/avatars/" "test.png" nil)))))
  (testing "Uploading existant file works after some retries"
    (with-redefs [aws/invoke (constantly nil)
                  db.s3/peek-object peek-object-fake]
      (is (= {:filename "test-5.png" :location "https://conj-images.s3.amazonaws.com/avatars/test-5.png"}
             (db.s3/upload-object nil "conj-images" "/avatars/" "test.png" nil))))))
