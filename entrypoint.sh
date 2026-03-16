#!/bin/sh
# Creamos la carpeta assets por si no existe en el build de producción
mkdir -p /usr/share/nginx/html/assets

# Creamos el JSON con la variable de entorno que viene de Docker
echo "{\"apiUrl\": \"$API_URL\"}" > /usr/share/nginx/html/assets/config.json

echo "Config.json generado con URL: $API_URL"

# Iniciamos Nginx
nginx -g "daemon off;"
