(ns board-manager.query.db.s3
  (:require [board-manager.util.file :as util.file]
            [clojure.tools.logging :as logging]
            [cognitect.aws.client.api :as aws]))

(defn peek-object [client bucket-name filename]
  (let [s3-object-attrs (aws/invoke client {:op :GetObjectAcl :request {:Bucket bucket-name :Key filename}})
        object-exists? (nil? (:Error s3-object-attrs))]
    (when object-exists? s3-object-attrs)))

(defn upload-object
  ([client bucket-name filename inputstream] (upload-object client bucket-name filename inputstream 0))
  ([client bucket-name filename inputstream retry-count]
   (let [{:keys [name extension]} (util.file/split-extension filename) 
         formatted-filename (if (pos? retry-count) (str name "-" retry-count "." extension) filename)]
    (if (peek-object client bucket-name formatted-filename)
      (upload-object client bucket-name filename inputstream (inc retry-count))
      (do
        ;; (logging/infof "Uploading to bucket: %s name: %s" bucket-name formatted-filename)
        (aws/invoke client {:op :PutObject :request {:Bucket bucket-name :Key formatted-filename :Body inputstream :ContentType (when (#{"png" "jpg" "jpeg" "gif"} extension) (str "image/" extension))}})
        {:filename formatted-filename :location (format "https://%s.s3.amazonaws.com/%s" bucket-name formatted-filename)})))))

(defn get-object [client bucket-name filename]
  (let [s3-object (aws/invoke client {:op :GetObject :request {:Bucket bucket-name :Key filename}})
        object-exists? (nil? (:Error s3-object))]
    (when object-exists? s3-object)))

(defn delete-object [client bucket-name filename]
  (let [object-attrs (peek-object client bucket-name filename)]
    (when object-attrs
      ;; (logging/infof "Deleting from bucket: %s file: %s" bucket-name filename)  
      (aws/invoke client {:op :DeleteObject :request {:Bucket bucket-name :Key filename}})
      true)))

;; (comment
;;   (require '[cognitect.aws.client.api :as aws])
;;   (def s3 (aws/client {:api :s3 :region :us-west-2}))
;;   (def all-ops (map #(get % 0) (aws/ops s3)))
;;   (clojure.pprint/pprint all-ops)
;;   (filter #(clojure.string/includes? % "Put") all-ops)
;;   (second (aws/ops s3))
;;   (map #(get % :name) (aws/ops s3))
;;   (aws/invoke s3 {:op :ListBuckets})
;;   ;; (aws/invoke s3 {:op :CreateBucket})
;;   (aws/invoke s3 {:op :something})
;;   (def s3-client (:s3-client user/sys))
;;   (def res (upload-object s3 "conj-images" "zzz" (.getBytes "this is a test")))
;;   (keys res)
;;   (aws/invoke s3-client {:op :GetObjectAttributes :request {:Bucket "conj-images" :Key "testing"}})
;;   (aws/doc s3-client :ListObjectsV2)
;;   (get-object s3-client "conj-images" "testig")
;;   (-> s3-client aws/ops res :response))