<template>
  <div class="users-page">
    <!-- 搜索表单 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="用户名">
          <a-input v-model:value="searchForm.username" placeholder="请输入用户名" allowClear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="searchForm.status" placeholder="请选择状态" allowClear style="width: 120px">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="searchForm.roleId" placeholder="请选择角色" allowClear style="width: 150px">
            <a-select-option v-for="role in roleList" :key="role.id" :value="role.id">
              {{ role.roleName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon><SearchOutlined /></template>
              搜索
            </a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 操作按钮 -->
    <div class="toolbar">
      <a-space>
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新增用户
        </a-button>
      </a-space>
    </div>

    <!-- 数据表格 -->
    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '正常' : '禁用' }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'roleName'">
            <a-tag color="blue">{{ record.roleName || '未分配' }}</a-tag>
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button type="link" size="small" @click="handleResetPwd(record)">重置密码</a-button>
              <a-popconfirm
                title="确定要删除该用户吗？"
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
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="form.username" placeholder="请输入用户名" :disabled="isEdit" />
        </a-form-item>
        <a-form-item v-if="!isEdit" label="密码" name="password">
          <a-input-password v-model:value="form.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item label="真实姓名" name="realName">
          <a-input v-model:value="form.realName" placeholder="请输入真实姓名" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="form.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="手机号" name="phone">
          <a-input v-model:value="form.phone" placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item label="角色" name="roleId">
          <a-select v-model:value="form.roleId" placeholder="请选择角色" allowClear>
            <a-select-option v-for="role in roleList" :key="role.id" :value="role.id">
              {{ role.roleName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">正常</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="form.remark" placeholder="请输入备注" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getUserList, createUser, updateUser, deleteUser, resetPassword } from '@/api'
import { getRoleList } from '@/api'
import {
  SearchOutlined,
  PlusOutlined,
  UserOutlined
} from '@ant-design/icons-vue'

// 搜索表单
const searchForm = reactive({
  username: '',
  status: undefined,
  roleId: undefined
})

// 数据源
const dataSource = ref([])
const loading = ref(false)
const roleList = ref([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: total => `共 ${total} 条`
})

// 表格列
const columns = [
  { title: 'ID', dataIndex: 'id', width: 80, key: 'id' },
  { title: '头像', dataIndex: 'avatar', width: 80, key: 'avatar' },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '真实姓名', dataIndex: 'realName', key: 'realName' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '角色', dataIndex: 'roleName', key: 'roleName' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '最后登录', dataIndex: 'lastLoginTime', key: 'lastLoginTime' },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

// 弹窗
const modalVisible = ref(false)
const modalTitle = ref('新增用户')
const modalLoading = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: null,
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  roleId: undefined,
  status: 1,
  remark: ''
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await getUserList(params)
    dataSource.value = res.data.data
    pagination.total = res.data.pagination.total
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载角色列表
const loadRoles = async () => {
  try {
    const res = await getRoleList({})
    roleList.value = res.data.data || []
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    status: undefined,
    roleId: undefined
  })
  pagination.current = 1
  loadData()
}

// 表格变化
const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  modalTitle.value = '新增用户'
  Object.assign(form, {
    id: null,
    username: '',
    password: '',
    realName: '',
    email: '',
    phone: '',
    roleId: undefined,
    status: 1,
    remark: ''
  })
  modalVisible.value = true
}

// 编辑
const handleEdit = (record) => {
  isEdit.value = true
  modalTitle.value = '编辑用户'
  Object.assign(form, {
    id: record.id,
    username: record.username,
    realName: record.realName,
    email: record.email,
    phone: record.phone,
    roleId: record.roleId,
    status: record.status,
    remark: record.remark
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
      await updateUser(data.id, data)
      message.success('更新成功')
    } else {
      await createUser(data)
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

// 重置密码
const handleResetPwd = async (record) => {
  try {
    await resetPassword(record.id, { newPassword: '123456' })
    message.success('密码已重置为: 123456')
  } catch (error) {
    message.error('重置密码失败')
  }
}

// 删除
const handleDelete = async (id) => {
  try {
    await deleteUser(id)
    message.success('删除成功')
    loadData()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  loadData()
  loadRoles()
})
</script>

<style scoped>
.users-page {
  padding: 0;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.toolbar {
  margin-bottom: 16px;
}

.table-card {
  border-radius: 8px;
}
</style>
