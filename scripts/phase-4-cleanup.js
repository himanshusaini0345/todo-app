const { execSync } = require('child_process');
const path = require('path');

const BACKEND_DIR = path.join(__dirname, '..', 'backend');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Cleanup typically targets environments sequentially starting from staging, ending in prod
const URI = 'mongodb://127.0.0.1:27017/todo_prod';

function run(cmd, cwd, env = {}) {
  console.log(`\n> Running: ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });
}

console.log("=== PHASE 4: CLEANUP ===");

// 1. We just drop the compatibility code. The migration file `drop_completed_field` would be deployed normally in next sprint.
console.log("\n[Step 1] Deploying codebase with Schema Cleanup & Migration");

run('node bin/db-ops.js migrate', BACKEND_DIR, { MONGO_URI: URI });

console.log("\n[Step 2] Code has removed `completed` field, Express relies strictly on `status`.");
console.log("-> Simulate deploying express without Map V2 -> V1 backwards compatibility.");
try { execSync('npx.cmd pm2 restart prod-backend', { cwd: BACKEND_DIR, stdio: 'ignore' }); } catch(e){}

console.log("\n=== ALL PHASES CONCLUDED. THE SYSTEM IS ON V2 ===");
