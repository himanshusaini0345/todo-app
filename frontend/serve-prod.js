import { execSync } from 'child_process';
import process from 'process';
const folder = process.env.BUILD_FOLDER || 'build-prod-v1';
execSync(`npx.cmd serve -s ${folder} -p 5002`, { stdio: 'inherit' });
