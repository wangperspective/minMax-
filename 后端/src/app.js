// 后端服务入口文件
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/error');
const requestLogger = require('./middleware/logger');
const setupRoutes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// ==================== 中间件配置 ====================

// CORS配置
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use(requestLogger);

// 信任代理（获取真实IP）
app.set('trust proxy', 1);

// ==================== 路由配置 ====================

setupRoutes(app);

// ==================== 错误处理 ====================

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// ==================== 启动服务 ====================

async function startServer() {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.warn('数据库连接失败，服务将继续启动');
    }

    // 启动HTTP服务器
    const server = app.listen(config.server.port, () => {
      console.log('');
      console.log('========================================');
      console.log('🚀 后台管理系统后端服务启动成功');
      console.log('========================================');
      console.log(`📍 服务地址: http://localhost:${config.server.port}`);
      console.log(`🌍 环境: ${config.server.env}`);
      console.log(`📊 健康检查: http://localhost:${config.server.port}/health`);
      console.log('========================================');
      console.log('');
    });

    // 优雅关闭
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, starting graceful shutdown`);

      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // 强制退出超时
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// 启动服务
startServer();

module.exports = app;
