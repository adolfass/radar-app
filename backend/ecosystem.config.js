module.exports = {
  apps: [
    {
      name: 'vizitka-backend',
      cwd: '/var/www/vizitka-bot/backend',
      script: 'npm',
      args: 'run start:prod',
      env: {
        NODE_ENV: 'production',
        PORT: '3002',
      },
      error_file: '/var/log/vizitka-backend-error.log',
      out_file: '/var/log/vizitka-backend-out.log',
      log_file: '/var/log/vizitka-backend-combined.log',
      time: true,
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
