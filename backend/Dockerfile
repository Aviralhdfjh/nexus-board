# Backend (Node/Express/Socket.io) for Railway — avoids Railpack build-plan issues
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
EXPOSE 3001

CMD ["node", "server.js"]
