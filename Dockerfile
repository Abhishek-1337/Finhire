# Multi-stage Dockerfile for Finhire backend + frontend

# Backend build stage
FROM node:20-alpine AS backend-build
WORKDIR /app/backend

COPY finhire-backend/package.json finhire-backend/package-lock.json finhire-backend/tsconfig.json ./
COPY finhire-backend/prisma ./prisma
COPY finhire-backend/src ./src

RUN npm install
RUN npm run build

# Frontend build stage
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

COPY finhire-frontend/package.json finhire-frontend/package-lock.json finhire-frontend/tsconfig.json finhire-frontend/tsconfig.app.json finhire-frontend/tsconfig.node.json finhire-frontend/vite.config.ts finhire-frontend/index.html ./
COPY finhire-frontend/public ./public
COPY finhire-frontend/src ./src

RUN npm install
RUN npm run build

# Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app

# Backend runtime files
COPY --from=backend-build /app/backend/dist ./finhire-backend/dist
COPY --from=backend-build /app/backend/package.json ./finhire-backend/package.json
COPY --from=backend-build /app/backend/node_modules ./finhire-backend/node_modules

# Frontend static assets
COPY --from=frontend-build /app/frontend/dist ./finhire-frontend/dist

RUN npm install -g serve

WORKDIR /app/finhire-backend
ENV PORT=4000
EXPOSE 4000 4173

CMD ["sh", "-c", "serve -s /app/finhire-frontend/dist -l 4173 & node dist/index.js"]
