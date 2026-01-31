FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package.json tsconfig.json eslint.config.mjs vitest.config.mts .env /usr/src/app/

RUN npm i

EXPOSE 5050

ENTRYPOINT ["/bin/sh", "-c", "npm run dev"]
