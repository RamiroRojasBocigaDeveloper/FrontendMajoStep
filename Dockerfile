# ─── Etapa 1: Build Angular ──────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos primero (cache de npm)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copiar código fuente y compilar en modo producción
COPY . .
RUN npm run build -- --configuration production

# ─── Etapa 2: Servir con Nginx ───────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remover configuración default de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copiar los archivos compilados de Angular
# Angular 17+ con @angular/build:application genera en dist/<name>/browser
COPY --from=builder /app/dist/chancla-fron/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
