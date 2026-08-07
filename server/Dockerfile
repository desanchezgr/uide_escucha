FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY server/package*.json server/
RUN npm ci --workspace=server

COPY server/ server/
COPY openapi.yaml /openapi.yaml
RUN npm run build --workspace=server

FROM node:22-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

RUN mkdir -p /app/uploads && chown appuser:appgroup /app/uploads

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY openapi.yaml /openapi.yaml

EXPOSE 3000
USER appuser
CMD ["node_modules/.bin/tsx", "dist/index.js"]
