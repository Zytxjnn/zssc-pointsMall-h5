<template>
  <div class="settings-page">
    <!-- 导航栏 -->
    <xjnn-nav-bar title="设置" />

    <!-- 账号密码区域 -->
    <div class="form-section">
      <div class="section-title">账号密码</div>
      <van-cell-group>
        <van-field
          v-model="form.mobilePhone"
          name="mobilePhone"
          label="手机号"
          placeholder="请输入"
          type="tel"
          :rules="mobilePhoneRules"
          required
        />
        <van-field
          v-model="form.password"
          name="password"
          label="密码"
          placeholder="请输入"
          type="password"
          :rules="passwordRules"
          required
        />
        <van-field
          v-model="form.confirmPassword"
          name="confirmPassword"
          label="确认密码"
          placeholder="请输入"
          type="password"
          :rules="confirmPasswordRules"
          required
        />
      </van-cell-group>
    </div>

    <!-- 基本信息区域 -->
    <div class="form-section">
      <div class="section-title">基本信息</div>
      <van-cell-group>
        <van-field
          v-model="form.userName"
          name="userName"
          label="姓名"
          placeholder="请输入"
          :rules="nameRules"
          required
        />
        <van-field
          v-model="form.company"
          name="company"
          label="单位"
          placeholder="请选择"
          readonly
          is-link
          @click="onCompanyClick"
          :rules="companyRules"
          required
        />
        <van-field
          v-model="form.crew"
          name="crew"
          label="班组"
          placeholder="请选择"
          readonly
          is-link
          @click="onCrewClick"
          :rules="crewRules"
          required
        />
        <van-field
          v-model="form.position"
          name="position"
          label="工种/岗位"
          placeholder="请输入"
          :rules="positionRules"
          required
        />
        <van-field
          v-model="form.idCard"
          name="idCard"
          label="身份证号"
          placeholder="请输入"
          type="text"
        />
      </van-cell-group>
    </div>

    <!-- 下一步按钮 -->
    <div class="next-btn">
      <van-button
        block
        type="primary"
        native-type="submit"
        :loading="loading"
        @click="onNext"
      >
        下一步
      </van-button>
    </div>

    <!-- 单位选择器 -->
    <van-action-sheet
      v-model:show="showCompanyPicker"
      :actions="companyActions"
      @select="onCompanySelect"
      title="选择单位"
    />

    <!-- 班组选择器 -->
    <van-action-sheet
      v-model:show="showCrewPicker"
      :actions="crewActions"
      @select="onCrewSelect"
      title="选择班组"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import XjnnNavBar from '@/components/XjnnNavBar.vue'
import { userApi } from '@/api'

const router = useRouter()

// 表单数据
const form = reactive({
  mobilePhone: '',
  password: '',
  confirmPassword: '',
  userName: '',
  company: '', // 单位名称
  companyId: '', // 单位ID
  crew: '', // 班组名称
  crewId: '', // 班组ID
  position: '',
  idCard: ''
})

// 加载状态
const loading = ref(false)

// 选择器显示状态
const showCompanyPicker = ref(false)
const showCrewPicker = ref(false)

// 选择器数据
const companyActions = ref([])
const crewActions = ref([])

// 表单验证规则
const mobilePhoneRules = [
  { required: true, message: '请填写手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
]

const passwordRules = [
  { required: true, message: '请填写密码' },
  { min: 6, message: '密码至少6位' }
]

const confirmPasswordRules = [
  { required: true, message: '请确认密码' },
  {
    validator: (val) => val === form.password,
    message: '两次密码输入不一致'
  }
]

const nameRules = [
  { required: true, message: '请填写姓名' }
]

const companyRules = [
  { required: true, message: '请选择单位' }
]

const crewRules = [
  { required: true, message: '请选择班组' }
]

const positionRules = [
  { required: true, message: '请填写工种/岗位' }
]

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await userApi.getUserInfo()
    form.mobilePhone = res.mobilePhone
    form.userName = res.userName
    form.company = res.companyName || '' // 单位名称
    form.companyId = res.companyId || ''
    form.crew = res.crewName || '' // 班组名称
    form.crewId = res.crewId || ''
    form.position = res.post || ''
    form.idCard = res.idCard || ''
  } catch (error) {
    console.error('获取用户信息失败:', error)
    showToast('获取用户信息失败')
  }
}

onMounted(() => {
  getUserInfo()
})

// 单位点击
const onCompanyClick = async () => {
  try {
    // 获取单位列表
    const response = await userApi.getCompanyList()
    companyActions.value = response.map(item => ({
      name: item.name || item.companyName,
      value: item.id || item.companyId
    }))
    showCompanyPicker.value = true
  } catch (error) {
    console.error('获取单位列表失败:', error)
    showToast('获取单位列表失败')
  }
}

// 单位选择
const onCompanySelect = (action) => {
  form.company = action.name
  form.companyId = action.value
  // 清空班组选择，因为单位改变了
  form.crew = ''
  form.crewId = ''
  showCompanyPicker.value = false
}

// 班组点击
const onCrewClick = async () => {
  // 检查是否已选择单位
  if (!form.companyId) {
    showToast('请先选择单位')
    return
  }
  
  try {
    // 获取班组列表，传入companyId参数
    const response = await userApi.getCrewList({ companyId: form.companyId })
    crewActions.value = response.map(item => ({
      name: item.name || item.crewName,
      value: item.id || item.crewId
    }))
    showCrewPicker.value = true
  } catch (error) {
    console.error('获取班组列表失败:', error)
    showToast('获取班组列表失败')
  }
}

// 班组选择
const onCrewSelect = (action) => {
  form.crew = action.name
  form.crewId = action.value
  showCrewPicker.value = false
}

// 下一步
const onNext = async () => {
  // 表单验证
  if (!form.mobilePhone || !form.password || !form.confirmPassword || 
      !form.userName || !form.companyId || !form.crewId || !form.position) {
    showToast('请填写所有必填项')
    return
  }
  
  if (form.password !== form.confirmPassword) {
    showToast('两次密码输入不一致')
    return
  }
  
  loading.value = true
  
  try {
    // 调用更新用户信息接口
    const updateData = {
      mobilePhone: form.mobilePhone,
      password: form.password,
      newPassword: form.confirmPassword,
      companyId: form.companyId,
      crewId: form.crewId,
      userName: form.userName,
      post: form.position,
      idCard: form.idCard || ''
    }
    
    console.log('提交更新用户信息:', updateData)
    
    await userApi.updateUserInfo(updateData)
    
    showSuccessToast('设置成功！')
    
    // 跳转到下一页或返回
    setTimeout(() => {
      router.back()
    }, 1000)
    
  } catch (error) {
    console.error('设置失败:', error)
    showToast(error.message || '设置失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>



.settings-page {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 80px;
}

// 表单区域
.form-section {
  margin-bottom: 16px;
  background: $white;
  
  .section-title {
    padding: 16px 16px 8px;
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }
}

// 下一步按钮
.next-btn {
  margin: 24px 16px 0;
  
  :deep(.van-button--primary) {
    background: $primary-color;
    border: none;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;
  }
}

// 必填项星号样式
:deep(.van-field__label) {
  .van-field__label--required::before {
    color: #ee0a24;
  }
}
</style>
