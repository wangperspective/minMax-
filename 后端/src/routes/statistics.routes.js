// 统计路由
const express = require('express');
const router = express.Router();
const {
  handleGetDashboardData,
  handleGetLoginTrend,
  handleGetUserGrowthTrend
} = require('../controllers/statistics.controller');
const { authenticate } = require('../middleware/auth');

// 获取首页统计数据（需要认证）
router.get('/dashboard', authenticate, handleGetDashboardData);

// 获取登录趋势（需要认证）
router.get('/login-trend', authenticate, handleGetLoginTrend);

// 获取用户增长趋势（需要认证）
router.get('/user-growth', authenticate, handleGetUserGrowthTrend);

module.exports = router;
