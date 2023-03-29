(ns conj-bot.core
  (:require [clojure.pprint :as pprint]
            [clojure.tools.logging :as log]
            [environ.core :refer [env]]
            [wkok.openai-clojure.api :as api]
            [cheshire.core :as cheshire]
            [martian.core :as martian]
            [martian.interceptors :as martian.interceptors]
            [clj-http.client :as http-client]
            [martian.clj-http :as martian-http])
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

(defn- bootstrap-json [file]
  (->> (cheshire/parse-string (slurp file))
       (martian/bootstrap-openapi "http://localhost:8080")))

(def my-coerce-response
  {:name ::my-coerce-response
   :enter (fn [ctx]
               (assoc-in ctx [:request :headers "Accept"] "application/json"))
   :leave (fn [ctx] ctx)})


(comment
  ;; (require '[environ.core :refer env])
  ;; (env :openai-key)
  (def m (martian-http/bootstrap-swagger "http://localhost:8080/swag.json"))
  ;; (def m (bootstrap-json "swagger.json"))
  ;; (pprint/pprint m)
  (martian/explore m)
  (martian/explore m :get-board)
  (def req (martian/request-for m :get-board {:board "random"}))
  (print req)
  ;; (def response (http-client/request (assoc-in req [:headers] {"Accept" "application/json"})))
  (def res (martian/response-for m :get-board {:board "random"}))
  (print res)
  ;; (print m)
  (-main "profiles.edn"))