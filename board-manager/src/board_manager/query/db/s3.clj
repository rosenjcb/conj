(ns board-manager.query.db.s3
  (:require [board-manager.util.file :as util.file]
            [clojure.tools.logging :as logging]
            [cognitect.aws.client.api :as aws]))

(defn peek-object [client bucket-name path-to-file]
  (let [s3-object-attrs (aws/invoke client {:op :GetObjectAcl :request {:Bucket bucket-name :Key path-to-file}})
        object-exists? (nil? (:Error s3-object-attrs))]
    (when object-exists? s3-object-attrs)))

(defn upload-object
  ([client bucket-name path filename inputstream] (upload-object client bucket-name path filename inputstream 0))
  ([client bucket-name path filename inputstream retry-count]
   (let [{:keys [name extension]} (util.file/split-extension filename) 
         formatted-filename (if (pos? retry-count) (str name "-" retry-count "." extension) filename)
         path-to-file (str path formatted-filename)]
    (if (peek-object client bucket-name path-to-file)
      (upload-object client bucket-name path filename inputstream (inc retry-count))
      (let [_ (logging/infof "Uploading to bucket: %s path: %s filename: %s" bucket-name path formatted-filename)
            res (aws/invoke client {:op :PutObject :request {:Bucket bucket-name :Key path-to-file :Body inputstream :ContentType (when (#{"png" "jpg" "jpeg" "gif"} extension) (str "image/" extension))}})
            error (:cognitect.anomalies/category res)]
        (when (some? error) (throw (Exception. "Couldn't upload the object for one reason or another.")))
        {:filename formatted-filename :location (format "https://%s.s3.amazonaws.com%s" bucket-name path-to-file)})))))

(defn get-object [client bucket-name path-to-file]
  (let [s3-object (aws/invoke client {:op :GetObject :request {:Bucket bucket-name :Key path-to-file}})
        object-exists? (nil? (:Error s3-object))]
    (when object-exists? s3-object)))

(defn delete-object 
  ([client bucket-name path-to-file]
  (let [object-attrs (peek-object client bucket-name path-to-file)]
    (when object-attrs
      ;; (logging/infof "Deleting from bucket: %s file: %s" bucket-name filename)  
      (aws/invoke client {:op :DeleteObject :request {:Bucket bucket-name :Key path-to-file}})
      true)))
  ([client bucket-name path filename] 
    (delete-object client bucket-name (str path filename))))

(defn delete-directory [s3-client bucket path]
  (let [res (aws/invoke s3-client {:op :ListObjects :request {:Bucket bucket :Prefix path}})
        files (->> (:Contents res) (map #(get % :Key)))]
    (doseq [path-to-file files]
      (delete-object s3-client bucket path-to-file))))
