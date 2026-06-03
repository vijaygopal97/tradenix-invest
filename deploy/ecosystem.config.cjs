module.exports = {
  apps: [
    {
      name: 'tradenix-api',
      script: 'src/server.js',
      cwd: '/var/www/tradenix-venture/backend',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '350M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
