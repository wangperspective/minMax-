<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="用户总数"
            :value="overview.userCount"
            :prefix="h(UserOutlined)"
            :value-style="{ color: '#1890ff' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="今日新增"
            :value="overview.todayUsers"
            :prefix="h(UserAddOutlined)"
            :value-style="{ color: '#52c41a' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="今日登录"
            :value="overview.todayLogins"
            :prefix="h(LoginOutlined)"
            :value-style="{ color: '#faad14' }"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic
            title="菜单总数"
            :value="overview.menuCount"
            :prefix="h(MenuOutlined)"
            :value-style="{ color: '#722ed1' }"
          />
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="16" class="charts-row">
      <!-- 登录趋势图 -->
      <a-col :xs="24" :lg="16">
        <a-card title="登录趋势（最近7天）" class="chart-card">
          <div ref="loginTrendRef" class="chart"></div>
        </a-card>
      </a-col>

      <!-- 用户状态分布 -->
      <a-col :xs="24" :lg="8">
        <a-card title="用户状态分布" class="chart-card">
          <div ref="userStatusRef" class="chart"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="charts-row">
      <!-- 角色分布 -->
      <a-col :xs="24" :lg="12">
        <a-card title="角色分布" class="chart-card">
          <div ref="roleDistRef" class="chart"></div>
        </a-card>
      </a-col>

      <!-- 快捷操作 -->
      <a-col :xs="24" :lg="12">
        <a-card title="快捷操作" class="chart-card">
          <a-space direction="vertical" style="width: 100%" size="middle">
            <a-button type="primary" block @click="goTo('/system/users')">
              <template #icon><UserOutlined /></template>
              用户管理
            </a-button>
            <a-button block @click="goTo('/system/roles')">
              <template #icon><TeamOutlined /></template>
              角色管理
            </a-button>
            <a-button block @click="goTo('/system/menus')">
              <template #icon><MenuOutlined /></template>
              菜单管理
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, h, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getDashboardData } from '@/api'
import {
  UserOutlined,
  UserAddOutlined,
  LoginOutlined,
  MenuOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const loginTrendRef = ref(null)
const userStatusRef = ref(null)
const roleDistRef = ref(null)

const overview = ref({
  userCount: 0,
  todayUsers: 0,
  todayLogins: 0,
  menuCount: 0,
  roleCount: 0
})

const loginTrend = ref([])
const userStatus = ref([])
const roleDistribution = ref([])

// 加载数据
const loadData = async () => {
  try {
    const res = await getDashboardData()
    overview.value = res.data.overview
    loginTrend.value = res.data.loginTrend
    userStatus.value = res.data.userStatus
    roleDistribution.value = res.data.roleDistribution

    await nextTick()
    initCharts()
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 初始化图表
const initCharts = () => {
  initLoginTrendChart()
  initUserStatusChart()
  initRoleDistChart()
}

// 登录趋势图
const initLoginTrendChart = () => {
  if (!loginTrendRef.value) return

  const chart = echarts.init(loginTrendRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: loginTrend.value.map(item => item.date),
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '登录次数',
        type: 'line',
        smooth: true,
        data: loginTrend.value.map(item => item.count),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ])
        },
        lineStyle: {
          color: '#1890ff',
          width: 2
        },
        itemStyle: {
          color: '#1890ff'
        }
      }
    ]
  }
  chart.setOption(option)

  // 响应式
  window.addEventListener('resize', () => chart.resize())
}

// 用户状态分布图
const initUserStatusChart = () => {
  if (!userStatusRef.value) return

  const chart = echarts.init(userStatusRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '用户状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: userStatus.value.map(item => ({
          value: item.count,
          name: item.status,
          itemStyle: {
            color: item.status === '正常' ? '#52c41a' : '#ff4d4f'
          }
        }))
      }
    ]
  }
  chart.setOption(option)

  window.addEventListener('resize', () => chart.resize())
}

// 角色分布图
const initRoleDistChart = () => {
  if (!roleDistRef.value) return

  const chart = echarts.init(roleDistRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: roleDistribution.value.map(item => item.name)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '用户数量',
        type: 'bar',
        data: roleDistribution.value.map(item => item.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 1, color: '#188df0' }
          ]),
          borderRadius: [5, 5, 0, 0]
        },
        barWidth: '60%'
      }
    ]
  }
  chart.setOption(option)

  window.addEventListener('resize', () => chart.resize())
}

const goTo = (path) => {
  router.push(path)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.charts-row {
  margin-bottom: 16px;
}

.chart-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart {
  width: 100%;
  height: 300px;
}
</style>
