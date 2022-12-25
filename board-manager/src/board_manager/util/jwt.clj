(ns board-manager.util.jwt
  (:require [cheshire.core :as json]
            [clojure.data.codec.base64 :as b64]
            [clojure.string :as str]))

(defn- decode-b64 [str] (String. (b64/decode (.getBytes str))))
(defn- parse-json [s]
  (let [clean-str (if (str/ends-with? s "}") s (str s "}"))]
    (json/parse-string clean-str keyword)))

(defn decode [token]
  (let [[header payload _] (str/split token #"\.")]
    {:header  (parse-json (decode-b64 header))
     :payload (parse-json (decode-b64 payload))}))
