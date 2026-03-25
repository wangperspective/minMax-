// 用户状态管理
import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getCurrentUser, refreshToken as refreshTokenApi } from '@/api'
import { message } from 'ant-design-vue'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    userInfo: null,
    menus: [],
    permissions: []
  }),

  getters: {
    // 是否已登录
    isLoggedIn: (state) => !!state.token,

    // 用户名
    username: (state) => state.userInfo?.username || '',

    // 真实姓名
    realName: (state) => state.userInfo?.realName || '',

    // 头像
    avatar: (state) => state.userInfo?.avatar || '',

    // 角色ID
    roleId: (state) => state.userInfo?.roleId || 0
  },

  actions: {
    // 登录
    async login(loginForm) {
      try {
        const res = await loginApi(loginForm)

        this.token = res.data.accessToken
        this.refreshToken = res.data.refreshToken
        this.userInfo = res.data.user

        // 保存token到本地存储
        localStorage.setItem('token', res.data.accessToken)
        localStorage.setItem('refreshToken', res.data.refreshToken)

        // 获取用户菜单权限
        await this.fetchUserInfo()

        message.success('登录成功')
        return true
      } catch (error) {
        message.error(error.message || '登录失败')
        return false
      }
    },

    // 退出登录
    async logout() {
      try {
        await logoutApi()
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        this.token = ''
        this.refreshToken = ''
        this.userInfo = null
        this.menus = []
        this.permissions = []

        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')

        router.push('/login')
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      if (!this.token) return

      try {
        const res = await getCurrentUser()
        this.userInfo = res.data
        this.menus = res.data.menus || []

        // 提取权限标识
        this.extractPermissions(this.menus)

        return res.data
      } catch (error) {
        // 获取用户信息失败，可能token过期
        await this.logout()
        throw error
      }
    },

    // 提取权限
    extractPermissions(menus) {
      const permissions = []

      function traverse(menuList) {
        menuList.forEach(menu => {
          if (menu.permission) {
            permissions.push(menu.permission)
          }
          if (menu.children && menu.children.length > 0) {
            traverse(menu.children)
          }
        })
      }

      traverse(menus)
      this.permissions = permissions
    },

    // 刷新访问令牌
    async refreshAccessToken() {
      try {
        const res = await refreshTokenApi({ refreshToken: this.refreshToken })

        this.token = res.data.accessToken
        localStorage.setItem('token', res.data.accessToken)

        return true
      } catch (error) {
        throw new Error('刷新令牌失败')
      }
    },

    // 检查权限
    hasPermission(permission) {
      if (this.roleId === 1) return true // 超级管理员拥有所有权限
      return this.permissions.includes(permission)
    }
  }
})
