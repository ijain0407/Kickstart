module.exports = {
  apps: [
    {
      name: "soccer-learn-api",
      script: "server/index.js",
      cwd: __dirname + "/..",
      env: {
        NODE_ENV: "production",
        PORT: 4010,
      },
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
};
