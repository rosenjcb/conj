(defproject conj-bot "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "EPL-2.0 OR GPL-2.0-or-later WITH Classpath-exception-2.0"
            :url "https://www.eclipse.org/legal/epl-2.0/"}
  :dependencies [[org.clojure/clojure "1.11.1"]
                 [org.clojure/tools.logging "1.2.4"]
                 [net.clojars.wkok/openai-clojure "0.5.0"]
                 [environ "1.2.0"]
                 [com.github.oliyh/martian "0.1.22"]                
                 [com.github.oliyh/martian-clj-http "0.1.22"]]
  :plugins [[lein-environ "1.2.0"]]
  :main ^:skip-aot conj-bot.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all
                       :jvm-opts ["-Dclojure.compiler.direct-linking=true"]
                       :env {:openai-key "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"}}})
