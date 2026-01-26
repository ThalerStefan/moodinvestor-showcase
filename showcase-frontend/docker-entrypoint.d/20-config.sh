#!/bin/sh
set -e

# Generate config.json from template (prod values injected via env)
if [ -f /usr/share/nginx/html/config.template.json ]; then
  envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/config.json
fi

exit 0
