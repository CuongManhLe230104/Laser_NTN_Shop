# =============================================
# FRONTEND Dockerfile — Multi-stage Build
# Stage 1: Build với Node.js
# Stage 2: Serve với Nginx
# =============================================

# ---- Stage 1: Build ----
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
