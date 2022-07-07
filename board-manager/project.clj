(defproject board-manager "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :min-lein-version "2.0.0"
  :dependencies [[org.clojure/clojure "1.10.0"]
                 [org.clojure/tools.logging "1.1.0"]
                 [compojure "1.6.1"]
                 [ring/ring-defaults "0.3.2"]
                 [ring/ring-jetty-adapter "1.9.4"]
                 [ring/ring-json "0.5.1"]
                 [ring/ring-core "1.9.4"]
                 [com.taoensso/carmine "3.1.0"]
                 [metosin/reitit "0.5.15"]
                 [com.taoensso/carmine "3.1.0"]
                 [com.github.seancorfield/next.jdbc "1.2.737"]
                 [environ "1.2.0"]
                 [com.stuartsierra/component "1.0.0"]
                 [org.postgresql/postgresql "42.2.10"]
                 [org.apache.logging.log4j/log4j-api "2.18.0"]
                 [org.apache.logging.log4j/log4j-core "2.18.0"]
                 [org.apache.logging.log4j/log4j-slf4j-impl "2.18.0"]
                 [migratus "1.3.5"]
                 [com.github.seancorfield/honeysql "2.2.858"]
                 [com.zaxxer/HikariCP "5.0.1"] ;;might have to come before logging libs
                 [buddy/buddy-sign "3.4.333"]
                 [buddy/buddy-hashers "1.8.158"]
                 [clojure.java-time "0.3.3"]
                 [com.cognitect.aws/api "0.8.561"]
                 [com.cognitect.aws/endpoints "1.1.12.230"]
                 [com.cognitect.aws/s3 "822.2.1145.0"]]
  :exclusions [; Exclude transitive dependencies on concrete implementations
               ; and adapters of the above java logging abstractions:
               [ch.qos.logback/logback-classic]
               [ch.qos.logback/logback-core]
               [org.slf4j/jcl-over-slf4j]
               [org.slf4j/jul-to-slf4j]
               [org.slf4j/log4j-over-slf4j]
               [org.slf4j/slf4j-nop]]
  :plugins [[lein-ring "0.12.5"]
            [lein-environ "1.2.0"]
            [migratus-lein "0.7.3"]]
  :main board-manager.handler
  :repl-options {:host "0.0.0.0"}
  :source-paths ["src" "config"]
  :profiles
  {:local {:dependencies [[javax.servlet/servlet-api "2.5"]
                          [ring/ring-mock "0.3.2"]]
           :migratus {:store :database
                      :migration-dir "migrations"
                      :db "postgres://localhost:5432/postgres?user=admin&password=pass"}
           :source-paths ["dev"]
           :env {:passphrase "Frameshare8*8"
                 :db-host "localhost"
                 :db-user "admin"
                 :db-pass "pass"
                 :db-port 5432
                 :db-name "postgres"
                 :redis-host "localhost"
                 :redis-port 6379
                 :host "0.0.0.0"
                 :port 8080}}
   :dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring/ring-mock "0.3.2"]]
         :migratus {:store :database
                    :migration-dir "migrations"
                    :db "postgres://pepechan-db.c0l4wnpjgjdh.us-west-2.rds.amazonaws.com:5432/postgres?user=postgres&password=Frameshare8*8"}
         :source-paths ["dev"]
         :env {:passphrase "Frameshare8*8"
               :db-host "pepechan-db.c0l4wnpjgjdh.us-west-2.rds.amazonaws.com"
               :db-user "postgres"
               :db-pass "Frameshare8*8"
               :db-port 5432
               :db-name "postgres"
               :redis-host "35.167.219.188"
               :redis-port 6379
               :host "0.0.0.0"
               :port 8080}}})
