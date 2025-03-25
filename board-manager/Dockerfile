FROM 267892765183.dkr.ecr.us-west-2.amazonaws.com/openjdk
MAINTAINER Jacob Rosenzweig <rosenjcb@gmail.com>

WORKDIR /

COPY board-manager-0.1.0-SNAPSHOT-standalone.jar . 

ENV PORT 8080
ENV DB_HOST ""
ENV DB_USER "postgres"
ENV DB_PASS "Frameshare8*8"
ENV DB_PORT 5432
ENV DB_NAME "postgres"
ENV REDIS_PORT 6379
ENV REDIS_HOST "" 
ENV PASSPHRASE ""
ENV GOOGLE_CLIENT_ID ""
ENV GOOGLE_CLIENT_SECRET ""
ENV ENV "dev"

CMD ["java", "-jar", "board-manager-0.1.0-SNAPSHOT-standalone.jar"]
