FROM node:22-alpine

WORKDIR /app

COPY package*.json  .

RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production

EXPOSE  3000 

CMD [ "node", "src/app.js" ]
