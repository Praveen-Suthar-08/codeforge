FROM node:22-alpine

WORKDIR /app

# Install build dependencies for better-sqlite3 native compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Run DB migration and seed if not present
RUN npm run db:seed

EXPOSE 4000

CMD ["node", "src/index.js"]
