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

(comment
  (decode "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4MzkyM2M4Y2ZlYzEwZjkyY2IwMTNkMDZlMWU3Y2RkNzg3NGFlYTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI2MDIxMjk0Njc2ODktcGU0bDRpbTJucjYydDE0YWU1MHF1YzF1ajJkZDV1bTEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI2MDIxMjk0Njc2ODktcGU0bDRpbTJucjYydDE0YWU1MHF1YzF1ajJkZDV1bTEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDQ0MjM0MDIxMjM3MzQwMjkyMTkiLCJlbWFpbCI6InJvc2VuamNiQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiMm1SamJaVmxvblJlSl9Rb190R3BxUSIsIm5hbWUiOiJKYWNvYiBSb3Nlbnp3ZWlnIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FMbTV3dTNpbzlKWTZuV3N2R0VZY0ZwbFZtVWMwUFdoUk9waWUtUVc4TUYzPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkphY29iIiwiZmFtaWx5X25hbWUiOiJSb3Nlbnp3ZWlnIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2Njk2MjI4MTcsImV4cCI6MTY2OTYyNjQxN30.YZudbs_jRKZGvzCAD0GJJhibMp5F1ozqNSO8QeSCYJYW0eG7fJ0ZYyQBtoi8asR6auNyEGpBf9Zvqidcj9EdCvVU6u9QtQFY4G8KoX7CMO8DF1sRsm666XWmhajhW41zLEY4gZ2IbVLI2NThM9-iKZE5MHlUAeRZg5-_waP91uvv7wp9POg2wreQpEFYl8Ygpv114CEirnwzkoSsF5EZ6gBDNyUUaqPhjURqAtg1usfjf8owNAbEiHSYSq-UuOMkgupVSt0IGATITqpE9BKyrFdQ3HL_QXX-Xk_vhoCYdk1i6D9ndDmqB4jbOx6DJr2wMIYQZL3n7HWs1xIAHbzW1A"))