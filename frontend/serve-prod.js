const { execSync } = require('child_process');
execSync('npx.cmd serve -s build-prod-v1 -p 5002', { stdio: 'inherit' });
