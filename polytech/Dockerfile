FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY proto ./proto

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
