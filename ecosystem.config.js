module.exports = {
  apps: [{
    name: 'chatapp-backend',
    script: './src/index.js',
    cwd: './backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001,
      MONGO_URI: 'mongodb+srv://chirabx:gvdR0HPrswATRUPl@cluster0.l5ake.mongodb.net/chat_db?retryWrites=true&w=majority&appName=Cluster0',
      JWT_SECRET: 'mysecretkey',
      CLOUDINARY_CLOUD_NAME: 'dqoyzkcad',
      CLOUDINARY_API_KEY: '919174126153144',
      CLOUDINARY_API_SECRET: 'DwTWy-CbG-k-9pugMC96bcx-NUw',
      DEEPSEEK_API_KEY: 'sk-07027c7184674f1aa67c3b28092b6052',
      IMAGE_API_KEY: 'sk-w4fiw0GuhdTNPq76MIUeODqM1JkUtUthNUkPNh9MvDzrI0My'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
