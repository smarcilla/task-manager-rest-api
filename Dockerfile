
FROM node:25.6.0-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && \
    npm install -g corepack@latest --force && \
    corepack enable && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app


FROM base AS build


RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./


RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile


RUN pnpm prune --prod --ignore-scripts


FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production
USER node


COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 3000

CMD ["node", "src/index.js"]