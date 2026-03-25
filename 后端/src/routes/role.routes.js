// 角色路由
const express = require('express');
const router = express.Router();
const {
  handleGetRoleList,
  handleGetRoleById,
  handleCreateRole,
  handleUpdateRole,
  handleDeleteRole
} = require('../controllers/role.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { createRoleValidation, idValidation, paginationValidation } = require('../middleware/validation');

// 获取角色列表（需要认证）
router.get('/', authenticate, paginationValidation, handleGetRoleList);

// 获取角色详情（需要认证）
router.get('/:id', authenticate, idValidation, handleGetRoleById);

// 创建角色（需要管理员权限）
router.post('/', authenticate, authorize(1), createRoleValidation, handleCreateRole);

// 更新角色（需要管理员权限）
router.put('/:id', authenticate, authorize(1), idValidation, handleUpdateRole);

// 删除角色（需要管理员权限）
router.delete('/:id', authenticate, authorize(1), idValidation, handleDeleteRole);

module.exports = router;
