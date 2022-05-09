FROM node:12-slim

WORKDIR /app

COPY package*.json .

RUN npm i

COPY . .

CMD ["node","index.js"]