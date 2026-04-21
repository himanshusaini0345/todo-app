# Zero-Downtime Deployment Demonstration

A local MERN stack simulation meticulously built to demonstrate the exact workflow of **Zero-Downtime Database Schema Migrations** and **Multi-Phase Pipeline Deployments**.

We transition an Express + React app from a simple `completed: boolean` structure to a `status: enum('pending', 'in-progress', 'completed')` structure without dropping a single user.

## Architecture

To properly showcase Zero-Downtime deployment without requiring cloud infrastructure, this project mimics **Dev**, **Staging**, and **Prod** environments right on your `localhost`.

| Environment | Backend Port | Frontend Port | Local MongoDB Database |
|-------------|--------------|---------------|-------------------------|
| Dev         | `4000`       | `5000`        | `mongodb://127.0.0.1:27017/todo_dev` |
| Staging     | `4001`       | `5001`        | `mongodb://127.0.0.1:27017/todo_staging` |
| Prod        | `4002`       | `5002`        | `mongodb://127.0.0.1:27017/todo_prod` |

---

## Multi-Environment Management (PM2)

This project has been refactored to support a centralized, branch-independent management system using `PM2` and a unified `environments.json` configuration.

### Prerequisites

- PM2 installed globally: `npm install -g pm2`
- Project-level dependencies installed: `npm install` in root, `/frontend`, and `/backend`.

### Building the Environments

Since Staging and Production frontend are served as static assets, they must be built with the correct API URLs before starting:

```powershell
# Build Staging
cd frontend
$env:VITE_API_URL="http://localhost:4001/api"; npx vite build --outDir dist-staging

# Build Production
$env:VITE_API_URL="http://localhost:4002/api"; npx vite build --outDir dist-prod
```

### Starting Environments with PM2

Use the `APP_ENV` flag to launch specific environments from the root directory:

#### 1. Development (Works with HMR/Dev Server)
```powershell
$env:APP_ENV="development"; npx pm2 start ecosystem.config.js
```

#### 2. Staging (Serves build from dist-staging)
```powershell
$env:APP_ENV="staging"; npx pm2 start ecosystem.config.js
```

#### 3. Production (Serves build from dist-prod)
```powershell
$env:APP_ENV="production"; npx pm2 start ecosystem.config.js
```

#### 4. All Environments Simultaneously
To start all 6 applications at once (Development, Staging, and Production), simply omit the environment flag:
```powershell
npx pm2 start ecosystem.config.js
```

### Monitoring
Check the status and logs of your environments:
```bash
npx pm2 list
npx pm2 logs
```
