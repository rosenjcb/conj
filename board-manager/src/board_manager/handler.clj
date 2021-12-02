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
            [board-manager.routes.image :as image])
  (:import (com.zaxxer.hikari HikariDataSource)))

(defn config-from-env []
  {:db-host (env :db-host)
   :db-user (env :db-user)
   :db-pass (env :db-pass)
   :db-port (env :db-port)
   :port (env :port)
   :redis-host (env :redis-host)
   :redis-port (env :redis-port)})

(defn app-middleware [handler state]
  (fn [request]
    (handler (assoc request :components state))))

(def api-config
  (ring/ring-handler
   (ring/router
    [thread/thread-routes image/image-routes]
    {:data {:muuntaja m/instance
            :coercion spec/coercion
            :middleware
             [muuntaja/format-middleware
             coercion/coerce-exceptions-middleware
             coercion/coerce-request-middleware
             coercion/coerce-response-middleware]}})
   (ring/create-default-handler)))

(defrecord Api [handler db-conn redis-conn]
  component/Lifecycle
  (start [this]
    (log/infof "Here's what this looks like %s" api-config)
    (let [wrapped-app (app-middleware api-config {:db-conn db-conn :redis-conn redis-conn})] 
      (assoc this :handler wrapped-app)))

  (stop [this]
    (assoc this :handler nil)))

(defn new-api [handler]
  (map->Api {:handler handler}))

(defrecord JettyServer [api db port server]
  component/Lifecycle
  (start [component]
    (log/infof "Starting HTTP server on port %s" port)
    (log/infof "Type of handler is %s" (:handler api))
    (let [handler (:handler api)
          server (jetty/run-jetty handler {:port port})]
      (assoc component :server server)))
  (stop [component]
    (log/infof "Starting HTTP server on port %s" port)
    (when server
      (.stop server))
    (assoc component :server nil)))

(defn new-server [port]
  (map->JettyServer {:port port}))

(defn system [config]
  (let [{:keys [db-host db-port db-user db-pass port redis-host redis-port]} config
        db-spec {:dbtype "postgresql" :host db-host :port db-port :username db-user :password db-pass}
        redis-conn {:pool {} :spec {:uri (str "redis://" redis-host ":" redis-port)}}]
    (component/system-map
     :db-conn (connection/component HikariDataSource db-spec)
     :redis-conn redis-conn 
     :api (component/using (new-api api-config) [:db-conn :redis-conn])
     :server (component/using
              (new-server (Integer/parseInt port))
              [:api]))))

(defn shutdown-system-fn [system]
  (fn []
    (log/info "System is stopping")
    (component/stop system)
    (log/info "System is stopping")))

(defn add-shutdown-hook!
  [system]
  (.addShutDownHook (Runtime/getRuntime)
                    (Thread. ^Runnable (shutdown-system-fn system))))

(def sys nil)

(defn init []
  (alter-var-root 
   #'sys 
   (constantly (system (config-from-env)))))

(defn start []
  (alter-var-root #'sys component/start))

(defn stop []
  (alter-var-root #'sys (fn [s] (when s (component/stop s)))))

(defn go []
  (init)
  (start))

(defn -main [& args]
  (let [logger (log-impl/get-logger log/*logger-factory* *ns*)]
  (println logger)
  (log/infof "Starting program")
  (let [config (config-from-env)
        system (component/start (system config))]
    (add-shutdown-hook! system))))
