# Multi-stage Dockerfile for HireAI ATS

# ----- Stage 1: Backend Builder & Runner -----
FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
COPY prisma ../prisma/
RUN npm ci
COPY backend/ ./
RUN npx prisma generate --schema=../prisma/schema.prisma
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]

# ----- Stage 2: Frontend Builder & Nginx Runner -----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:alpine AS frontend
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
