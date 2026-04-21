const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const environments = require('../environments.json');

const targetEnv = process.argv[2];

if (!environments[targetEnv]) {
  console.error(`Error: Environment "${targetEnv}" not found in environments.json`);
  process.exit(1);
}

const config = environments[targetEnv];
if (!config || !config.backend || !config.backend.DEPLOY_FOLDER) {
  console.error(`Error: DEPLOY_FOLDER not defined for environment "${targetEnv}"`);
  process.exit(1);
}

const sourceDir = path.join(__dirname, '../backend');
const targetDir = path.join(__dirname, '..', config.backend.DEPLOY_FOLDER);

console.log(`🚀 Deploying ${targetEnv} backend to ${targetDir}...`);

// --- BACKEND PROMOTION ---

// 1. Ensure target directory exists and is clean
if (fs.existsSync(targetDir)) {
    console.log(`🧹 Cleaning target directory: ${targetDir}`);
    fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

// 2. Copy source files (excluding node_modules)
console.log(`📦 Copying backend source files from ${sourceDir}...`);
fs.cpSync(sourceDir, targetDir, {
  recursive: true,
  filter: (src) => {
    const isNodeModules = src.includes('node_modules');
    const isLog = src.endsWith('.log');
    return !isNodeModules && !isLog;
  }
});

// 3. Install dependencies in target directory
console.log(`📥 Installing production dependencies in ${targetDir}...`);
try {
  execSync('npm install --omit=dev', {
    cwd: targetDir,
    stdio: 'inherit'
  });
} catch (err) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// 4. Restart Backend PM2 process
const backendProcessName = `${targetEnv}-backend`;
console.log(`🔄 Restarting PM2 process: ${backendProcessName}...`);
try {
  execSync(`npx pm2 restart "${backendProcessName}"`, { stdio: 'inherit' });
} catch (err) {
  console.log(`⚠️ PM2 restart failed. Attempting to start...`);
  try {
     execSync(`npx pm2 start ecosystem.config.js --only "${backendProcessName}"`, { stdio: 'inherit' });
  } catch (startErr) {
     console.error(`❌ Failed to start process ${backendProcessName}`);
  }
}

// --- FRONTEND PROMOTION ---

console.log(`🏗️ Building and Promoting ${targetEnv} frontend...`);
const frontendDir = path.join(__dirname, '../frontend');
const apiUrl = `http://localhost:${config.backend.PORT}/api`;
const buildFolder = config.frontend.BUILD_FOLDER || `dist-${targetEnv}`;

try {
  console.log(`🔨 Running build with API URL: ${apiUrl}...`);
  execSync(`npx vite build --outDir ${buildFolder}`, {
    cwd: frontendDir,
    stdio: 'inherit',
    env: { 
      ...process.env, 
      VITE_API_URL: apiUrl 
    }
  });

  const frontendProcessName = `${targetEnv}-frontend`;
  console.log(`🔄 Restarting PM2 process: ${frontendProcessName}...`);
  try {
    execSync(`npx pm2 restart "${frontendProcessName}"`, { stdio: 'inherit' });
  } catch (err) {
    console.log(`⚠️ PM2 restart failed. Attempting to start...`);
    execSync(`npx pm2 start ecosystem.config.js --only "${frontendProcessName}"`, { stdio: 'inherit' });
  }
} catch (err) {
  console.error('❌ Frontend build/promotion failed');
  process.exit(1);
}

console.log(`✅ ${targetEnv.toUpperCase()} Full-Stack Deployment Complete!`);
