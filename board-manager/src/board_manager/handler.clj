(ns board-manager.handler
  (:require [compojure.core :refer :all]
            [ring.adapter.jetty :as jetty]
            [reitit.ring :as ring]
            [board-manager.routes.thread :as thread]
            [reitit.ring.coercion :as coercion]
            [reitit.ring.middleware.muuntaja :as muuntaja]
            [muuntaja.core :as m]
            [reitit.coercion.spec :as spec]
            [environ.core :refer [env]]
            [com.stuartsierra.component :as component]
            [next.jdbc.connection :as connection]
            [clojure.tools.logging :as log]
            [clojure.tools.logging.impl :as log-impl]
            [board-manager.routes.image :as image]
            [board-manager.routes.account :as account]
            [board-manager.services.auth :as auth.service]
            [board-manager.services.item-generation :as item-generation-service]
            [ring.util.response :as response]
            [ring.middleware.cookies :as cookies]
            [ring.middleware.resource :as resource]
            [board-manager.query.refresh-token :as q.refresh-token])
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
   :redis-port (env :redis-port)})

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

(def api-config
  (ring/ring-handler
   (ring/router
    [thread/thread-routes 
     image/image-routes
     account/account-routes]
    {:data {:muuntaja m/instance
            :coercion spec/coercion
            :middleware
             [muuntaja/format-middleware
              cookies/wrap-cookies
              coercion/coerce-exceptions-middleware
              coercion/coerce-request-middleware
              coercion/coerce-response-middleware]}
     :conflicts (constantly nil)})
   (ring/routes
    (spa-fallback-handler)
    (ring/create-default-handler))))

(defrecord Api [handler db-conn redis-conn item-generation-service auth-service]
  component/Lifecycle
  (start [this]
    (let [wrapped-app (app-middleware api-config {:db-conn db-conn :redis-conn redis-conn :item-generation-service item-generation-service :auth-service auth-service})] 
      (assoc this :handler wrapped-app)))

  (stop [this]
    (assoc this :handler nil)))

(defn new-api [handler]
  (map->Api {:handler handler}))

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

(defn system [config]
  (let [{:keys [db-host db-port db-name db-user db-pass port redis-host redis-port passphrase]} config
        db-spec {:dbtype "postgresql" :host db-host :port db-port :dbname db-name :username db-user :password db-pass}
        redis-conn {:pool {} :spec {:uri (str "redis://" redis-host ":" redis-port)}}]
    (log/infof "Here's your db-spec %s" db-spec)
    (component/system-map
     :auth-conf {:privkey "auth_privkey.pem" :passphrase passphrase}
     :db-conn (connection/component HikariDataSource db-spec)
     :redis-conn redis-conn
     :api (component/using (new-api api-config) [:db-conn :redis-conn :item-generation-service :auth-service])
     :item-generation-service (component/using (item-generation-service/new-service {:seed "TBD"}) [:db-conn])
     :auth-service (component/using (auth.service/new-service {:salt "1234" :auth-conf {:privkey "auth_privkey.pem" :pubkey "auth_pubkey.pem" :passphrase passphrase}}) [:db-conn])
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
