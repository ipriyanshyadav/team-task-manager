# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
# API calls go through nginx proxy, so /api is relative
RUN VITE_API_URL=/api npm run build

# ── Stage 2: Final image ──────────────────────────────────────────────────────
FROM python:3.11-slim

# Install nginx and supervisor
RUN apt-get update && apt-get install -y nginx supervisor && rm -rf /var/lib/apt/lists/*

# Backend
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Frontend static files
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default

# Supervisor config to run both nginx and uvicorn
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# HuggingFace Spaces runs as non-root; give write access for SQLite db
RUN mkdir -p /app/backend/data && chmod -R 777 /app/backend /var/log/nginx /var/lib/nginx /run

EXPOSE 7860

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
