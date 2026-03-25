// 菜单控制器
const {
  getMenuList,
  getMenuTree,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu
} = require('../services/menu.service');
const { logOperation } = require('../services/auth.service');
const logger = require('../utils/logger');

// 获取菜单列表
async function handleGetMenuList(req, res, next) {
  try {
    const menus = await getMenuList(req.query);

    res.json({
      success: true,
      code: 'GET_MENU_LIST_SUCCESS',
      data: menus
    });
  } catch (error) {
    next(error);
  }
}

// 获取菜单树
async function handleGetMenuTree(req, res, next) {
  try {
    const tree = await getMenuTree(req.query);

    res.json({
      success: true,
      code: 'GET_MENU_TREE_SUCCESS',
      data: tree
    });
  } catch (error) {
    next(error);
  }
}

// 获取菜单详情
async function handleGetMenuById(req, res, next) {
  try {
    const menu = await getMenuById(req.params.id);

    res.json({
      success: true,
      code: 'GET_MENU_SUCCESS',
      data: menu
    });
  } catch (error) {
    next(error);
  }
}

// 创建菜单
async function handleCreateMenu(req, res, next) {
  try {
    const menu = await createMenu(req.body, req);

    // 记录操作日志
    await logOperation(req.user.id, req.user.username, 'menu', '创建菜单', req, true);

    res.json({
      success: true,
      code: 'CREATE_MENU_SUCCESS',
      message: '创建菜单成功',
      data: menu
    });
  } catch (error) {
    next(error);
  }
}

// 更新菜单
async function handleUpdateMenu(req, res, next) {
  try {
    const menu = await updateMenu(req.params.id, req.body, req);

    // 记录操作日志
    await logOperation(req.user.id, req.user.username, 'menu', '更新菜单', req, true);

    res.json({
      success: true,
      code: 'UPDATE_MENU_SUCCESS',
      message: '更新菜单成功',
      data: menu
    });
  } catch (error) {
    next(error);
  }
}

// 删除菜单
async function handleDeleteMenu(req, res, next) {
  try {
    await deleteMenu(req.params.id, req);

    // 记录操作日志
    await logOperation(req.user.id, req.user.username, 'menu', '删除菜单', req, true);

    res.json({
      success: true,
      code: 'DELETE_MENU_SUCCESS',
      message: '删除菜单成功'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetMenuList,
  handleGetMenuTree,
  handleGetMenuById,
  handleCreateMenu,
  handleUpdateMenu,
  handleDeleteMenu
};
