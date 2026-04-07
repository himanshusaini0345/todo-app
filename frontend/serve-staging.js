const { execSync } = require('child_process');
execSync('npx.cmd serve -s build-staging-v1 -p 5001', { stdio: 'inherit' });
