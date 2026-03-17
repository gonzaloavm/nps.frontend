#!/bin/sh

# 1. Crear la carpeta assets si no existe (por si acaso)
mkdir -p /usr/share/nginx/html/assets

# 2. Generar el config.json con la variable de entorno de Docker
cat <<EOF > /usr/share/nginx/html/assets/config.json
{
  "apiUrl": "${API_URL}"
}
EOF

echo "Configuración generada con API_URL: ${API_URL}"

# 3. Arrancar Nginx
nginx -g "daemon off;"