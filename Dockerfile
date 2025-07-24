FROM --platform=linux/amd64 node:22-alpine

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY libraries/ ./libraries/
COPY api/ ./api/
COPY .yarn/ .yarn/

RUN corepack enable && yarn install

COPY . .

RUN yarn workspace api-server build || yarn build

EXPOSE 3000

CMD ["node", "api/server/build/server.js"]


