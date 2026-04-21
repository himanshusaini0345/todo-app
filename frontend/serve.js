import { execSync } from 'child_process';
import process from 'process';

const folder = process.env.BUILD_FOLDER || 'dist';
const port = process.env.PORT || 5000;

console.log(`Starting static server for folder "${folder}" on port ${port}...`);

try {
  // Use npx serve to handle the static serving with SPA support (-s)
  execSync(`npx.cmd serve -s ${folder} -p ${port}`, { stdio: 'inherit' });
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
