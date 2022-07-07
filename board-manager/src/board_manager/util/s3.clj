(ns board-manager.util.s3
  (:require
   [cognitect.aws.client.api :as aws]))

(defn upload-object [s3-client bucket-name file-name object]
  (aws/invoke s3-client {:op :PutObject 
                         :request {:Bucket bucket-name 
                                   :Key file-name 
                                   :Body object}}))
