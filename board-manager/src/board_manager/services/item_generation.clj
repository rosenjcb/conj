(ns board-manager.services.item-generation 
  (:require [board-manager.query.accountinventory :as q.accountinventory]
            [board-manager.query.image :as q.image]
            [com.stuartsierra.component :as component]
            [clojure.tools.logging :as log]))

(defn- create-image-prizes [image]
  (let [rarity (:rarity image)
        copy-count (condp = rarity
                      "common" 30
                      "uncommon" 15
                      "rare" 5
                      "epic" 1
                      0)]
    (repeat copy-count image)))

(defn- create-mystery-box [available-images]
  (->> (map create-image-prizes available-images)
       flatten))

(defn draw-item! [item-generation-service account-id]
  (let [db-conn (:db-conn item-generation-service)
        images (q.image/get-images! db-conn)
        mystery-box (shuffle (create-mystery-box images))
        random-pick (rand-nth mystery-box)]
    (log/infof "The lucky pick was a %s" random-pick)
    (q.accountinventory/add-item-to-account-inventory! db-conn account-id (:id random-pick))
    random-pick))

(defrecord Service [seed db-conn]
  component/Lifecycle
  (start [this]
    (log/infof "Starting the Item Generation Service")
    (assoc this :db-conn db-conn :seed seed))
  (stop [this]
    (log/infof "Stopping the Item Generation Service")
    (assoc this :db-conn nil :seed nil)))

(defn new-service [{:keys [seed]}]
  (map->Service {:seed seed}))
