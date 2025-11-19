# Usamos una imagen base de Node
FROM node:20-alpine AS base

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias primero para aprovechar el cache
COPY package*.json ./

# Instalamos las dependencias
RUN npm ci

# Copiamos el resto del proyecto
COPY . .

# Fase de desarrollo: Servir con el servidor de Vite (Hot Reload)
FROM base AS development

# Exponemos el puerto para el hot reload (Vite por defecto usa el puerto 3000)
EXPOSE 3000

# Comando para ejecutar el servidor de desarrollo (Hot Reload)
CMD ["npm", "run", "dev"]
