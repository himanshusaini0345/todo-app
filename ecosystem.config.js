module.exports = {
  apps: [
    {
      name: "dev-backend",
      script: "server.js",
      cwd: "./backend",
      env: {
        PORT: 4000,
        MONGO_URI: "mongodb://127.0.0.1:27017/todo_dev",
      }
    },
    {
      name: "dev-frontend",
      script: "serve.js",
      interpreter: "node",
      cwd: "./frontend",
      env: {
        PORT: 5000,
        BUILD_FOLDER: "dist"
      }
    }
  ]
};
