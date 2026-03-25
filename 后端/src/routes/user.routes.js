// 用户路由
const express = require('express');
const router = express.Router();
const {
  handleGetUserList,
  handleGetUserById,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleResetPassword
} = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { createUserValidation, updateUserValidation, idValidation, paginationValidation } = require('../middleware/validation');

// 获取用户列表（需要认证）
router.get('/', authenticate, paginationValidation, handleGetUserList);

// 获取用户详情（需要认证）
router.get('/:id', authenticate, idValidation, handleGetUserById);

// 创建用户（需要管理员权限）
router.post('/', authenticate, authorize(1), createUserValidation, handleCreateUser);

// 更新用户（需要认证）
router.put('/:id', authenticate, updateUserValidation, handleUpdateUser);

// 删除用户（需要管理员权限）
router.delete('/:id', authenticate, authorize(1), idValidation, handleDeleteUser);

// 重置密码（需要管理员权限）
router.post('/:id/reset-password', authenticate, authorize(1), idValidation, handleResetPassword);

module.exports = router;
