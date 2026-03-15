# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./
RUN npm ci

# Copiar el resto del código
COPY . .
RUN npm run build --prod

# Etapa de producción con nginx
FROM nginx:alpine
COPY --from=build /app/dist/nps-app /usr/share/nginx/html

# Copiar configuración personalizada de nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80