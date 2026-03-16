# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine
# Ajusta esta ruta si tu build de Angular genera una estructura distinta
COPY --from=build /app/dist/nps.frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el script de entrada
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

# Usamos el script para arrancar
ENTRYPOINT ["/entrypoint.sh"]
