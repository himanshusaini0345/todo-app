Write-Host "Starting Dev..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node server.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev -- --port 5000"

Write-Host "Starting Staging..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; `$env:PORT=4001; `$env:MONGO_URI='mongodb://127.0.0.1:27017/todo_staging'; node server.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npx serve -s build-staging-v1 -p 5001"

Write-Host "Starting Prod..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; `$env:PORT=4002; `$env:MONGO_URI='mongodb://127.0.0.1:27017/todo_prod'; node server.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npx serve -s build-prod-v1 -p 5002"

Write-Host "All processes started in separate windows."
