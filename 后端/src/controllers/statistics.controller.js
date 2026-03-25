// 统计控制器
const {
  getDashboardData,
  getLoginTrend,
  getUserGrowthTrend
} = require('../services/statistics.service');
const logger = require('../utils/logger');

// 获取首页统计数据
async function handleGetDashboardData(req, res, next) {
  try {
    const data = await getDashboardData();

    res.json({
      success: true,
      code: 'GET_DASHBOARD_SUCCESS',
      data: data
    });
  } catch (error) {
    next(error);
  }
}

// 获取登录趋势
async function handleGetLoginTrend(req, res, next) {
  try {
    const days = parseInt(req.query.days) || 30;
    const trend = await getLoginTrend(days);

    res.json({
      success: true,
      code: 'GET_LOGIN_TREND_SUCCESS',
      data: trend
    });
  } catch (error) {
    next(error);
  }
}

// 获取用户增长趋势
async function handleGetUserGrowthTrend(req, res, next) {
  try {
    const days = parseInt(req.query.days) || 30;
    const trend = await getUserGrowthTrend(days);

    res.json({
      success: true,
      code: 'GET_USER_GROWTH_TREND_SUCCESS',
      data: trend
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleGetDashboardData,
  handleGetLoginTrend,
  handleGetUserGrowthTrend
};
