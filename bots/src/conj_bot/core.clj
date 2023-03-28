(ns conj-bot.core
  (:require [clojure.pprint :as pprint]
            [clojure.tools.logging :as log]
            [environ.core :refer [env]]
            [wkok.openai-clojure.api :as api])
  (:gen-class))

(def default-model "text-davinci-003")

(def fake-post "Can someone explain what the hell is happening with civil asset forfeiture?")

(def reddit-context " You are replying to a thread with the post: ")

(defn make-prompt [bot-desc post]
  {:model default-model
   :prompt (str bot-desc reddit-context "\"" post "\"")
   :max_tokens 60})

(defn begin-job! [openai-creds profile]
  (log/infof "Loaded profile %s" (:name profile))
  (let [prompt (make-prompt (:description profile) fake-post)
        _ (pprint/pprint prompt)
        reply (api/create-completion prompt openai-creds)]
    (pprint/pprint reply)
    (log/infof (->> (:choices reply) first :text))))

(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (let [prof-loc (first args)
        profile (->> (slurp prof-loc) read-string)
        openai-key (env :openai-key)
        openai-creds {:api-key openai-key}]
    (if profile
      (begin-job! openai-creds profile)
      (log/infof "Couldn't find profile %s" profile))))

(comment
  (require '[environ.core :refer env])
  (env :openai-key)
  (-main "profiles.edn"))

