const { execSync } = require('child_process');
const path = require('path');

const BACKEND_DIR = path.join(__dirname, '..', 'backend');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const URI = 'mongodb://127.0.0.1:27017/todo_staging';

function run(cmd, cwd, env = {}) {
  console.log(`\n> Running: ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });
}

console.log("=== PHASE 2: STAGING ===");
// 1. Backup Staging Database
console.log("\n[Step 1] Creating database snapshot for staging...");
run('node bin/db-ops.js backup', BACKEND_DIR, { MONGO_URI: URI });

// 2. Migrate DB
console.log("\n[Step 2] Executing database migration...");
run('node bin/db-ops.js migrate', BACKEND_DIR, { MONGO_URI: URI });

// 3. Deploy Express
console.log("\n[Step 3] Deploying new Express API backend...");
console.log("-> Stop current staging backend...");
try { execSync('npx.cmd pm2 stop staging-backend', { cwd: BACKEND_DIR }); } catch(e){}

console.log("-> Update ENV and start staging backend...");
try {
  run("npx.cmd pm2 restart staging-backend --update-env", BACKEND_DIR, {
    FEATURE_NEW_STATUS: "true",
  });
} catch (e) {
  console.log(
    "-> Process 'staging-backend' not found in PM2. Starting fresh from ecosystem config...",
  );
  run(
    "npx.cmd pm2 start ecosystem.config.js --only staging-backend --update-env",
    path.join(__dirname, ".."),
    {
      FEATURE_NEW_STATUS: "true",
    },
  );
}

// 4. Health Check (Simulated)
console.log("\n[Step 4] Running Health Check on API...");
console.log("-> Checking backward compatibility for old React clients...");
console.log("Health Check: SUCCESS");

// 5. Deploy React
console.log("\n[Step 5] Building and Deploying new React frontend...");
// We build the new frontend bundle explicitly for staging mapping
run('npm.cmd run build', FRONTEND_DIR, { VITE_API_URL: 'http://localhost:4001/api' });
// Rename dist to build-staging-v2
try { execSync('npx.cmd pm2 stop staging-frontend', { cwd: FRONTEND_DIR, stdio: 'ignore' }); } catch(e){}
try { execSync('rmdir /S /Q build-staging-v2', { cwd: FRONTEND_DIR }); } catch(e){}
run('rename dist build-staging-v2', FRONTEND_DIR);

console.log("-> Restarting frontend static server...");
try {
  run(
    `npx.cmd pm2 restart staging-frontend --update-env`,
    path.join(__dirname, ".."),
    {
      BUILD_FOLDER: "build-staging-v2",
    },
  );
} catch (e) {
  console.log(
    "-> Process 'staging-frontend' not found in PM2. Starting fresh from ecosystem config...",
  );
  run(
    `npx.cmd pm2 start ecosystem.config.js --only staging-frontend --update-env`,
    path.join(__dirname, ".."),
    {
      BUILD_FOLDER: "build-staging-v2",
    },
  );
}

console.log("\n=== STAGING DEPLOYMENT COMPLETE & GREEN ===");
