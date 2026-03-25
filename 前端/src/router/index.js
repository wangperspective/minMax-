// 路由配置
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 布局组件
const Layout = () => import('@/components/layout/index.vue')

// 页面组件
const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Users = () => import('@/views/system/Users.vue')
const Roles = () => import('@/views/system/Roles.vue')
const Menus = () => import('@/views/system/Menus.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '系统首页', icon: 'DashboardOutlined' }
      },
      {
        path: 'system',
        name: 'System',
        meta: { title: '系统管理', icon: 'SettingOutlined' },
        children: [
          {
            path: 'users',
            name: 'Users',
            component: Users,
            meta: { title: '用户管理', icon: 'UserOutlined' }
          },
          {
            path: 'roles',
            name: 'Roles',
            component: Roles,
            meta: { title: '角色管理', icon: 'TeamOutlined' }
          },
          {
            path: 'menus',
            name: 'Menus',
            component: Menus,
            meta: { title: '菜单管理', icon: 'MenuOutlined' }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = userStore.isLoggedIn

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 后台管理系统` : '后台管理系统'

  // 不需要认证的页面直接放行
  if (to.meta.requiresAuth === false) {
    if (to.path === '/login' && isLoggedIn) {
      next('/dashboard')
    } else {
      next()
    }
    return
  }

  // 需要认证的页面
  if (!isLoggedIn) {
    next('/login')
    return
  }

  // 已登录但没有用户信息，获取用户信息
  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
      next()
    } catch (error) {
      next('/login')
    }
    return
  }

  next()
})

export default router
