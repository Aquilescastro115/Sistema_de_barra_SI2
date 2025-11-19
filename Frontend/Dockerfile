# ---- Etapa 1: Construcción ----
FROM node:20-alpine AS builder
LABEL stage=builder
WORKDIR /app

# Copiar archivos de dependencias primero (para cache)
COPY package*.json ./

# Instalar dependencias
# Si no tienes package-lock.json, puedes usar: RUN npm install
RUN npm ci

# Copiar el resto del proyecto
COPY . .

RUN npm install

# Construir el proyecto (Vite generará /dist)
RUN npm run build


# ---- Etapa 2: Servir con Nginx ----
FROM nginx:alpine AS production
LABEL stage=production

# Borrar contenido por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar el build desde la primera etapa
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx personalizada (si tienes una)
# Si no tienes nginx.conf, puedes crear uno — te dejo un ejemplo más abajo
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Healthcheck opcional
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
