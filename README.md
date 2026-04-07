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

## The Golden Rules

1. **Schema Contract**: Backends must remain backwards compatible reading from both schemas. Field removals/renames are strictly decoupled from inserts.
2. **Order of Operations**:
   - `mongodump` Backup
   - Migrate Database Structure
   - Deploy Backend Servers
   - Monitor Health Criteria
   - Deploy Frontend Code

## Features

- **Custom DB Toolbox**: Complete standalone node script (`db-ops.js`) providing automated timestamped migration stubs, batched `bulkWrite` migrations, state rollback execution, and `mongodump` snapshots.
- **Dynamic Feature Flags**: No rigid decoupling is needed. The React frontend pulls its active features dynamically on-mount from backend APIs.
- **Batched Deployments**: Operations on production databases slice workloads into 1000 document batches to keep thread pools fluid and untaxed.

---

## How to run the Simulation Walkthrough

> *Prerequisites: Node >= 20.x, MongoDB running locally on default port 27017. Install packages in `/frontend` and `/backend` directories first.*

### Step 1: Initialize the Application Data
We begin by establishing our base v1 application (where items are only standard booleans).
```bash
cd backend
node scripts/seed.js
```

### Step 2: Prepping the Environments
Build the V1 static payload representations (if you haven't already generated the scripts). You optionally can run `start-v1.ps1` to see the backend live before the pipeline shifts it.

### Step 3: Phase 2 - The Staging Rollout
The staging automator snapshots the staging database, migrates the new DB state into existence across 3,000 tasks effortlessly, flips the internal backend feature flag, and hot-swaps the staging process.
```bash
node scripts/phase-2-staging.js
```
*(Check your Staging React UI at `localhost:5001` — it should now visibly show Status badges instead of checkboxes.)*

### Step 4: Phase 3 - Production (The Zero-Lock Rollout)
Execute the identical payload but wrapped inside production safety monitors. This deploys the `up()` payload seamlessly in batches so database reads operate completely normally mid-migration. 
```bash
node scripts/phase-3-prod.js
```

### Step 5: Phase 4 - Technical Debt Scrubbing
In a real environment, you run this sprint *weeks* after verifying success. This explicitly wipes the `completed: boolean` values from the production `MongoDB` database and trims compatibility code out of your backend.
```bash
node scripts/phase-4-cleanup.js
```

### Rollback (In Case of Emergency)
At any point, if automated tests red-line, you can reverse the `status` structural pipeline exactly to its pristine pre-launch format:
```bash
cd backend
node bin/db-ops.js rollback
```
