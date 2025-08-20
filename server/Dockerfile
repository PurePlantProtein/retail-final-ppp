FROM node:20-alpine
WORKDIR /app
COPY package.json ./
# use npm install to avoid requiring package-lock.json in the repo
RUN npm install --production
COPY . .
EXPOSE 4000
CMD ["node","index.js"]
