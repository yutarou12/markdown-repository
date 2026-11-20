FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
# 社内プロキシ環境では、任意のビルドシークレットでCAを渡せる。
RUN --mount=type=secret,id=npm_ca \
    if [ -f /run/secrets/npm_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; fi; \
    npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production API_PORT=3001 DATA_DIR=/app/data TZ=Asia/Tokyo
WORKDIR /app
COPY --chown=node:node package*.json ./
# tsxはTypeScriptのサーバーを実行するためのランタイムとして利用する。
RUN --mount=type=secret,id=npm_ca \
    if [ -f /run/secrets/npm_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/npm_ca; fi; \
    npm ci --omit=dev && mkdir -p /app/data && chown node:node /app/data
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/server ./server
USER node
EXPOSE 3001
CMD ["node", "--import", "tsx", "server/index.ts"]
