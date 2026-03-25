// 菜单路由
const express = require('express');
const router = express.Router();
const {
  handleGetMenuList,
  handleGetMenuTree,
  handleGetMenuById,
  handleCreateMenu,
  handleUpdateMenu,
  handleDeleteMenu
} = require('../controllers/menu.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { createMenuValidation, idValidation } = require('../middleware/validation');

// 获取菜单列表（需要认证）
router.get('/list', authenticate, handleGetMenuList);

// 获取菜单树（需要认证）
router.get('/tree', authenticate, handleGetMenuTree);

// 获取菜单详情（需要认证）
router.get('/:id', authenticate, idValidation, handleGetMenuById);

// 创建菜单（需要管理员权限）
router.post('/', authenticate, authorize(1), createMenuValidation, handleCreateMenu);

// 更新菜单（需要管理员权限）
router.put('/:id', authenticate, authorize(1), idValidation, handleUpdateMenu);

// 删除菜单（需要管理员权限）
router.delete('/:id', authenticate, authorize(1), idValidation, handleDeleteMenu);

module.exports = router;
