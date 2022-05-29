#!/usr/bin/env bb
(require
 '[babashka.curl :as curl]
 '[babashka.pods :as pods]
 '[clojure.java.io :as io]
 '[clojure.java.shell :as shell]
 '[clojure.string :as str])

(pods/load-pod 'org.babashka/postgresql "0.1.0")

(require '[pod.babashka.postgresql :as pg])

(def db-spec {:dbtype "postgresql"
              :host "pepechan-db.c0l4wnpjgjdh.us-west-2.rds.amazonaws.com"
              :user "postgres"
              :password "Frameshare8*8"
              :port 5432
              :dbname "postgres"})

(defn get-db-images []
 (->> (pg/execute! db-spec ["select name, location from image"])))

(defn- fetch-binary-file [loc]
  (->> (curl/get loc {:as :bytes})
        :body))

(defn download-image [image]
  (let [name (:image/name image)
        location (:image/location image)
        extension (last (str/split location #"\."))]
    (io/copy
     (fetch-binary-file location)
     (io/file (str "./web-app/public/images/" name "." extension)))))

;; (->> (get-db-images)
;;      (map download-image))

(io/copy
  (:body (curl/get "https://github.com/babashka/babashka/raw/master/logo/icon.png"
    {:as :bytes}))
  (io/file "icon.png"))
