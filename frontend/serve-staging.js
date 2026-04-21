import { execSync } from 'child_process';
import process from 'process';
const folder = process.env.BUILD_FOLDER || 'build-staging-v1';
execSync(`npx.cmd serve -s ${folder} -p 5001`, { stdio: 'inherit' });
