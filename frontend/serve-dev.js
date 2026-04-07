const { execSync } = require('child_process');
execSync('npm.cmd run dev -- --port 5000', { stdio: 'inherit' });
