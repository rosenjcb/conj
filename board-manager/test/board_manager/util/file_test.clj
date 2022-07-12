(ns board-manager.util.file-test
  (:require [board-manager.util.file :as util.file]
            [clojure.test :refer [deftest is testing]]))

(deftest split-extension
  (testing "Non-string returns nil"
    (is (= nil (util.file/split-extension nil)))
    (is (= nil (util.file/split-extension 30)))
    (is (= nil (util.file/split-extension {}))))
  (testing "Non-extension strings return nil"
    (is (= nil (util.file/split-extension "hello world"))))
  (testing "Extension strings return result map"
    (is (= {:name "google" :extension"com"} (util.file/split-extension "google.com")))
    (is (= {:name "jacob.rosenzweig@gmail" :extension "com"} (util.file/split-extension "jacob.rosenzweig@gmail.com")))))
