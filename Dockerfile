FROM node:slim

WORKDIR /usr/app
COPY package*.json ./

RUN npm install
COPY . .

RUN npm run ts-build

EXPOSE 5000
CMD ["node", "server.js"]
