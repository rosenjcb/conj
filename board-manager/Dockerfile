FROM java:openjdk-8-jre
MAINTAINER Jacob Rosenzweig <rosenjcb@gmail.com>

WORKDIR /

COPY board-manager-0.1.0-SNAPSHOT-standalone.jar . 

ENV PORT 8080
ENV DB_HOST "conj-db.c0l4wnpjgjdh.us-west-2.rds.amazonaws.com"
ENV DB_USER "postgres"
ENV DB_PASS "Frameshare8*8"
ENV DB_PORT 5432
ENV DB_NAME "postgres"
ENV REDIS_PORT 6379
ENV REDIS_HOST "conj-redis-cluster.ghplor.ng.0001.usw2.cache.amazonaws.com" 
ENV PASSPHRASE "Frameshare8*8"

CMD ["java", "-jar", "board-manager-0.1.0-SNAPSHOT-standalone.jar"]