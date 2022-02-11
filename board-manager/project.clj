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
                 [com.zaxxer/HikariCP "4.0.3"]
                 [ch.qos.logback/logback-classic "1.1.3"]
                 [migratus "1.3.5"]
                 [com.github.seancorfield/honeysql "2.2.858"]]
  :plugins [[lein-ring "0.12.5"]
            [lein-environ "1.2.0"]
            [migratus-lein "0.7.3"]]
  :ring {:handler board-manager.handler/app}
  :main ^:skip-aot board-manager.handler
  :repl-options {:host "0.0.0.0"}
  :migratus {:store :database
              :migration-dir "migrations"
              :db {:classname "org.postgresql"
                    :subprotocol "postgres"
                    :subname "//localhost/postgres"
                    :user "admin"
                    :password "pass"}}
  :source-paths ["src" "config"]
  :profiles
  {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring/ring-mock "0.3.2"]]
         :source-paths ["dev"]
         :env {:db-host "localhost"
               :db-user "admin"
               :db-pass "pass"
               :db-port 5432
               :db-name "postgres"
               :redis-host "localhost"
               :redis-port 6379
               :port 8080}}})
