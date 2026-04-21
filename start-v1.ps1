Write-Host "Starting all environments with PM2..."
npx pm2 start ecosystem.config.js
npx pm2 list
Write-Host "All processes managed by PM2."
