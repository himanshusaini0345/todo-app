const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const environments = require('../environments.json');

const targetEnv = process.argv[2];

if (!environments[targetEnv]) {
  console.error(`Error: Environment "${targetEnv}" not found in environments.json`);
  process.exit(1);
}

const config = environments[targetEnv].backend;
if (!config.DEPLOY_FOLDER) {
  console.error(`Error: DEPLOY_FOLDER not defined for environment "${targetEnv}"`);
  process.exit(1);
}

const sourceDir = path.join(__dirname, '../backend');
const targetDir = path.join(__dirname, '..', config.DEPLOY_FOLDER);

console.log(`🚀 Deploying ${targetEnv} to ${targetDir}...`);

// 1. Ensure target directory exists and is clean
if (fs.existsSync(targetDir)) {
    console.log(`🧹 Cleaning target directory: ${targetDir}`);
    fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

// 2. Copy source files (excluding node_modules)
console.log(`📦 Copying source files from ${sourceDir}...`);
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

// 4. Restart PM2 process
const processName = `${targetEnv}-backend`;
console.log(`🔄 Restarting PM2 process: ${processName}...`);
try {
  execSync(`npx pm2 restart "${processName}"`, { stdio: 'inherit' });
} catch (err) {
  console.log(`⚠️ PM2 restart failed (process might not be running). Attempting to start with ecosystem config...`);
  try {
     execSync(`npx pm2 start ecosystem.config.js --only "${processName}"`, { stdio: 'inherit' });
  } catch (startErr) {
     console.error(`❌ Failed to start process ${processName}`);
  }
}

console.log(`✅ Deployment to ${targetEnv} complete!`);
