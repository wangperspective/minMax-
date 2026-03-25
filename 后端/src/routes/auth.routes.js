// 认证路由
const express = require('express');
const router = express.Router();
const {
  handleLogin,
  handleRefreshToken,
  handleGetCurrentUser,
  handleLogout
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { loginValidation } = require('../middleware/validation');

// 登录（不需要认证）
router.post('/login', loginValidation, handleLogin);

// 刷新令牌（不需要认证）
router.post('/refresh', handleRefreshToken);

// 获取当前用户信息（需要认证）
router.get('/current', authenticate, handleGetCurrentUser);

// 退出登录（需要认证）
router.post('/logout', authenticate, handleLogout);

module.exports = router;
