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

(def default-model "gpt-3.5-turbo")

;; (def fake-post "Can someone explain what the hell is happening with civil asset forfeiture?")

;; (def reddit-context " You are replying to a thread with the post: ")

(defn make-prompt [bot-desc post]
  {:model default-model
   :messages [{:role "system" :content bot-desc}
              {:role "user" :content post}]})

(defn make-new-post! [openai-creds profile thread]
  (try
    (let [op (first thread)
          comment (:comment op)
          prompt (make-prompt (:description profile) comment)
          response (api/create-chat-completion prompt openai-creds)
          reply (->> response :choices first :message :content)
          conversation (update-in prompt [:messages] #(conj % reply))]
      ;; (log/infof "Here is your prompt %s" prompt)
      (log/infof "Here's my response from openai %s" reply)
      (log/infof "Here is the saved conversation %s" conversation))
    (catch Exception e
      (log/errorf "Something went wrong %s" e))))

(defn make-reply-post! [openai-creds conj-client board profile conversation]
  (try 
    (let [thread (->> (martian/response-for conj-client :get-thread {:board board :threadId ""}) :body)
          ;; ids&comments (mapv #([(:id %) (:comment %)]) thread)
          ])
    (catch Exception e
      (log/errorf "Something went wrong %s" e))))

(defn save-progress! [file-loc profile new-history]
  (->> (assoc profile :history new-history)
       (spit file-loc)))

(defn begin-job! 
  ([openai-creds conj-client profile&file-loc] (begin-job! openai-creds conj-client profile&file-loc (:history (first profile&file-loc)) [] 3))
  ([openai-creds conj-client profile&file-loc old-history new-history remaining]
    (let [[profile file-loc] profile&file-loc
          board (:board profile)
          threads (->> (martian/response-for conj-client :get-board {:board board}) :body)]
      (when (= remaining 0)
        (log/infof "Job's done. :)")
        new-history)
      (let [updated-history 
            (if (= (count old-history) 0)
              (make-new-post! openai-creds profile (first (shuffle threads)))
              (make-reply-post! openai-creds conj-client board profile (first old-history)))]
        (save-progress! file-loc profile updated-history)
        (recur openai-creds conj-client profile (into [] (rest old-history)) (conj old-history updated-history) (- remaining 1))))))


;; prompt (make-prompt (:description profile) fake-post)
;; _ (pprint/pprint prompt)
;; reply (api/create-completion prompt openai-creds)]
;; (pprint/pprint reply)
;; (log/infof (->> (:choices reply) first :text))))

(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (let [file-loc (first args)
        profile (->> (slurp file-loc) read-string)
        openai-key (env :openai-key)
        openai-creds {:api-key openai-key}
        conj-client (martian-http/bootstrap-swagger "http://localhost:8080/swag.json" {:server-url "https://conj.app"})]
    (if profile
      (do
        (log/infof "Loaded profile %s" (:name profile))
        (begin-job! openai-creds conj-client [profile file-loc]))
      (log/infof "Couldn't find any profiles in %s" profile))))

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
  (martian/explore m :get-threads)
  (def req (martian/request-for m :get-board {:board "random"}))
  (print req)
  ;; (def response (http-client/request (assoc-in req [:headers] {"Accept" "application/json"})))
  (def res (martian/response-for m :get-board {:board "random"}))
  (pprint/pprint (:body res))
  (count (:body res))
  (print res)
  ;; (print m)
  (def profile (->> (slurp "candace.edn") read-string))
  (def openai-key "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")
  (begin-job! {:api-key openai-key} m [profile "candace.edn"])
  (-main "profiles.edn"))