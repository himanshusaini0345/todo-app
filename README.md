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

### Step 1: Initialize the Application Data
We begin by establishing our base application data. **Note**: This script must be run from the `backend` directory to access required dependencies like `mongoose`.

```bash
cd backend
node scripts/seed.js
cd ..
```

---

This project follows a precise multi-phase workflow to ensure zero-downtime during schema migrations. `main` serves as the production-ready source of truth.

### 1. Branching Strategy
For any new feature requiring a schema change, follow this sequence:
- **Phase 1 (Migration)**: Create a branch from `main` specifically for database structural changes.
  ```bash
  git checkout -b feature/my-feature-migration main
  ```
- **Phase 2 (Final)**: Create a branch from the migration branch for the logic and UI implementation.
  ```bash
  git checkout -b feature/my-feature-final feature/my-feature-migration
  ```

### 2. Local Development & Testing
Since there is no persistent `dev` branch, testing is performed directly from your feature branches using the **Development** environment:
1. Start the Dev environment: `$env:APP_ENV="development"; npx pm2 start ecosystem.config.js`
2. Apply migrations locally to the `todo_dev` database.
3. Verify that the app handles both the migration and final states.

### 3. Promotion Pipeline (The Zero-Downtime Flow)
To ensure "Complete Isolation" and no downtime during a schema shift, use the centralized deployment script to promote validated code from your development folder to the environment-specific deployment folders.

1. **Deploy Backend (Compatibility Phase)**: Push the compatible code to the target environment.
   ```bash
   # Push to Staging
   node scripts/deploy.js staging
   
   # Push to Production
   node scripts/deploy.js production
   ```
2. **Backfill Data**: Once the compatible backend is running in the isolated folder, execute the migration/backfill script.
3. **Deploy Frontend**: Build and deploy the new UI.
4. **Cleanup**: Finally, promote the cleanup code using the same `scripts/deploy.js` command.
