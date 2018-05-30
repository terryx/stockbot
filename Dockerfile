FROM node:8

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

RUN apt-get update && apt-get install sudo

RUN adduser node sudo

WORKDIR /home/node