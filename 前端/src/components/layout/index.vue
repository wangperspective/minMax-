<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      class="layout-sider"
    >
      <div class="logo">
        <h2 v-if="!collapsed">后台管理</h2>
        <h2 v-else>AM</h2>
      </div>

      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        :inline-collapsed="collapsed"
      >
        <template v-for="menu in menuTree" :key="menu.path">
          <!-- 有子菜单 -->
          <a-sub-menu v-if="menu.children && menu.children.length > 0" :key="menu.path">
            <template #icon>
              <component :is="menu.icon || 'MenuOutlined'" />
            </template>
            <template #title>{{ menu.name }}</template>
            <a-menu-item
              v-for="subMenu in menu.children"
              :key="subMenu.path"
              @click="handleMenuClick(subMenu.path)"
            >
              <template v-if="subMenu.icon" #icon>
                <component :is="subMenu.icon" />
              </template>
              {{ subMenu.name }}
            </a-menu-item>
          </a-sub-menu>

          <!-- 无子菜单 -->
          <a-menu-item v-else :key="menu.path" @click="handleMenuClick(menu.path)">
            <template #icon>
              <component :is="menu.icon || 'MenuOutlined'" />
            </template>
            {{ menu.name }}
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <!-- 头部 -->
      <a-layout-header :class="['layout-header', { collapsed }]">
        <div class="header-left">
          <MenuUnfoldOutlined v-if="collapsed" class="trigger" @click="collapsed = !collapsed" />
          <MenuFoldOutlined v-else class="trigger" @click="collapsed = !collapsed" />

          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <div class="header-right">
          <a-dropdown>
            <div class="user-info">
              <a-avatar :size="32">
                <template #icon>
                  <UserOutlined />
                </template>
              </a-avatar>
              <span class="username">{{ userStore.realName || userStore.username }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <UserOutlined />
                  个人信息
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区域 -->
      <a-layout-content :class="['layout-content', { collapsed }]">
        <router-view />
      </a-layout-content>

      <!-- 底部 -->
      <a-layout-footer :class="['layout-footer', { collapsed }]">
        后台管理系统 © 2024
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined as UserIcon,
  MenuOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const collapsed = ref(false)
const selectedKeys = ref([route.path])
const openKeys = ref([])

// 菜单树
const menuTree = computed(() => {
  return [
    {
      path: '/dashboard',
      name: '系统首页',
      icon: DashboardOutlined,
      children: []
    },
    {
      path: '/system',
      name: '系统管理',
      icon: SettingOutlined,
      children: [
        { path: '/system/users', name: '用户管理', icon: UserIcon },
        { path: '/system/roles', name: '角色管理', icon: TeamOutlined },
        { path: '/system/menus', name: '菜单管理', icon: MenuOutlined }
      ]
    }
  ]
})

// 面包屑
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})

// 监听路由变化，更新选中的菜单
watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]

    // 展开父菜单（仅在未折叠时）
    if (!collapsed.value) {
      const pathParts = path.split('/').filter(Boolean)
      if (pathParts.length > 1) {
        const parentPath = '/' + pathParts[0]
        openKeys.value = [parentPath]
      }
    }
  },
  { immediate: true }
)

// 监听折叠状态
watch(collapsed, (val) => {
  if (val) {
    openKeys.value = []
  }
})

// 菜单点击
const handleMenuClick = (path) => {
  router.push(path)
}

// 退出登录
const handleLogout = async () => {
  await userStore.logout()
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-sider {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  margin: 16px;
  border-radius: 8px;
}

.logo h2 {
  color: #fff;
  margin: 0;
  font-size: 20px;
}

.layout-header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-left: 200px;
  transition: margin-left 0.2s;
}

.layout-header.collapsed {
  margin-left: 80px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.breadcrumb {
  margin-left: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f0f0f0;
}

.username {
  font-size: 14px;
}

.layout-content {
  margin: 24px;
  margin-left: 224px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: calc(100vh - 64px - 70px - 48px);
  transition: margin-left 0.2s;
}

.layout-content.collapsed {
  margin-left: 104px;
}

.layout-footer {
  text-align: center;
  margin-left: 200px;
  transition: margin-left 0.2s;
}

.layout-footer.collapsed {
  margin-left: 80px;
}
</style>
