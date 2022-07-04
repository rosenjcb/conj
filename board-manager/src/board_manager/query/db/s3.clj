(ns board-manager.query.db.s3
  (:require 
   [cognitect.aws.client.api :as aws]))

(defn upload-object [client bucket-name file-name object]
  (aws/invoke client {:op :PutObject :request {:Bucket bucket-name :Key file-name :Body object}}))

;; (comment
;;   (require '[cognitect.aws.client.api :as aws])
;;   (def s3 (aws/client {:api :s3 :region :us-west-2}))
;;   (def client (aws/client {:api :s3 :region :us-west-2}))
;;   (def all-ops (map #(get % 0) (aws/ops s3)))
;;   (filter #(clojure.string/includes? % "Put") all-ops)
;;   (second (aws/ops s3))
;;   (map #(get % :name) (aws/ops s3))
;;   (aws/invoke client {:op :ListBuckets})
;;   (aws/invoke client {:op :CreateBucket})
;;   (aws/invoke client {:op :something})
;;   (upload-object "conj-images" "test" "this is a test"))