// 菜单服务
const { query } = require('../config/database');
const { AppError } = require('../middleware/error');
const { buildTree } = require('../utils/helpers');
const logger = require('../utils/logger');

// 获取菜单列表
async function getMenuList(params) {
  try {
    const { status } = params;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];

    if (status !== undefined && status !== '') {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }

    const menus = await query(
      `SELECT id, parent_id, menu_name, menu_type, menu_icon, route_path,
              component, permission, sort_order, visible, status, created_at
       FROM menus
       ${whereClause}
       ORDER BY sort_order ASC, id ASC`,
      queryParams
    );

    return menus;
  } catch (error) {
    logger.error('Get menu list error', { error: error.message });
    throw new AppError('获取菜单列表失败', 500, 'GET_MENU_LIST_ERROR');
  }
}

// 获取菜单树
async function getMenuTree(params) {
  try {
    const menus = await getMenuList(params);

    // 构建树形结构
    const tree = buildTree(menus.map(m => ({
      id: m.id,
      parentId: m.parentId,
      name: m.menuName,
      type: m.menuType,
      icon: m.menuIcon,
      path: m.routePath,
      component: m.component,
      permission: m.permission,
      sortOrder: m.sortOrder,
      visible: m.visible,
      status: m.status,
      createdAt: m.createdAt
    })), 0);

    return tree;
  } catch (error) {
    logger.error('Get menu tree error', { error: error.message });
    throw new AppError('获取菜单树失败', 500, 'GET_MENU_TREE_ERROR');
  }
}

// 获取菜单详情
async function getMenuById(id) {
  try {
    const menus = await query(
      `SELECT * FROM menus WHERE id = ?`,
      [id]
    );

    if (menus.length === 0) {
      throw new AppError('菜单不存在', 404, 'MENU_NOT_FOUND');
    }

    return menus[0];
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Get menu by id error', { error: error.message, id });
    throw new AppError('获取菜单详情失败', 500, 'GET_MENU_ERROR');
  }
}

// 创建菜单
async function createMenu(data, req) {
  try {
    const { parentId, menuName, menuType, menuIcon, routePath, component, permission, sortOrder, visible, status } = data;

    // 如果有父ID，检查父菜单是否存在
    if (parentId && parentId > 0) {
      const parent = await query(
        `SELECT id FROM menus WHERE id = ?`,
        [parentId]
      );

      if (parent.length === 0) {
        throw new AppError('父菜单不存在', 404, 'PARENT_MENU_NOT_FOUND');
      }
    }

    const result = await query(
      `INSERT INTO menus (parent_id, menu_name, menu_type, menu_icon, route_path, component, permission, sort_order, visible, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parentId || 0,
        menuName,
        menuType,
        menuIcon,
        routePath,
        component,
        permission,
        sortOrder || 0,
        visible !== undefined ? visible : 1,
        status !== undefined ? status : 1
      ]
    );

    const menuId = result.insertId;

    logger.info('Menu created', { menuId, menuName, createdBy: req.user?.id });

    return await getMenuById(menuId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Create menu error', { error: error.message });
    throw new AppError('创建菜单失败', 500, 'CREATE_MENU_ERROR');
  }
}

// 更新菜单
async function updateMenu(id, data, req) {
  try {
    const { parentId, menuName, menuType, menuIcon, routePath, component, permission, sortOrder, visible, status } = data;

    // 检查菜单是否存在
    const existing = await query(
      `SELECT id FROM menus WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      throw new AppError('菜单不存在', 404, 'MENU_NOT_FOUND');
    }

    // 不能将菜单设置为自己的子菜单
    if (parentId && parentId == id) {
      throw new AppError('不能将菜单设置为自己的子菜单', 400, 'INVALID_PARENT_MENU');
    }

    // 构建更新字段
    const updateFields = [];
    const updateValues = [];

    if (parentId !== undefined) {
      updateFields.push('parent_id = ?');
      updateValues.push(parentId || 0);
    }
    if (menuName !== undefined) {
      updateFields.push('menu_name = ?');
      updateValues.push(menuName);
    }
    if (menuType !== undefined) {
      updateFields.push('menu_type = ?');
      updateValues.push(menuType);
    }
    if (menuIcon !== undefined) {
      updateFields.push('menu_icon = ?');
      updateValues.push(menuIcon);
    }
    if (routePath !== undefined) {
      updateFields.push('route_path = ?');
      updateValues.push(routePath);
    }
    if (component !== undefined) {
      updateFields.push('component = ?');
      updateValues.push(component);
    }
    if (permission !== undefined) {
      updateFields.push('permission = ?');
      updateValues.push(permission);
    }
    if (sortOrder !== undefined) {
      updateFields.push('sort_order = ?');
      updateValues.push(sortOrder);
    }
    if (visible !== undefined) {
      updateFields.push('visible = ?');
      updateValues.push(visible);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return await getMenuById(id);
    }

    updateValues.push(id);

    await query(
      `UPDATE menus SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    logger.info('Menu updated', { menuId: id, updatedBy: req.user?.id });

    return await getMenuById(id);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Update menu error', { error: error.message, id });
    throw new AppError('更新菜单失败', 500, 'UPDATE_MENU_ERROR');
  }
}

// 删除菜单
async function deleteMenu(id, req) {
  try {
    // 检查菜单是否存在
    const existing = await query(
      `SELECT id FROM menus WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      throw new AppError('菜单不存在', 404, 'MENU_NOT_FOUND');
    }

    // 检查是否有子菜单
    const children = await query(
      `SELECT id FROM menus WHERE parent_id = ?`,
      [id]
    );

    if (children.length > 0) {
      throw new AppError('该菜单下有子菜单，无法删除', 400, 'HAS_CHILDREN');
    }

    await query(
      `DELETE FROM menus WHERE id = ?`,
      [id]
    );

    // 删除角色菜单关联
    await query(
      `DELETE FROM role_menus WHERE menu_id = ?`,
      [id]
    );

    logger.info('Menu deleted', { menuId: id, deletedBy: req.user?.id });

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Delete menu error', { error: error.message, id });
    throw new AppError('删除菜单失败', 500, 'DELETE_MENU_ERROR');
  }
}

module.exports = {
  getMenuList,
  getMenuTree,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu
};
