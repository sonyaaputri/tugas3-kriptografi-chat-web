FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "node scripts/migrate.js && npm run start"]
