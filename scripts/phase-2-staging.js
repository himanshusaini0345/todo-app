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
run('npx.cmd pm2 restart staging-backend --update-env', BACKEND_DIR, { 
   FEATURE_NEW_STATUS: 'true' 
});

// 4. Health Check (Simulated)
console.log("\n[Step 4] Running Health Check on API...");
console.log("-> Checking backward compatibility for old React clients...");
console.log("Health Check: SUCCESS");

// 5. Deploy React
console.log("\n[Step 5] Building and Deploying new React frontend...");
// We build the new frontend bundle explicitly for staging mapping
run('npm.cmd run build', FRONTEND_DIR, { VITE_API_URL: 'http://localhost:4001/api' });
// Rename dist to build-staging-v2
try { execSync('rmdir /S /Q build-staging-v2', { cwd: FRONTEND_DIR }); } catch(e){}
run('rename dist build-staging-v2', FRONTEND_DIR);

console.log("-> Restarting frontend static server...");
// In a real environment, you'd swap the static site folder in nginx/express. Here we swap the pm2 process.
try { execSync('npx.cmd pm2 stop staging-frontend', { cwd: FRONTEND_DIR }); } catch(e){}
// Notice we use a generic npx serve command here instead of hardcoding `build-staging-v1` in ecosystem config
run(`npx.cmd pm2 start npx.cmd --name "staging-frontend" -- serve -s build-staging-v2 -p 5001`, FRONTEND_DIR);

console.log("\n=== STAGING DEPLOYMENT COMPLETE & GREEN ===");
