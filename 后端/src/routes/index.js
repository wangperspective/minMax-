// 路由汇总
const express = require('express');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const menuRoutes = require('./menu.routes');
const roleRoutes = require('./role.routes');
const statisticsRoutes = require('./statistics.routes');

function setupRoutes(app) {
  // API健康检查
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });

  // API路由
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/menus', menuRoutes);
  app.use('/api/roles', roleRoutes);
  app.use('/api/statistics', statisticsRoutes);
}

module.exports = setupRoutes;
