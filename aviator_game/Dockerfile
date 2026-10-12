FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY public ./public
COPY server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
