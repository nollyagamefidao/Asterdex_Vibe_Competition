module.exports = {
  apps: [{
    name: 'asterdex-bot',
    script: 'maravilla-with-dashboard.js',
    cwd: '/root/asterdex-bot',
    interpreter: 'node',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/root/asterdex-bot/logs/error.log',
    out_file: '/root/asterdex-bot/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }, {
    name: 'dashboard',
    script: 'npm',
    args: 'start',
    cwd: '/root/CryptoCompass',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production',
      PORT: '5000'
    },
    error_file: '/root/CryptoCompass/logs/error.log',
    out_file: '/root/CryptoCompass/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
