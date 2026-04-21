# Zero-Downtime Deployment Simulation

A high-fidelity local demonstration of **Zero-Downtime Database Schema Migrations** and **Multi-Phase Pipeline Deployments**. This project simulates a real-world production environment where we transition a "Focus Flow" app from a legacy structure to an enum-based status system without interrupting the user experience.

---

## 🏛️ Simulation Architecture

This project mimics a professional cloud architecture on `localhost` using isolated directories and specific port mappings.

| Environment | Purpose | Backend | Frontend | Local MongoDB Database |
| :--- | :--- | :--- | :--- | :--- |
| **Dev** | Active Coding | 4000 | 5000 | `todo_dev` |
| **Staging** | Validation | 4001 | 5001 | `todo_staging` |
| **Prod** | User-Facing | 4002 | 5002 | `todo_prod` |

### Isolated Deployments
To ensure **Staging** and **Production** remain stable while you experiment in **Dev**, the project uses an isolated deployment strategy:
- `deploy/staging/`: Isolated snapshot of the code for the Staging environment.
- `deploy/production/`: Isolated snapshot for the Production environment.

---

## 🚀 The Multi-Phase Deployment Flow

The simulation is split into three core phases across three git branches.

### Branch Strategy
1.  **`main`**: The Production Baseline. (V1 UI + V1 Backend).
2.  **`feature/status-expansion`**: **Expansion Phase**. Backend supports *both* old and new fields (Dual-Schema). UI remains V1.
3.  **`feature/status-final`**: **Final UI Phase**. UI is upgraded to V2 (Status Badges). Backend remains Dual-Schema for safety.
4.  **`feature/status-contraction`**: **Contraction Phase**. Backend is "contracted" to support ONLY the new schema. Legacy code is removed.

---

## 🛠️ Step-by-Step Simulation Guide

### 1. Initial Setup
Ensure PM2 is installed and start the initial "Production" environment:
```powershell
npm install
$env:APP_ENV="production"; npx pm2 start ecosystem.config.js
```

### 2. Phase 1: Expansion (Deploy to Staging)
Switch to the expansion branch and promote the code to Staging:
```powershell
git checkout feature/status-expansion
node scripts/deploy.js staging
$env:APP_ENV="staging"; npx pm2 start ecosystem.config.js
```
*The Staging backend now writes to both `completed` (boolean) and `status` (enum).*

### 3. Phase 2: Data Backfill
Migrate existing legacy records in the staging database using the reversible backfill script:
```powershell
cd backend
# Perform Migration
node scripts/backfill-status.js staging
# Or Rollback if needed
node scripts/backfill-status.js staging --rollback
```

### 4. Phase 3: UI Upgrade
Promote the V2 UI to the Staging environment to verify the new user experience:
```powershell
git checkout feature/status-final
node scripts/deploy.js staging
npx pm2 restart staging-frontend staging-backend
```

### 5. Phase 4: Contraction (The Final Cleanup)
Once Staging is verified, promote to Production and finalize by removing the legacy code:
```powershell
git checkout feature/status-contraction
node scripts/deploy.js production
npx pm2 restart production-backend production-frontend
```

---

## 📡 Operational Tools

### 🏗️ `node scripts/deploy.js <env>`
Automates the isolation of source code. It copies the current branch state into the target `deploy/` directory, installs production dependencies, and prepares the environment for PM2.

### 🔄 Progressive Watcher (Dev Only)
The development backend (`development-backend`) is configured with a high-reliability **Polling Watcher**.
- It automatically reloads whenever you switch git branches or modify code.
- Check its status with `npx pm2 list` (Look for `watching: enabled`).

### 📊 Monitoring
```bash
npx pm2 monit   # Real-time resource monitoring
npx pm2 logs    # Combined tail of all environments
```

---

## 🧪 Database Inspection
To verify the migration was actually successful without downtime, inspect the raw data:
```powershell
# Check Dev DB
node -e "const { MongoClient } = require('mongodb'); MongoClient.connect('mongodb://127.0.0.1:27017').then(async (c) => { const d = await c.db('todo_dev').collection('todos').find().toArray(); console.log(d); c.close(); })"
```
