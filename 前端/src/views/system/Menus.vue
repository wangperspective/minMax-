<template>
  <div class="menus-page">
    <!-- 操作按钮 -->
    <div class="toolbar">
      <a-space>
        <a-button type="primary" @click="handleAdd(null)">
          <template #icon><PlusOutlined /></template>
          新增根菜单
        </a-button>
        <a-button @click="loadData">刷新</a-button>
      </a-space>
    </div>

    <!-- 数据表格 -->
    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
        row-key="id"
        :default-expand-all-rows="true"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'icon'">
            <component v-if="record.icon" :is="record.icon" />
            <span v-else>-</span>
          </template>

          <template v-else-if="column.key === 'menuType'">
            <a-tag :color="getMenuTypeColor(record.menuType)">
              {{ getMenuTypeLabel(record.menuType) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'visible'">
            <a-tag :color="record.visible === 1 ? 'success' : 'default'">
              {{ record.visible === 1 ? '显示' : '隐藏' }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '正常' : '禁用' }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleAdd(record)">新增子菜单</a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm
                title="确定要删除该菜单吗？"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :confirm-loading="modalLoading"
      width="600px"
    >
      <a-form ref="formRef" :model="form" :rules="formRules" :label-col="{ span: 6 }">
        <a-form-item label="上级菜单" name="parentId">
          <a-tree-select
            v-model:value="form.parentId"
            :tree-data="parentMenuTree"
            allow-clear
            placeholder="请选择上级菜单（不选则为根菜单）"
            :field-names="{ label: 'menuName', value: 'id', children: 'children' }"
          />
        </a-form-item>
        <a-form-item label="菜单类型" name="menuType">
          <a-radio-group v-model:value="form.menuType">
            <a-radio value="directory">目录</a-radio>
            <a-radio value="menu">菜单</a-radio>
            <a-radio value="button">按钮</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="菜单名称" name="menuName">
          <a-input v-model:value="form.menuName" placeholder="请输入菜单名称" />
        </a-form-item>
        <a-form-item label="菜单图标" name="menuIcon">
          <a-input v-model:value="form.menuIcon" placeholder="请输入图标名称（如 DashboardOutlined）" />
        </a-form-item>
        <a-form-item v-if="form.menuType !== 'button'" label="路由路径" name="routePath">
          <a-input v-model:value="form.routePath" placeholder="请输入路由路径（如 /dashboard）" />
        </a-form-item>
        <a-form-item v-if="form.menuType === 'menu'" label="组件路径" name="component">
          <a-input v-model:value="form.component" placeholder="请输入组件路径（如 dashboard/index）" />
        </a-form-item>
        <a-form-item label="权限标识" name="permission">
          <a-input v-model:value="form.permission" placeholder="请输入权限标识（如 dashboard:view）" />
        </a-form-item>
        <a-form-item label="排序号" name="sortOrder">
          <a-input-number v-model:value="form.sortOrder" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item v-if="form.menuType !== 'button'" label="是否显示" name="visible">
          <a-radio-group v-model:value="form.visible">
            <a-radio :value="1">显示</a-radio>
            <a-radio :value="0">隐藏</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getMenuList, createMenu, updateMenu, deleteMenu } from '@/api'
import { PlusOutlined } from '@ant-design/icons-vue'

// 数据源
const dataSource = ref([])
const loading = ref(false)

// 表格列
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80, key: 'id' },
  { title: '菜单名称', dataIndex: 'menuName', key: 'menuName' },
  { title: '图标', dataIndex: 'menuIcon', key: 'icon', width: 100 },
  { title: '类型', dataIndex: 'menuType', key: 'menuType', width: 100 },
  { title: '路由路径', dataIndex: 'routePath', key: 'routePath' },
  { title: '组件', dataIndex: 'component', key: 'component' },
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
  { title: '显示', dataIndex: 'visible', key: 'visible', width: 80 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 280, fixed: 'right' }
]

// 弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增菜单')
const modalLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: null,
  parentId: 0,
  menuName: '',
  menuType: 'menu',
  menuIcon: '',
  routePath: '',
  component: '',
  permission: '',
  sortOrder: 0,
  visible: 1,
  status: 1
})

const formRules = {
  menuName: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  menuType: [
    { required: true, message: '请选择菜单类型', trigger: 'change' }
  ]
}

// 上级菜单树（不含按钮）
const parentMenuTree = computed(() => {
  function filterTree(nodes) {
    return nodes
      .filter(node => node.menuType !== 'button')
      .map(node => ({
        ...node,
        children: node.children ? filterTree(node.children) : []
      }))
  }
  return filterTree(JSON.parse(JSON.stringify(dataSource.value)))
})

// 获取菜单类型颜色
const getMenuTypeColor = (type) => {
  const colors = {
    directory: 'blue',
    menu: 'green',
    button: 'orange'
  }
  return colors[type] || 'default'
}

// 获取菜单类型标签
const getMenuTypeLabel = (type) => {
  const labels = {
    directory: '目录',
    menu: '菜单',
    button: '按钮'
  }
  return labels[type] || type
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 使用菜单列表API获取原始数据
    const res = await getMenuList({})
    dataSource.value = buildTree(res.data || [])
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 构建树形数据
const buildTree = (flatData) => {
  const map = new Map()
  const tree = []

  // 先创建映射
  flatData.forEach(item => {
    map.set(item.id, { ...item, children: [] })
  })

  // 构建树
  flatData.forEach(item => {
    const node = map.get(item.id)
    if (item.parentId === 0) {
      tree.push(node)
    } else {
      const parent = map.get(item.parentId)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  return tree
}

// 新增
const handleAdd = (parentRecord) => {
  isEdit.value = false
  modalTitle.value = parentRecord ? '新增子菜单' : '新增根菜单'
  Object.assign(form, {
    id: null,
    parentId: parentRecord ? parentRecord.id : 0,
    menuName: '',
    menuType: 'menu',
    menuIcon: '',
    routePath: '',
    component: '',
    permission: '',
    sortOrder: 0,
    visible: 1,
    status: 1
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  isEdit.value = true
  modalTitle.value = '编辑菜单'
  Object.assign(form, {
    id: record.id,
    parentId: record.parentId,
    menuName: record.menuName,
    menuType: record.menuType,
    menuIcon: record.menuIcon,
    routePath: record.routePath,
    component: record.component,
    permission: record.permission,
    sortOrder: record.sortOrder,
    visible: record.visible,
    status: record.status
  })
  modalVisible.value = true
}

// 弹窗确定
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    modalLoading.value = true

    const data = { ...form }
    if (isEdit.value) {
      await updateMenu(data.id, data)
      message.success('更新成功')
    } else {
      await createMenu(data)
      message.success('创建成功')
    }

    modalVisible.value = false
    loadData()
  } catch (error) {
    if (error.errorFields) {
      message.warning('请检查表单')
    }
  } finally {
    modalLoading.value = false
  }
}

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.clearValidate()
}

// 删除
const handleDelete = async (id) => {
  try {
    await deleteMenu(id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.menus-page {
  padding: 0;
}

.toolbar {
  margin-bottom: 16px;
}

.table-card {
  border-radius: 8px;
}

.table-card :deep(.ant-table-tbody > tr > td) {
  padding: 8px 16px;
}
</style>
