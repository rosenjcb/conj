FROM 267892765183.dkr.ecr.us-west-2.amazonaws.com/openjdk
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
ENV GOOGLE_CLIENT_ID "602129467689-pe4l4im2nr62t14ae50quc1uj2dd5um1.apps.googleusercontent.com"
ENV GOOGLE_CLIENT_SECRET "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"
ENV ENV "dev"

CMD ["java", "-jar", "board-manager-0.1.0-SNAPSHOT-standalone.jar"]