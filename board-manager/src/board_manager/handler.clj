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
            [board-manager.services.item-generation :as item-generation-service])
  (:import (com.zaxxer.hikari HikariDataSource)))

(defn config-from-env []
  {:db-host (env :db-host)
   :db-user (env :db-user)
   :db-pass (env :db-pass)
   :db-port (env :db-port)
   :db-name (env :db-name)
   :port (env :port)
   :redis-host (env :redis-host)
   :redis-port (env :redis-port)})

(defn app-middleware [handler state]
  (fn [request]
    (handler (assoc request :components state))))

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
             coercion/coerce-exceptions-middleware
             coercion/coerce-request-middleware
             coercion/coerce-response-middleware]}})
   (ring/create-default-handler)))

(defrecord Api [handler db-conn redis-conn item-generation-service]
  component/Lifecycle
  (start [this]
    (let [wrapped-app (app-middleware api-config {:db-conn db-conn :redis-conn redis-conn :item-generation-service item-generation-service})] 
      (assoc this :handler wrapped-app)))

  (stop [this]
    (assoc this :handler nil)))

(defn new-api [handler]
  (map->Api {:handler handler}))

(defrecord JettyServer [api db port server]
  component/Lifecycle
  (start [component]
    (log/infof "Starting HTTP server on port %s" port)
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
  (let [{:keys [db-host db-port db-name db-user db-pass port redis-host redis-port]} config
        db-spec {:dbtype "postgresql" :host db-host :port db-port :dbname db-name :user db-user :pass db-pass}
        redis-conn {:pool {} :spec {:uri (str "redis://" redis-host ":" redis-port)}}]
    (component/system-map
     :db-conn (connection/component HikariDataSource db-spec)
     :redis-conn redis-conn 
     :api (component/using (new-api api-config) [:db-conn :redis-conn :item-generation-service])
     :item-generation-service (component/using (item-generation-service/new-service {:seed "TBD"}) [:db-conn])
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
  (.addShutDownHook (Runtime/getRuntime)
                    (Thread. ^Runnable (shutdown-system-fn system))))

(defn -main [& args]
  (let [logger (log-impl/get-logger log/*logger-factory* *ns*)]
  (log/infof "Starting main application (not HTTP Server)")
  (let [config (config-from-env)
        system (component/start (system config))]
    (add-shutdown-hook! system))))
