# 后台管理系统 - 前端

基于 Vue3 + Ant Design Vue + ECharts 的后台管理系统前端。

## 技术栈

- **框架**: Vue3 (Composition API)
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI组件**: Ant Design Vue 4
- **图表**: ECharts 5
- **HTTP客户端**: Axios
- **构建工具**: Vite

## 项目结构

```
前端/
├── src/
│   ├── api/             # API接口
│   │   ├── request.js   # 请求封装
│   │   └── index.js     # 接口定义
│   ├── assets/          # 静态资源
│   ├── components/      # 组件
│   │   └── layout/      # 布局组件
│   │       └── index.vue
│   ├── router/          # 路由配置
│   │   └── index.js
│   ├── stores/          # Pinia状态管理
│   │   └── user.js      # 用户状态
│   ├── utils/           # 工具函数
│   │   └── index.js
│   ├── views/           # 页面组件
│   │   ├── Login.vue    # 登录页
│   │   ├── Dashboard.vue # 首页
│   │   └── system/      # 系统管理
│   │       ├── Users.vue
│   │       ├── Roles.vue
│   │       └── Menus.vue
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── .env.development     # 开发环境变量
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd 前端
npm install
```

### 2. 配置环境变量

`.env.development` 文件配置：

```env
# API配置
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_TITLE=后台管理系统
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 构建生产版本

```bash
npm run build
```

构建结果在 `dist` 目录。

## 默认账号

- **管理员**: admin / admin123
- **普通用户**: user / admin123

## 功能模块

### 1. 登录/退出
- JWT 令牌认证
- 自动令牌刷新
- 路由权限拦截

### 2. 系统首页
- 数据统计卡片
- ECharts 图表展示
- 登录趋势分析
- 用户状态分布
- 角色分布统计

### 3. 用户管理
- 用户列表查询
- 新增/编辑用户
- 删除用户
- 重置密码
- 状态管理

### 4. 角色管理
- 角色列表
- 新增/编辑角色
- 删除角色
- 分配菜单权限

### 5. 菜单管理
- 菜单树形展示
- 新增/编辑菜单
- 删除菜单
- 支持多级菜单

## 开发说明

### API 请求封装

所有请求通过 `src/api/request.js` 统一处理：

- 自动添加认证令牌
- 统一错误处理
- 401 自动刷新令牌
- 请求/响应拦截

### 状态管理

使用 Pinia 进行状态管理，主要状态：

```javascript
// 用户状态
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
userStore.login(loginForm)  // 登录
userStore.logout()          // 退出
userStore.hasPermission()   // 权限检查
```

### 路由守卫

路由守卫在 `src/router/index.js` 中实现：

- 未登录自动跳转登录页
- 已登录自动跳转首页
- 自动获取用户信息和权限

### 样式规范

- 使用 Ant Design Vue 组件库
- 遵循响应式布局
- 卡片圆角 8px
- 统一阴影和间距

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 生产环境部署

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 环境变量

生产环境创建 `.env.production`：

```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_APP_TITLE=后台管理系统
```

## License

MIT
