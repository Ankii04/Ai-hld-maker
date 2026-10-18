# Multi-stage production Dockerfile for ArchMind Backend
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./

FROM base AS dependencies
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .

FROM node:20-alpine AS release
WORKDIR /app
ENV NODE_ENV=production

# Install curl for container healthcheck
RUN apk add --no-cache curl

COPY package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
