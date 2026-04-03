FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY news.json ./
COPY proto ./proto

RUN npm run build

EXPOSE 50051

CMD ["npm", "start"]
