#!/bin/sh
echo "{\"apiUrl\": \"$API_URL\"}" > /usr/share/nginx/html/assets/config.json
nginx -g "daemon off;"