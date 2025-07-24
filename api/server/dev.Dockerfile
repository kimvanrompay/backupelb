ARG NODE_VERSION=22
ARG YARN_VERSION=4.6.0

# Prune the dependencies and build the application
FROM node:${NODE_VERSION}-alpine AS base

FROM base AS builder
ENV NODE_ENV=production

WORKDIR /app

RUN corepack enable \
    && corepack prepare yarn@${YARN_VERSION}
#COPY . .
#RUN yarn install

# Expose the port that the application listens on.
EXPOSE 3000

#--mount=type=secret,id=postgres_password POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password) && echo $POSTGRES_PASSWORD

# Run the application.
CMD yarn workspace api-server dev
