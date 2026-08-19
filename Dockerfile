# ─── Stage 1: Build React app ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files and install dependencies
COPY package*.json ./
RUN npm ci --prefer-offline

# Copy all frontend source
COPY . .

# Build with VITE_API_URL as empty string so nginx proxy handles /api/* routing
# Override this build-arg if you want to point to an external backend URL
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─── Stage 2: Serve with Nginx ─────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
