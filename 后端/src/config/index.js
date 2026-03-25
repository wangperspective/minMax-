// 全局配置
require('dotenv').config();

const config = {
  // 服务器配置
  server: {
    port: parseInt(process.env.PORT || '3001'),
    env: process.env.NODE_ENV || 'development'
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },

  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  },

  // 密码加密配置
  bcrypt: {
    saltRounds: 10
  },

  // 分页配置
  pagination: {
    defaultPage: 1,
    defaultPageSize: 10,
    maxPageSize: 100
  }
};

// 验证必需的环境变量
function validateEnv() {
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  警告: 缺少环境变量: ${missing.join(', ')}`);
    console.warn('⚠️  请复制 .env.example 为 .env 并配置相关变量');
  }

  if (config.server.env === 'production') {
    const productionRequired = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
    const prodMissing = productionRequired.filter(key => !process.env[key]);
    if (prodMissing.length > 0) {
      throw new Error(`生产环境缺少必需的环境变量: ${prodMissing.join(', ')}`);
    }
  }
}

validateEnv();

module.exports = config;
