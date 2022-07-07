(ns board-manager.query.db.s3
  (:require [clojure.tools.logging :as logging]
            [cognitect.aws.client.api :as aws]))

(defn- file-location [bucket filename])

(defn upload-object [client bucket-name filename inputstream]
  (logging/infof "Uploading to bucket: %s name: %s" bucket-name filename)  
  (aws/invoke client {:op :PutObject :request {:Bucket bucket-name :Key filename :Body inputstream}})
  {:filename filename :location (format "https://%s.s3.amazonaws.com/%s" bucket-name filename)})

(comment
  (require '[cognitect.aws.client.api :as aws])
  (def s3 (aws/client {:api :s3 :region :us-west-2}))
  (def all-ops (map #(get % 0) (aws/ops s3)))
  (clojure.pprint/pprint all-ops)
  (filter #(clojure.string/includes? % "Put") all-ops)
  (second (aws/ops s3))
  (map #(get % :name) (aws/ops s3))
  (aws/invoke s3 {:op :ListBuckets})
  ;; (aws/invoke s3 {:op :CreateBucket})
  (aws/invoke s3 {:op :something})
  (def s3-client (:s3-client user/sys))
  (def res (upload-object s3-client "conj-images" "testing" (.getBytes "this is a test")))
  (keys res)
  (aws/invoke s3-client {:op :GetObject :request {:Bucket "conj-images" :Key "test"}})
  (aws/doc s3-client :ListObjectsV2)
  (-> s3-client aws/ops res :response))