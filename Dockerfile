# Stage 1: Base con pnpm configurado
FROM node:25.6.0-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 1. Instalamos certificados y forzamos la instalación de corepack
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && \
    npm install -g corepack@latest --force && \
    corepack enable && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Stage 2: Construcción e instalación
FROM base AS build

# 2. Herramientas de compilación (necesarias para bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./

# 3. Instalamos TODAS las dependencias (dev + prod)
# Esto permite que 'husky' se instale y el script 'prepare' se ejecute correctamente
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 4. Eliminamos dependencias de desarrollo
# --ignore-scripts: Evita que se ejecute el script 'prepare' que busca 'husky' (ya eliminado)
RUN pnpm prune --prod --ignore-scripts

# Stage 3: Runner
FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production
USER node

# Copiamos los node_modules limpios (solo producción)
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 3000

CMD ["node", "src/index.js"]