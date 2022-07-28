(ns board-manager.model.api.common)

(defn optional 
  [schema]
  [(first schema) {:optional true} (into [] (flatten (rest schema)))])