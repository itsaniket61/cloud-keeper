#!/bin/bash

source docker.creds

echo ${USERNAME}
docker login -u "${USERNAME}" -p "${PASSWORD}"

docker-compose pull cloudkeeper

docker-compose up -d