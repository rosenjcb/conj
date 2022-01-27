(ns user
  (:require [board-manager.handler :as handler]
            [com.stuartsierra.component :as component]))

(def sys nil)

(defn init []
  (alter-var-root 
   #'sys 
   (constantly (handler/system (handler/config-from-env)))))

(defn start []
  (alter-var-root #'sys component/start))

(defn stop []
  (alter-var-root #'sys (fn [s] (when s (component/stop s)))))

(defn go []
  (init)
  (start)
  nil)

;; (defn reset []
;;   (stop)
;;   (refresh :after `user/go))
