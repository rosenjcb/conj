(ns board-manager.util.file 
  (:require [clojure.string :as str]))

(defn split-extension [file-uri]
  (when (string? file-uri)
    (let [split-arr (str/split file-uri #"\.")
          has-extension? (> (count split-arr) 1)
          extension (last split-arr)
          name (when has-extension? (subs file-uri 0 (- (count file-uri) (inc (count extension)))))]
      (when has-extension? 
        {:name name :extension extension}))))
