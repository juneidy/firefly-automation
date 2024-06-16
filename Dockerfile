FROM node:20.14.0-bookworm

WORKDIR /usr/src/app

COPY package.json ./
COPY src ./src/
COPY config ./config/

RUN npm i

USER node

CMD npm start
