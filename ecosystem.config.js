module.exports = {
  apps: [
    {
      name: "staging-backend",
      script: "server.js",
      cwd: "./backend",
      env: {
        PORT: 4001,
        MONGO_URI: "mongodb://127.0.0.1:27017/todo_staging",
      }
    },
    {
      name: "staging-frontend",
      script: "serve.js",
      cwd: "./frontend",
      env: {
        PORT: 5001,
        BUILD_FOLDER: "build-staging-v2"
      }
    }
  ]
};
