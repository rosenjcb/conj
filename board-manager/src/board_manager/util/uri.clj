(ns board-manager.util.uri
  (:require [lambdaisland.uri :as uri]))

#_{:clj-kondo/ignore [:redefined-var]}
(defn uri? [s]
  (let [{:keys [scheme host]} (uri/uri s)]
    (some? (and scheme host))))