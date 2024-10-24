FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm ci

EXPOSE 3001

COPY . .

RUN npm run build

CMD ["npm", "start"]