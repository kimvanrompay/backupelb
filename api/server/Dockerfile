ARG NODE_VERSION=22
ARG YARN_VERSION=4.6.0

# Prune the dependencies and build the application
FROM public.ecr.aws/bitnami/node:22 AS base
ARG YARN_VERSION

FROM base AS prebuilder
ARG YARN_VERSION
ENV NODE_ENV=production

WORKDIR /app

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}
RUN npm install -g add turbo@^2
COPY . .

RUN turbo prune api-server --docker

# Install the dependencies and build the application
FROM base AS installer
ARG YARN_VERSION
ENV NODE_ENV=production

WORKDIR /app
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

COPY --from=prebuilder /app/out/json/ .
RUN yarn install --immutable

FROM installer AS builder
ARG YARN_VERSION

WORKDIR /app
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

COPY --from=prebuilder /app/out/full/ .
COPY tsconfig.json ./tsconfig.json
COPY --from=installer /app/node_modules ./node_modules
RUN yarn workspace api-server build

# Copy the application and run it on a DIFFERENT image!
FROM public.ecr.aws/bitnami/node:22 AS runner
ENV NODE_ENV=production

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.6.0

COPY --from=builder --chown=node:docker /app/api/server/build ./api/server/build

COPY --from=builder --chown=node:docker /app/yarn.lock ./yarn.lock
COPY --from=builder --chown=node:docker /app/.yarnrc.yml ./.yarnrc.yml

# COPY --from=builder --chown=node:docker --parents */*/package.json ./ # Only available in Docker 1.7-labs experimental feature
COPY --from=builder --chown=node:docker /app/api/server/package.json ./api/server/package.json
COPY --from=builder --chown=node:docker /app/package.json ./package.json
COPY --from=builder --chown=node:docker /app/libraries/db/package.json ./libraries/db/package.json
COPY --from=builder --chown=node:docker /app/libraries/errors/package.json ./libraries/errors/package.json
COPY --from=builder --chown=node:docker /app/libraries/models/package.json ./libraries/models/package.json
COPY --from=builder --chown=node:docker /app/libraries/repositories/package.json ./libraries/repositories/package.json
COPY --from=builder --chown=node:docker /app/libraries/services/package.json ./libraries/services/package.json
COPY --from=builder --chown=node:docker /app/libraries/utils/package.json ./libraries/utils/package.json

# Expose the port that the application listens on.
EXPOSE 3000

# Install the production dependencies.
RUN yarn workspaces focus --production --all

RUN addgroup -S -g 1001 docker \
  && adduser -S nodejs -G docker -u 1001 -D

USER nodejs

#RUN --mount=type=secret,id=postgres_password export POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password) && echo $POSTGRES_PASSWORD

CMD echo "AWS_PROFILE=$AWS_PROFILE" \
  && printenv | grep AWS \
  && node ./api/server/build/server.js
