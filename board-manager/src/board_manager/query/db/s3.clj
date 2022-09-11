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
      (let [_ (logging/infof "Uploading to bucket: %s name: %s" bucket-name formatted-filename)
            res (aws/invoke client {:op :PutObject :request {:Bucket bucket-name :Key formatted-filename :Body inputstream :ContentType (when (#{"png" "jpg" "jpeg" "gif"} extension) (str "image/" extension))}})
            error-message (:cognitect.anomalies/message res)]
        (when (some? error-message) (throw (Exception. error-message)))
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
;;   (def s3-client (:s3-client user/sys))
;;   (aws/invoke s3-client {:op :ListObjects :request {:Bucket "conj-images"}}))