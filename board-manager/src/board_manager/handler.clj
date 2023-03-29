(ns board-manager.handler
  (:require [board-manager.routes.account :as account]
            [board-manager.routes.thread :as thread]
            [board-manager.services.auth :as auth.service]
            [board-manager.services.google-client :as google.client]
            [clojure.tools.logging :as log]
            [clojure.tools.logging.impl :as log-impl]
            [cognitect.aws.client.api :as aws]
            [cognitect.aws.credentials :as credentials]
            [com.stuartsierra.component :as component]
            [compojure.core :refer :all]
            [environ.core :refer [env]]
            [muuntaja.core :as m]
            [next.jdbc.connection :as connection]
            [reitit.coercion.malli :as malli]
            [reitit.ring :as ring]
            [reitit.ring.coercion :as coercion]
            [reitit.ring.middleware.muuntaja :as muuntaja]
            [reitit.swagger :as swagger]
            [reitit.swagger-ui :as swagger-ui]
            [ring.adapter.jetty :as jetty]
            [ring.middleware.cookies :as cookies]
            [ring.middleware.multipart-params :as multipart]
            [ring.middleware.params :as params]
            [ring.util.response :as response]
            [taoensso.carmine :as car])
  (:import (com.zaxxer.hikari HikariDataSource))
  (:gen-class))

(defn config-from-env []
  {:db-host (env :db-host)
   :db-user (env :db-user)
   :db-pass (env :db-pass)
   :db-port (env :db-port)
   :db-name (env :db-name)
   :passphrase (env :passphrase)
   :port (env :port)
   :redis-host (env :redis-host)
   :redis-port (env :redis-port)
   :google-client-id (env :google-client-id)
   :google-client-secret (env :google-client-secret)
   :aws-access-key (env :aws-access-key)
   :aws-access-secret (env :aws-access-secret)
   :env (env :env)})

(defn app-middleware [handler state]
  (fn [request]
    (handler (assoc request :components state))))

(defn spa-fallback-handler []
  (fn [request]
    (or (response/resource-response (:uri request) {:root "public"})
        (-> (response/resource-response "index.html" {:root "public"})
            (response/content-type "text/html")))))

(def web-app-routes
  [["/" (ring/create-resource-handler)]])

(def custom-muuntaja 
  (m/create
   (-> m/default-options
       (update
        :formats
        select-keys
        ["application/json"]))))

(def api-config
  (ring/ring-handler
   (ring/router
    [["/api"
      thread/thread-routes 
      account/account-routes]
     ["" {:no-doc true}
      ["/swag.json" {:get {:swagger {:info {:title "Conj API"
                                            :description "The internal api for Conj"
                                            :version "2.0"}}
                           :handler (swagger/create-swagger-handler)}}]]]
    {:data {:muuntaja custom-muuntaja
            :coercion malli/coercion
            :middleware
             [muuntaja/format-middleware
              cookies/wrap-cookies
              multipart/wrap-multipart-params
              params/wrap-params
              coercion/coerce-exceptions-middleware
              coercion/coerce-request-middleware
              coercion/coerce-response-middleware]}
     :conflicts (constantly nil)})
   (ring/routes
    (swagger-ui/create-swagger-ui-handler {:path "/swag-ui" :url "/swag.json"})
    (spa-fallback-handler)
    (ring/create-default-handler))))

(defrecord Api [handler env db-conn redis-conn auth-service s3-client google-client]
  component/Lifecycle
  (start [this]
    (let [wrapped-app (app-middleware api-config {:db-conn db-conn :redis-conn redis-conn :auth-service auth-service :s3-client s3-client :google-client google-client :env env})] 
      (assoc this :handler wrapped-app)))

  (stop [this]
    (assoc this :handler nil)))

(defn new-api [handler env]
  (map->Api {:handler handler
             :env env}))

(defrecord JettyServer [api db port server]
  component/Lifecycle
  (start [component]
    (log/infof "Starting HTTP server on port %s" port)
    (log/info "Debug test")
    (let [handler (:handler api)
          server (jetty/run-jetty handler {:port port :join? false})]
      (assoc component :server server)))
  (stop [component]
    (log/infof "Starting HTTP server on port %s" port)
    (when server
      (.stop server))
    (assoc component :server nil)))

(defn new-server [port]
  (map->JettyServer {:port port}))

(defonce redis-conn-pool (car/connection-pool {}))

(defn system [config]
  (let [{:keys [db-host db-port db-name db-user db-pass port redis-host redis-port passphrase
                google-client-id google-client-secret env
                aws-access-key aws-access-secret]} config
        s3-creds (when (every? some? [aws-access-key aws-access-secret])
                  (credentials/basic-credentials-provider {:access-key-id aws-access-key :secret-access-key aws-access-secret}))
        s3-client (aws/client {:api :s3 :region :us-west-2 :credentials-provider s3-creds})
        db-spec {:dbtype "postgresql" :host db-host :port db-port :dbname db-name :username db-user :password db-pass}
        redis-conn {:pool redis-conn-pool :spec {:uri (str "redis://" redis-host ":" redis-port)}}]
    (component/system-map
     :auth-conf {:privkey "auth_privkey.pem" :passphrase passphrase}
     :db-conn (connection/component HikariDataSource db-spec)
     :redis-conn redis-conn
     :s3-client s3-client
     :auth-service (component/using (auth.service/new-service {:salt "1234" :auth-conf {:privkey "auth_privkey.pem" :pubkey "auth_pubkey.pem" :passphrase passphrase}}) [:db-conn])
     :google-client (component/using (google.client/new-api-client google-client-id google-client-secret) [])
     :api (component/using (new-api api-config env) [:db-conn :redis-conn :auth-service :s3-client :google-client])
     :server (component/using
              (new-server (Integer/parseInt port))
              [:api]))))

(defn shutdown-system-fn [system]
  (fn []
    (log/info "System is stopping")
    (component/stop system)
    (log/info "System stopped")))

(defn add-shutdown-hook!
  [system]
  (.addShutdownHook (Runtime/getRuntime)
                    (Thread. ^Runnable (shutdown-system-fn system))))

(defn -main [& args]
  (let [_ (log-impl/get-logger log/*logger-factory* *ns*)]
    (log/infof "Starting main application (not HTTP Server)")
    (let [config (config-from-env)
          system (component/start (system config))]
      (add-shutdown-hook! system))))
