#!/bin/bash

set -e

echo "========================================"
echo "🚀 Starting deployment"
echo "========================================"

# Project directory
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

echo "📁 App directory: $APP_DIR"

# --------------------------------------------------
# Node environment
# --------------------------------------------------

export NODE_ENV=production
export ENV=production

echo "========================================"
echo "🔧 Environment"
echo "NODE_ENV=$NODE_ENV"
echo "ENV=$ENV"
echo "========================================"

# --------------------------------------------------
# Find Node / npm
# --------------------------------------------------

NODE_BIN="$(command -v node || true)"
NPM_BIN="$(command -v npm || true)"

if [ -z "$NODE_BIN" ]; then
    echo "❌ Node.js not found"
    exit 1
fi

if [ -z "$NPM_BIN" ]; then
    echo "❌ npm not found"
    exit 1
fi

echo "Node: $NODE_BIN"
echo "npm : $NPM_BIN"

node -v
npm -v

# --------------------------------------------------
# Install dependencies
# --------------------------------------------------

echo "========================================"
echo "📦 Installing dependencies"
echo "========================================"

if [ -f package-lock.json ]; then
    npm ci --omit=dev
else
    npm install --omit=dev
fi

# --------------------------------------------------
# Database migrations
# --------------------------------------------------

echo "========================================"
echo "🗄️ Running database migrations"
echo "========================================"

./node_modules/.bin/sequelize db:migrate --env production

echo "✅ Migrations completed"

# --------------------------------------------------
# DO NOT RUN SEEDERS
# --------------------------------------------------

echo "========================================"
echo "🌱 Seeders skipped"
echo "========================================"

# --------------------------------------------------
# Restart application
# --------------------------------------------------

echo "========================================"
echo "♻️ Restarting application"
echo "========================================"

# Hostinger Passenger usually detects restart.txt
mkdir -p tmp
touch tmp/restart.txt

# If your Hostinger setup uses passenger directly,
# this file is enough to trigger restart.

echo "========================================"
echo "✅ Deployment completed"
echo "========================================"