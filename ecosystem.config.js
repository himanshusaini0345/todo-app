const environments = require('./environments.json');

const getApps = (envName) => {
  const config = environments[envName];
  if (!config) return [];

  const apps = [
    {
      name: `${envName}-backend`,
      script: "server.js",
      cwd: config.backend.DEPLOY_FOLDER ? `./${config.backend.DEPLOY_FOLDER}` : "./backend",
      watch: envName === 'development',
      watch_options: {
        followSymlinks: false,
        usePolling: true,
        interval: 1000
      },
      ignore_watch: ["node_modules", "logs", "deploy"],
      env: {
        PORT: config.backend.PORT,
        MONGO_URI: config.backend.MONGO_URI,
        NODE_ENV: envName
      }
    }
  ];

  if (config.frontend.VITE_DEV) {
    apps.push({
      name: `${envName}-frontend`,
      script: "./node_modules/vite/bin/vite.js",
      args: `--port ${config.frontend.PORT}`,
      cwd: "./frontend",
      env: {
        PORT: config.frontend.PORT,
        NODE_ENV: envName
      }
    });
  } else {
    apps.push({
      name: `${envName}-frontend`,
      script: "./node_modules/serve/build/main.js",
      args: `-s ${config.frontend.BUILD_FOLDER} -p ${config.frontend.PORT}`,
      cwd: "./frontend",
      env: {
        PORT: config.frontend.PORT,
        NODE_ENV: envName
      }
    });
  }

  return apps;
};

const APP_ENV = process.env.APP_ENV;
let appsToRun = [];

if (APP_ENV) {
  appsToRun = getApps(APP_ENV);
} else {
  // If no specific env is requested, include all environments
  Object.keys(environments).forEach(env => {
    appsToRun = appsToRun.concat(getApps(env));
  });
}

module.exports = {
  apps: appsToRun
};
