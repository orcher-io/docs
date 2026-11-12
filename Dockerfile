# syntax=docker/dockerfile:1
#
# ORCHER docs site. Builds the Next.js standalone server and runs it with
# Node, listening on $PORT (default 3000; Render sets it).
#
#   docker build -t orcher-docs .
#   docker run -p 3000:3000 orcher-docs        # http://localhost:3000/docs
#
# Where the site is served is fixed at build time:
#   --build-arg NEXT_PUBLIC_BASE_PATH=          # serve from / (e.g. docs.orcher.io)
#   --build-arg NEXT_PUBLIC_SITE_URL=https://docs.orcher.io

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/common/package.json packages/common/
COPY packages/config/package.json packages/config/
COPY packages/ui/package.json packages/ui/
COPY packages/ui-patterns/package.json packages/ui-patterns/
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_BASE_PATH=/docs
ARG NEXT_PUBLIC_SITE_URL=https://orcher.io
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:${NODE_VERSION}-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
# The server reads guides and code samples from disk at request time; they
# are traced into the standalone bundle (outputFileTracingIncludes).
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
