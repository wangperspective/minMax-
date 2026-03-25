// API请求封装
import axios from 'axios'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data

    // 如果返回的是文件流，直接返回
    if (response.config.responseType === 'blob') {
      return response
    }

    // 业务成功
    if (res.success || res.code === 'LOGIN_SUCCESS' || res.code === 'REFRESH_SUCCESS') {
      return res
    }

    // 业务失败
    message.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  async error => {
    const { response } = error

    // 网络错误
    if (!response) {
      message.error('网络连接失败，请检查网络')
      return Promise.reject(error)
    }

    const { status, data } = response

    // 401 未授权 - 尝试刷新token
    if (status === 401) {
      const userStore = useUserStore()

      // 如果有refreshToken，尝试刷新
      if (userStore.refreshToken) {
        try {
          await userStore.refreshAccessToken()
          // 重试原请求
          return request.request(error.config)
        } catch (refreshError) {
          // 刷新失败，退出登录
          userStore.logout()
          router.push('/login')
          message.error('登录已过期，请重新登录')
          return Promise.reject(refreshError)
        }
      } else {
        // 没有refreshToken，直接退出
        userStore.logout()
        router.push('/login')
        message.error(data?.message || '请先登录')
        return Promise.reject(error)
      }
    }

    // 403 禁止访问
    if (status === 403) {
      message.error(data?.message || '权限不足')
      return Promise.reject(error)
    }

    // 404 资源不存在
    if (status === 404) {
      message.error(data?.message || '请求的资源不存在')
      return Promise.reject(error)
    }

    // 500 服务器错误
    if (status >= 500) {
      message.error('服务器错误，请稍后重试')
      return Promise.reject(error)
    }

    // 其他错误
    message.error(data?.message || `请求失败 (${status})`)
    return Promise.reject(error)
  }
)

export default request
