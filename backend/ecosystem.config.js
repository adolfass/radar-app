module.exports = {
  apps: [{
    name: 'radar-backend',
    script: './dist/main.js',
    cwd: '/var/www/radar-app/backend',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: '3002'
    },
    error_file: '/var/www/radar-app/logs/error.log',
    out_file: '/var/www/radar-app/logs/out.log',
    time: true
  }]
};
