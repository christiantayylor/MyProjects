FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

RUN mkdir -p /app/database

RUN node src/scripts/initDb.js

EXPOSE 5000

CMD ["node", "src/server.js"]