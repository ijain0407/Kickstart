#!/usr/bin/env bash
# Pull latest code and (re)start the API under pm2.
# Run this ON THE SERVER, from inside the cloned repo directory, any time
# there's a new commit to deploy (initial deploy or an update).
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
npm install --omit=dev

echo "Starting/reloading with pm2..."
if pm2 describe soccer-learn-api > /dev/null 2>&1; then
  pm2 reload deploy/ecosystem.config.cjs
else
  pm2 start deploy/ecosystem.config.cjs
  pm2 save
fi

echo "Done. Check status with: pm2 status"
echo "Check logs with: pm2 logs soccer-learn-api"
