// 工具函数

// 获取客户端IP
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
}

// 分页计算
function getPagination(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  return { page: parseInt(page), pageSize: parseInt(pageSize), offset };
}

// 构建分页响应
function buildPaginationResponse(data, total, page, pageSize) {
  return {
    data,
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

// 树形结构构建
function buildTree(items, parentId = 0) {
  const tree = [];
  const childrenMap = {};

  // 先建立子节点映射
  items.forEach(item => {
    if (!childrenMap[item.parentId]) {
      childrenMap[item.parentId] = [];
    }
    childrenMap[item.parentId].push(item);
  });

  // 递归构建树
  function buildNode(parentId) {
    const children = childrenMap[parentId] || [];
    return children.map(item => ({
      ...item,
      children: buildNode(item.id)
    }));
  }

  return buildNode(parentId);
}

// 移除树中空children
function cleanTree(nodes) {
  return nodes.map(node => ({
    ...node,
    children: node.children && node.children.length > 0 ? cleanTree(node.children) : undefined
  }));
}

// 密码强度检查
function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;

  return {
    score,
    level: score <= 2 ? 'weak' : score <= 3 ? 'medium' : 'strong',
    checks
  };
}

// 驼峰转下划线
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// 下划线转驼峰
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 批量转换对象键名
function transformKeys(obj, transformer) {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transformer));
  }

  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = transformer(key);
      result[newKey] = typeof obj[key] === 'object' && obj[key] !== null
        ? transformKeys(obj[key], transformer)
        : obj[key];
      return result;
    }, {});
  }

  return obj;
}

// 生成随机字符串
function randomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 时间格式化
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// 获取日期范围
function getDateRange(days = 7) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);

  return {
    start: formatDate(start, 'YYYY-MM-DD'),
    end: formatDate(end, 'YYYY-MM-DD')
  };
}

module.exports = {
  getClientIP,
  getPagination,
  buildPaginationResponse,
  buildTree,
  cleanTree,
  checkPasswordStrength,
  camelToSnake,
  snakeToCamel,
  transformKeys,
  randomString,
  formatDate,
  getDateRange
};
