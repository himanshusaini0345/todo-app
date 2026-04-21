module.exports = {
  apps: [
    {
      name: "prod-backend",
      script: "server.js",
      cwd: "./backend",
      env: {
        PORT: 4002,
        MONGO_URI: "mongodb://127.0.0.1:27017/todo_prod",
      }
    },
    {
      name: "prod-frontend",
      script: "serve.js",
      cwd: "./frontend",
      env: {
        PORT: 5002,
        BUILD_FOLDER: "build-prod-v2"
      }
    }
  ]
};
