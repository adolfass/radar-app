module.exports = {
  apps: [
    {
      name: 'radar-backend',
      cwd: '/var/www/radar-bot/backend',
      script: 'npm',
      args: 'run start:prod',
      env: {
        NODE_ENV: 'production',
        PORT: '3002',
      },
      error_file: '/var/log/radar-backend-error.log',
      out_file: '/var/log/radar-backend-out.log',
      log_file: '/var/log/radar-backend-combined.log',
      time: true,
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
