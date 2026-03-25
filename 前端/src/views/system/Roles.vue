<template>
  <div class="roles-page">
    <!-- 操作按钮 -->
    <div class="toolbar">
      <a-space>
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新增角色
        </a-button>
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
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '正常' : '禁用' }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" @click="handleAssignMenu(record)">分配权限</a-button>
              <a-popconfirm
                title="确定要删除该角色吗？"
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
    >
      <a-form ref="formRef" :model="form" :rules="formRules" :label-col="{ span: 6 }">
        <a-form-item label="角色名称" name="roleName">
          <a-input v-model:value="form.roleName" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色编码" name="roleCode">
          <a-input v-model:value="form.roleCode" placeholder="请输入角色编码" :disabled="isEdit" />
        </a-form-item>
        <a-form-item label="排序号" name="sortOrder">
          <a-input-number v-model:value="form.sortOrder" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="form.description" placeholder="请输入描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 分配权限弹窗 -->
    <a-modal
      v-model:open="menuModalVisible"
      title="分配菜单权限"
      width="600px"
      @ok="handleMenuModalOk"
      @cancel="menuModalVisible = false"
      :confirm-loading="menuModalLoading"
    >
      <a-tree
        v-model:checkedKeys="checkedMenuKeys"
        checkable
        :tree-data="menuTreeData"
        :field-names="{ children: 'children', title: 'name', key: 'id' }"
        :default-expand-all="true"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getRoleList, createRole, updateRole, deleteRole } from '@/api'
import { getMenuTree } from '@/api'
import { PlusOutlined } from '@ant-design/icons-vue'

// 数据源
const dataSource = ref([])
const loading = ref(false)

// 表格列
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80, key: 'id' },
  { title: '角色名称', dataIndex: 'roleName', key: 'roleName' },
  { title: '角色编码', dataIndex: 'roleCode', key: 'roleCode' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作', key: 'action', width: 250, fixed: 'right' }
]

// 弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增角色')
const modalLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: null,
  roleName: '',
  roleCode: '',
  description: '',
  sortOrder: 0,
  status: 1
})

const formRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '角色编码只能包含字母、数字和下划线', trigger: 'blur' }
  ]
}

// 菜单权限弹窗
const menuModalVisible = ref(false)
const menuModalLoading = ref(false)
const checkedMenuKeys = ref([])
const menuTreeData = ref([])
const currentRoleId = ref(null)

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getRoleList({})
    dataSource.value = res.data.data || []
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载菜单树
const loadMenuTree = async () => {
  try {
    const res = await getMenuTree({})
    menuTreeData.value = res.data || []
  } catch (error) {
    console.error('加载菜单树失败:', error)
  }
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  modalTitle.value = '新增角色'
  Object.assign(form, {
    id: null,
    roleName: '',
    roleCode: '',
    description: '',
    sortOrder: 0,
    status: 1
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  isEdit.value = true
  modalTitle.value = '编辑角色'
  Object.assign(form, {
    id: record.id,
    roleName: record.roleName,
    roleCode: record.roleCode,
    description: record.description,
    sortOrder: record.sortOrder,
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
      await updateRole(data.id, data)
      message.success('更新成功')
    } else {
      await createRole(data)
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

// 分配菜单
const handleAssignMenu = async (record) => {
  currentRoleId.value = record.id

  // 获取角色详情，包含已分配的菜单
  try {
    const { getRoleById } = await import('@/api')
    const res = await getRoleById(record.id)
    checkedMenuKeys.value = res.data.menuIds || []
  } catch (error) {
    checkedMenuKeys.value = []
  }

  menuModalVisible.value = true
}

// 保存菜单权限
const handleMenuModalOk = async () => {
  menuModalLoading.value = true
  try {
    await updateRole(currentRoleId.value, { menuIds: checkedMenuKeys.value })
    message.success('分配权限成功')
    menuModalVisible.value = false
  } catch (error) {
    message.error('分配权限失败')
  } finally {
    menuModalLoading.value = false
  }
}

// 删除
const handleDelete = async (id) => {
  try {
    await deleteRole(id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadData()
  loadMenuTree()
})
</script>

<style scoped>
.roles-page {
  padding: 0;
}

.toolbar {
  margin-bottom: 16px;
}

.table-card {
  border-radius: 8px;
}
</style>
