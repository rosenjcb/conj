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

(defn make-new-post! [openai-creds profile thread]
  (try
    (let [op (first thread)
          comment (:comment op)
          prompt (make-prompt (:description profile) comment)
          response (api/create-completion prompt openai-creds)
          reply (->> response :choices first :text)]
      (log/infof "Here is your prompt %s" prompt)
      (log/infof "Here's my response from openai %s" reply))
    (catch Exception e
      (log/errorf "Something went wrong %s" e))))

(defn make-reply-post! [])

(defn begin-job! [openai-creds conj-client profile]
  (log/infof "Loaded profile %s" (:name profile))
  (let [history (:history profile)
        board (first (:boards profile))]
    (if (= (count history) 0)
      (let [threads (->> (martian/response-for conj-client :get-board {:board board}) :body)
            picked-threads (take 3 (shuffle threads))]
        (doseq [thread picked-threads]
          (make-new-post! openai-creds profile thread)))
      (make-reply-post!))))


;; prompt (make-prompt (:description profile) fake-post)
;; _ (pprint/pprint prompt)
;; reply (api/create-completion prompt openai-creds)]
;; (pprint/pprint reply)
;; (log/infof (->> (:choices reply) first :text))))

(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (let [prof-loc (first args)
        profiles (->> (slurp prof-loc) read-string)
        openai-key (env :openai-key)
        openai-creds {:api-key openai-key}
        conj-client (martian-http/bootstrap-swagger "http://localhost:8080/swag.json" {:server-url "https://conj.app"})]
    (if profiles
      (begin-job! openai-creds conj-client (second profiles))
      (log/infof "Couldn't find any profiles in %s" profiles))))

;; (defn- bootstrap-json [file]
;;   (->> (cheshire/parse-string (slurp file))
;;        (martian/bootstrap-openapi "http://localhost:8080")))

;; (def my-coerce-response
;;   {:name ::my-coerce-response
;;    :enter (fn [ctx]
;;                (assoc-in ctx [:request :headers "Accept"] "application/json"))
;;    :leave (fn [ctx] ctx)})


(comment
  ;; (require '[environ.core :refer env])
  ;; (env :openai-key)
  (def m (martian-http/bootstrap-swagger "http://localhost:8080/swag.json"))
  (pprint/pprint (keys m))
  (pprint/pprint (:api-root m))
  (def m (assoc m :api-root "https://conj.app"))
  ;; (def m (bootstrap-json "swagger.json"))
  ;; (pprint/pprint m)
  (pprint/pprint (martian/explore m))
  (martian/explore m :get-board)
  (def req (martian/request-for m :get-board {:board "random"}))
  (print req)
  ;; (def response (http-client/request (assoc-in req [:headers] {"Accept" "application/json"})))
  (def res (martian/response-for m :get-board {:board "random"}))
  (pprint/pprint (:body res))
  (count (:body res))
  (print res)
  ;; (print m)
  (def profile (->> (slurp "profiles.edn") read-string second))
  (def openai-key "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")
  (begin-job! {:api-key openai-key} m profile)
  (-main "profiles.edn"))