(ns board-manager.query.db.s3
  (:require [clojure.tools.logging :as logging]
            [cognitect.aws.client.api :as aws]))

(defn peek-object [client bucket-name filename]
  (let [s3-object-attrs (aws/invoke client {:op :GetObjectAttributes :request {:Bucket bucket-name :Key filename}})
        object-exists? (nil? (:Error s3-object-attrs))]
    (when object-exists? s3-object-attrs)))

(defn upload-object [client bucket-name filename inputstream]
  (if (peek-object client bucket-name filename)
    (upload-object client bucket-name (str filename "(copy)") inputstream)
    (do
      (logging/infof "Uploading to bucket: %s name: %s" bucket-name filename)
      (aws/invoke client {:op :PutObject :request {:Bucket bucket-name :Key filename :Body inputstream}})
      {:filename filename :location (format "https://%s.s3.amazonaws.com/%s" bucket-name filename)})))

(defn get-object [client bucket-name filename]
  (let [s3-object (aws/invoke client {:op :GetObject :request {:Bucket bucket-name :Key filename}})
        object-exists? (nil? (:Error s3-object))]
    (when object-exists? s3-object)))

(defn delete-object [client bucket-name filename]
  (let [object-attrs (peek-object client bucket-name filename)] ;;might help to write a peek method to avoid getting the entire object into memory
    (when object-attrs
      (logging/infof "Deleting from bucket: %s file: %s" bucket-name filename)  
      (aws/invoke client {:op :DeleteObject :request {:Bucket bucket-name :Key filename}}))))

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
  (aws/invoke s3-client {:op :GetObject :request {:Bucket "conj-images" :Key "testng"}})
  (aws/doc s3-client :ListObjectsV2)
  (get-object s3-client "conj-images" "testig")
  (-> s3-client aws/ops res :response))