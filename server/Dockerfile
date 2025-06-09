FROM node:23-slim

WORKDIR /server

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
