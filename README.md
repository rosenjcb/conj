# Useful Commands

## Local Dev setup

`cd ./web-app && yarn start`

`cd ./board-manager && lein run`
Or use repl via `(user/go)`

## Local DB + Cache Setup

`sudo service postgresql restart`
`sudo service redis-server restart`

## DB Migrations

`lein migratus create name-of-migration`
`lein with-profile {{local|dev}} migrate`
