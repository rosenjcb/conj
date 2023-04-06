(ns conj-bot.core
  (:require [clojure.tools.logging :as log]
            [environ.core :refer [env]]
            [wkok.openai-clojure.api :as api]
            [martian.core :as martian]
            [clj-http.cookies :as http-cookies]
            [martian.clj-http :as martian-http])
  (:gen-class))

(def default-model "text-davinci-003")

(def reddit-context " Please make a reply to the following thread below:")

(defn make-prompt [bot-desc post]
  {:model default-model
   :prompt (str bot-desc reddit-context "\"\"" post)
   :max_tokens 300})

(defn make-new-post! [openai-creds conj-client board profile thread reply?]
  (try
    (let [op (first thread)
          replies (rest thread)
          comment (:comment op)
          random-reply (when reply? (rand-nth replies))
          prompt (make-prompt (:description profile) (str "User: " comment "\"\" User: " (:comment random-reply) "\"\" You: "))
          response (api/create-completion prompt openai-creds)
          reply (->> response :choices first :text)
          final-reply (when reply? (str "#" (:id random-reply) " " reply))]
      (log/infof "Here is your prompt %s" prompt)
      (log/infof "Here's my response from openai %s" response)
      (martian/response-for conj-client :reply-thread {:board board :id (:id op) :comment (or final-reply reply)}))
    (catch Exception e 
      (log/errorf "Something went wrong... %s" e))))

(defn coin-flip! []
  (rand-nth [true false]))

(defn begin-job! [openai-creds conj-client profile]
  (log/infof "Loaded profile %s" (:name profile))
  (let [board (:board profile)
        threads (->> (martian/response-for conj-client :get-board {:board board}) :body)
        random-thread (first (shuffle threads))
        _ (log/infof "Picked threads with IDs: %s from board %s" (:id (first random-thread)) board)]
        (make-new-post! openai-creds conj-client board profile random-thread (coin-flip!))
        (log/info "Successfully  made a new post. Job's done")))

(defn with-cookie-store [cookie-store]
  {:name ::with-cookie-store
   :enter (fn [ctx]
            (assoc-in ctx [:request :cookie-store] cookie-store))})

(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (let [prof-loc (first args)
        profile (->> (slurp prof-loc) read-string)
        openai-key (env :openai-key)
        openai-creds {:api-key openai-key}
        {:keys [email password]} (:creds profile) 
        server-url (:server-url profile)
        url (str (or server-url "http://localhost:8080") "/swag.json")
        my-cs (http-cookies/cookie-store)
        conj-client (martian-http/bootstrap-swagger url {:interceptors (conj martian-http/default-interceptors (with-cookie-store my-cs))})
        _ (martian/response-for conj-client :authenticate {:email email :pass password :provider "conj" :cookie-store my-cs})]
    (if profile
      (begin-job! openai-creds conj-client profile)
      (log/infof "Couldn't find any profiles in %s" prof-loc))))
