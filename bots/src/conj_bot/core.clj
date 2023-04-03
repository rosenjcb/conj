(ns conj-bot.core
  (:require [clojure.pprint :as pprint]
            [clojure.tools.logging :as log]
            [environ.core :refer [env]]
            [wkok.openai-clojure.api :as api]
            [martian.core :as martian]
            [clj-http.cookies :as http-cookies]
            [martian.clj-http :as martian-http])
  (:gen-class))

(def default-model "text-davinci-003")

(def reddit-context " You are replying to a thread with the post: ")

(defn make-prompt [bot-desc post]
  {:model default-model
   :prompt (str bot-desc reddit-context "\"" post "\"")
   :max_tokens 60})

(defn make-new-post! [openai-creds conj-client board profile thread reply?]
  (try
    (let [op (first thread)
          replies (rest thread)
          comment (:comment op)
          random-reply (when reply? (rand-nth replies))
          prompt (make-prompt (:description profile) (str comment "\"\"" (:comment random-reply)))
          response (api/create-completion prompt openai-creds)
          reply (->> response :choices first :text)
          final-reply (when reply? (str "#" (:id random-reply) " " reply))]
      (log/infof "Here is your prompt %s" prompt)
      (log/infof "Making an reply to another user in the thread (not OP)? %s" reply?)
      (log/infof "Here's my response from openai %s" response)
      (martian/response-for conj-client :reply-thread {:board board :id (:id op) :comment (or final-reply reply)}))
    (catch Exception _ 
      (log/error "Something went wrong..."))))

(defn coin-flip! []
  (rand-nth [true false]))

(defn begin-job! [openai-creds conj-client profile]
  (log/infof "Loaded profile %s" (:name profile))
  (let [board (:board profile)
        threads (->> (martian/response-for conj-client :get-board {:board board}) :body)
        picked-threads (take 1 (shuffle threads))
        _ (log/infof "Picked threads with IDs: %s from board %s" (mapv #(:id (first %)) picked-threads) board)]
        (doseq [thread picked-threads]
          (make-new-post! openai-creds conj-client board profile thread (coin-flip!))
          (log/info "Successfully  made a new post. Sleeping for 60 seconds now."))
          ;; (Thread/sleep 60000))
        (log/info "Job's done!")))


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

(comment
  ;; (require '[environ.core :refer env])
  ;; (env :openai-key)
  (def my-cs (http-cookies/cookie-store))
  (def m (martian-http/bootstrap-swagger "http://localhost:8080/swag.json" {:interceptors (conj martian-http/default-interceptors (with-cookie-store my-cs))}))
  (martian/response-for m :authenticate {:email "test.mctest@pepechan.org" :pass "Frameshare8*8" :provider "conj" :cookie-store my-cs})
  (pprint/pprint (keys m))
  (pprint/pprint (:api-root m))
  (def m (assoc m :api-root "https://conj.app"))
  ;; (def m (bootstrap-json "swagger.json"))
  ;; (pprint/pprint m)
  (pprint/pprint (martian/explore m))
  (martian/explore m :reply-thread)
  ;; (def req (martian/request-for m :get-board {:board "random"}))
  ;; (print req)
  (def req (martian/request-for m :reply-thread {:board "random" :id 286 :comment "hello world"}))
  (pprint/pprint req)
  ;; (pprint/pprint (assoc req :multipart ""))
  ;; (as-multipart req)
  ;; (dissoc req :form-data)
  ;; (clj-http.client/request (as-multipart req))
  (pprint/pprint (martian/request-for m :reply-thread {:board "random" :id 286 :comment "hello world"}))
  (martian/response-for m :reply-thread {:board "random" :id 286 :comment "hello world"})
  ;; (def response (http-client/request (assoc-in req [:headers] {"Accept" "application/json"})))
  (def res (martian/response-for m :get-board {:board "random"}))
  (pprint/pprint (:body res))
  ;; (def res (martian/response-for m :authenticate {:email "yaakovrosenz@yahoo.com" :pass "Frameshare8*8" :provider "conj"}))
  (martian/response-for m :authenticate {:email "test.mctest@pepechan.org" :pass "Frameshare8*8" :provider "conj" :cookie-store my-cs})
  (clojure.pprint/pprint my-cs)
  (def post {:comment "hello world" :is_anonymous true})
  (def req (martian/request-for m :reply-thread {:board "random" :id 152 :cookie-store my-cs :multipart-form post}))
  (def resp (martian/response-for m :reply-thread {:board "random" :id 152 :cookie-store my-cs}))
  (pprint/pprint req)
  (print m)
  (def profile (->> (slurp "candace.edn") read-string))
  (def openai-key "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")
  (begin-job! {:api-key openai-key} m profile)
  (-main "steven.edn"))