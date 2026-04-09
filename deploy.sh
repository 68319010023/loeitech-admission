#!/bin/bash

# Required environment variables:
# STACK_NAME (e.g. ltc-admission-test)
# IMAGE_TAG (e.g. test)
# BACKEND_PORT (e.g. 3002)
# FRONTEND_PORT (e.g. 5174)
# REGISTRY_URL
# DATABASE_URL
# JWT_SECRET
# FRONTEND_URL

echo "🚀 Deploying stack: $STACK_NAME with tag: $IMAGE_TAG"

# Write environment variables to .env for docker-compose
cat <<EOF > .env.$STACK_NAME
COMPOSE_PROJECT_NAME=$STACK_NAME
IMAGE_TAG=$IMAGE_TAG
BACKEND_PORT=$BACKEND_PORT
FRONTEND_PORT=$FRONTEND_PORT
REGISTRY_URL=$REGISTRY_URL
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=$FRONTEND_URL
EOF

# Pull the latest images
docker compose --env-file .env.$STACK_NAME pull

# Restart the containers
docker compose --env-file .env.$STACK_NAME up -d --remove-orphans

echo "✅ Deployment successful for $STACK_NAME"
