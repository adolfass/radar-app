#!/bin/bash
# deploy.sh - Manual deployment script for RADAR
# Usage: ./deploy.sh [backend|frontend|all]

set -e

DEPLOY_DIR="/var/www/radar-app"
BACKEND_DIR="$DEPLOY_DIR/backend"
FRONTEND_DIR="$DEPLOY_DIR/frontend"

deploy_backend() {
  echo "🔨 Building backend..."
  cd "$BACKEND_DIR"
  npm run build
  
  echo "📦 Running migrations..."
  npx prisma migrate deploy
  
  echo "🔄 Restarting PM2..."
  chown -R agent:agent dist/
  su agent -c "pm2 restart radar-backend --update-env"
  su agent -c "pm2 save"
  
  echo "✅ Backend deployed"
}

deploy_frontend() {
  echo "🔨 Building frontend..."
  cd "$FRONTEND_DIR"
  npm run build
  
  echo "✅ Frontend deployed (nginx serves from dist/)"
}

case "${1:-all}" in
  backend)
    deploy_backend
    ;;
  frontend)
    deploy_frontend
    ;;
  all)
    deploy_backend
    deploy_frontend
    ;;
  *)
    echo "Usage: $0 [backend|frontend|all]"
    exit 1
    ;;
esac
