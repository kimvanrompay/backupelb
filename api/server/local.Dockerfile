ARG NODE_VERSION=22
ARG YARN_VERSION=4.6.0

# Prune the dependencies and build the application
FROM node:${NODE_VERSION}-alpine AS base

FROM base AS prebuilder
ENV NODE_ENV=production

WORKDIR /app

RUN corepack enable && corepack prepare yarn@${YARN_VERSION}
RUN yarn global add turbo@^2
COPY . .

RUN turbo prune api-server --docker

# Install the dependencies and build the application
FROM base AS installer
ENV NODE_ENV=production

WORKDIR /app
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

COPY --from=prebuilder /app/out/json/ .
RUN yarn install --immutable

FROM installer AS builder

WORKDIR /app
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

COPY --from=prebuilder /app/out/full/ .
COPY --from=installer /app/node_modules ./node_modules
RUN yarn workspace api-server build

# Copy the application and run it
FROM base AS runner
ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -S -g 1001 docker \
  && adduser -S nodejs -G docker -u 1001 -D

USER nodejs

COPY --from=builder --chown=node:docker /app/api/server/build/server.js ./api/server/build/server.js
# Expose the port that the application listens on.

EXPOSE 3000

RUN --mount=type=secret,id=postgres_password export POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password) && echo $POSTGRES_PASSWORD

# Run the application.
CMD node ./api/server/build/server.js
