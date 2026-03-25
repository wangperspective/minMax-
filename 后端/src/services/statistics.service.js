// 统计服务
const { query } = require('../config/database');
const { AppError } = require('../middleware/error');
const { getDateRange } = require('../utils/helpers');
const logger = require('../utils/logger');

// 获取首页统计数据
async function getDashboardData() {
  try {
    // 用户总数
    const userCountResult = await query(
      `SELECT COUNT(*) as count FROM users WHERE status = 1`
    );

    // 今日新增用户
    const todayUserResult = await query(
      `SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()`
    );

    // 今日登录次数
    const todayLoginResult = await query(
      `SELECT COUNT(*) as count FROM operation_logs
       WHERE operation = '登录' AND DATE(created_at) = CURDATE()`
    );

    // 菜单总数
    const menuCountResult = await query(
      `SELECT COUNT(*) as count FROM menus WHERE status = 1`
    );

    // 角色总数
    const roleCountResult = await query(
      `SELECT COUNT(*) as count FROM roles WHERE status = 1`
    );

    // 最近7天登录统计
    const loginStatsResult = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM operation_logs
       WHERE operation = '登录' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // 用户状态分布
    const userStatusResult = await query(
      `SELECT status, COUNT(*) as count FROM users GROUP BY status`
    );

    // 角色分布
    const roleDistributionResult = await query(
      `SELECT r.role_name, COUNT(u.id) as count
       FROM roles r
       LEFT JOIN users u ON r.id = u.role_id AND u.status = 1
       GROUP BY r.id, r.role_name
       ORDER BY count DESC`
    );

    return {
      overview: {
        userCount: userCountResult[0].count,
        todayUsers: todayUserResult[0].count,
        todayLogins: todayLoginResult[0].count,
        menuCount: menuCountResult[0].count,
        roleCount: roleCountResult[0].count
      },
      loginTrend: loginStatsResult.map(row => ({
        date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
        count: row.count
      })),
      userStatus: userStatusResult.map(row => ({
        status: row.status === 1 ? '正常' : '禁用',
        count: row.count
      })),
      roleDistribution: roleDistributionResult.map(row => ({
        name: row.roleName,
        value: row.count
      }))
    };
  } catch (error) {
    logger.error('Get dashboard data error', { error: error.message });
    throw new AppError('获取统计数据失败', 500, 'GET_DASHBOARD_ERROR');
  }
}

// 获取登录趋势
async function getLoginTrend(days = 30) {
  try {
    const result = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM operation_logs
       WHERE operation = '登录' AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [days]
    );

    // 填充缺失日期
    const dateRange = getDateRange(days);
    const trend = [];

    let currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const found = result.find(r => {
        const rowDate = r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date;
        return rowDate === dateStr;
      });

      trend.push({
        date: dateStr,
        count: found ? found.count : 0
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trend;
  } catch (error) {
    logger.error('Get login trend error', { error: error.message });
    throw new AppError('获取登录趋势失败', 500, 'GET_LOGIN_TREND_ERROR');
  }
}

// 获取用户增长趋势
async function getUserGrowthTrend(days = 30) {
  try {
    const result = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM users
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [days]
    );

    // 填充缺失日期
    const dateRange = getDateRange(days);
    const trend = [];

    let currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const found = result.find(r => {
        const rowDate = r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date;
        return rowDate === dateStr;
      });

      trend.push({
        date: dateStr,
        count: found ? found.count : 0
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return trend;
  } catch (error) {
    logger.error('Get user growth trend error', { error: error.message });
    throw new AppError('获取用户增长趋势失败', 500, 'GET_USER_GROWTH_ERROR');
  }
}

module.exports = {
  getDashboardData,
  getLoginTrend,
  getUserGrowthTrend
};
