<template>
  <div class="register-page">
    <div class="page-header">
      <div class="page-title">注册</div>
    <!-- 欢迎横幅 -->
      <div class="welcome-banner">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2 class="greeting">您好, 欢迎使用</h2>
            <h1 class="app-name">云积分超市</h1>
          </div>
        </div>
        <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-number">
              <van-icon v-if="currentStep > 1" name="success" size="12" color="#fff" />
              <span v-else>1</span>
            </div>
            <div class="step-text">1 输入个人信息</div>
          </div>
          <div class="progress-line" :class="{ active: currentStep > 1 }"></div>
          <div class="progress-step" :class="{ active: currentStep === 2 }">
            <div class="step-number">2</div>
            <div class="step-text">2 确认账号密码</div>
          </div>
        </div>
      </div>
      </div>
          <!-- 进度指示器 -->

    </div>



    <!-- 注册表单 -->
    <div class="form-container">
      <van-form @submit="onSubmit">
        <!-- 第一步：个人信息 -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="form-card">
            <!-- 姓名 -->
            <van-field
              v-model="form.name"
              name="name"
              label="姓名"
              placeholder="请输入"
              :rules="nameRules"
              required
            />

            <!-- 单位 -->
            <van-field
              v-model="form.unitName"
              name="unit"
              label="单位"
              placeholder="请选择单位"
              readonly
              is-link
              @click="onUnitClick"
              :rules="unitRules"
              required
            />

            <!-- 工种/岗位 -->
            <van-field
              v-model="form.crewName"
              name="position"
              label="工种/岗位"
              placeholder="请选择工种/岗位"
              readonly
              is-link
              @click="onCrewClick"
              :rules="crewRules"
              required
            />

            <!-- 身份证号 -->
            <van-field
              v-model="form.idCard"
              name="idCard"
              label="身份证号"
              placeholder="请输入"
              :rules="idCardRules"
            />
          </div>
        </div>

        <!-- 第二步：账号密码 -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="form-card">
            <!-- 手机号 -->
            <van-field
              v-model="form.phone"
              name="phone"
              label="手机号"
              placeholder="请输入"
              type="tel"
              :rules="phoneRules"
              required
            />

            <!-- 密码 -->
            <van-field
              v-model="form.password"
              name="password"
              label="密码"
              placeholder="请输入"
              type="password"
              :rules="passwordRules"
              required
            />

            <!-- 确认密码 -->
            <van-field
              v-model="form.confirmPassword"
              name="confirmPassword"
              label="确认密码"
              placeholder="请输入"
              type="password"
              :rules="confirmPasswordRules"
              required
            />
          </div>
        </div>

        <div class="login-link">
            已有账号,<span @click="goToLogin"> 去登录</span>
          </div>

        <!-- 底部操作区域 -->
        <div class="bottom-actions">

          <div class="agreement">
            <van-checkbox v-model="agreedToTerms">我已阅读并同意<span class="agreement-link">《这里是协议名称》</span></van-checkbox>
          </div>
          <div class="action-buttons">
            <van-button
              v-if="currentStep === 2"
              type="default"
              class="prev-btn"
              @click="prevStep"
            >
              上一步
            </van-button>
            <van-button
              :type="currentStep === 1 ? 'primary' : 'primary'"
              class="next-btn"
              :loading="loading"
              @click="currentStep === 1 ? nextStep() : onSubmit()"
            >
              {{ currentStep === 1 ? '下一步' : '提交注册' }}
            </van-button>
          </div>
        </div>
      </van-form>
    </div>

    <!-- 单位选择器 -->
    <van-action-sheet
      v-model:show="showUnitPicker"
      :actions="unitActions"
      @select="onUnitSelect"
      title="选择单位"
    />

    <!-- 工种/岗位选择器 -->
    <van-action-sheet
      v-model:show="showCrewPicker"
      :actions="crewActions"
      @select="onCrewSelect"
      title="选择工种/岗位"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { userApi } from '@/api'

const router = useRouter()

// 当前步骤
const currentStep = ref(1)

// 表单数据
const form = reactive({
  phone: '',
  name: '',
  unitName: '', // 单位名称
  companyId: '', // 单位ID
  crewName: '', // 工种/岗位名称
  crewId: '', // 工种/岗位ID
  idCard: '',
  password: '',
  confirmPassword: ''
})

// 加载状态
const loading = ref(false)

// 同意协议
const agreedToTerms = ref(true)

// 选择器显示状态
const showUnitPicker = ref(false)
const showCrewPicker = ref(false)

// 选择器数据
const unitActions = ref([])
const crewActions = ref([])

// 表单验证规则
const phoneRules = [
  { required: true, message: '请填写手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
]

const nameRules = [
  { required: true, message: '请填写姓名' },
  { min: 2, max: 10, message: '姓名长度为2-10个字符' }
]

const unitRules = [
  { required: true, message: '请选择单位' }
]

const crewRules = [
  { required: true, message: '请选择工种/岗位' }
]

const idCardRules = [
  { 
    validator: (val) => {
      if (!val) return true // 非必填，空值通过验证
      const pattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
      return pattern.test(val) || '请输入正确的身份证号'
    }
  }
]

const passwordRules = [
  { required: true, message: '请填写密码' },
  { 
    validator: (val) => {
      if (!val) return true
      if (val.length < 6) {
        return '密码长度不能少于6个字符'
      }
      if (val.length > 20) {
        return '密码长度不能超过20个字符'
      }
      const hasLetter = /[a-zA-Z]/.test(val)
      const hasNumber = /\d/.test(val)
      if (!hasLetter || !hasNumber) {
        return '密码必须包含字母和数字'
      }
      return true
    }
  }
]

const confirmPasswordRules = [
  { required: true, message: '请确认密码' },
  { 
    validator: (val) => {
      if (!val) return true
      return val === form.password || '两次输入的密码不一致'
    }
  }
]



// 单位点击
const onUnitClick = async () => {
  try {
    // 获取单位列表
    const response = await userApi.getCompanyList()
    unitActions.value = response.map(item => ({
      name: item.name || item.companyName,
      value: item.id || item.companyId
    }))
    showUnitPicker.value = true
  } catch (error) {
    console.error('获取单位列表失败:', error)
    showToast('获取单位列表失败')
  }
}

// 单位选择
const onUnitSelect = (action) => {
  form.unitName = action.name
  form.companyId = action.value
  // 清空工种/岗位选择，因为单位改变了
  form.crewName = ''
  form.crewId = ''
  showUnitPicker.value = false
}

// 工种/岗位点击
const onCrewClick = async () => {
  // 检查是否已选择单位
  if (!form.companyId) {
    showToast('请先选择单位')
    return
  }
  
  try {
    // 获取工种/岗位列表，传入companyId参数
    const response = await userApi.getCrewList({ companyId: form.companyId })
    crewActions.value = response.map(item => ({
      name: item.name || item.crewName,
      value: item.id || item.crewId
    }))
    showCrewPicker.value = true
  } catch (error) {
    console.error('获取工种/岗位列表失败:', error)
    showToast('获取工种/岗位列表失败')
  }
}

// 工种/岗位选择
const onCrewSelect = (action) => {
  form.crewName = action.name
  form.crewId = action.value
  showCrewPicker.value = false
}

// 下一步
const nextStep = () => {
  // 验证第一步的表单
  if (!form.name || !form.unitName || !form.crewName) {
    showToast('请填写完整信息')
    return
  }
  
  if (!agreedToTerms.value) {
    showToast('请先同意用户协议')
    return
  }
  
  currentStep.value = 2
}

// 上一步
const prevStep = () => {
  currentStep.value = 1
}

// 去登录
const goToLogin = () => {
  router.push('/login')
}

// 表单提交
const onSubmit = async () => {
  if (!agreedToTerms.value) {
    showToast('请先同意用户协议')
    return
  }
  
  // 验证密码是否一致
  if (form.password !== form.confirmPassword) {
    showToast('两次输入的密码不一致')
    return
  }
  
  loading.value = true
  
  try {
    // 构建注册参数
    const registerData = {
      mobilePhone: form.phone,
      password: form.password,
      newPassword: form.confirmPassword,
      companyId: form.companyId,
      crewId: form.crewId,
      userName: form.name,
      post: form.crewName,
      idCard: form.idCard || ""
    }
    
    // 调用注册API
    await userApi.register(registerData)
    
    showSuccessToast('注册成功！')
    
    // 注册成功后跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    
  } catch (error) {
    console.error('注册失败:', error)
    showToast('注册失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>
<style>
.van-toast {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
<style lang="scss" scoped>

.register-page {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: $font-family;

  .page-title {
    font-size: 16px;
    color: $text-primary;
    text-align: center;
    padding-top: 20px;
  }
}

.page-header {
  background-image: url('/images/register/bg@2x.png');
  background-position: center center;
  background-size: 100% 130%;
}

.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 45px 20px;

  
  .welcome-content {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    
    .welcome-text {
      flex: 1;
      
      .greeting {
        font-size: 16px;
        color: $text-secondary;
        margin: 0 0 12px 0;
        font-weight: 400;
      }
      
      .app-name {
        font-size: 22px;
        color: $text-primary;
        margin: 0;
        font-weight: 700;
      }
    }
    

  }

  // 进度指示器
.progress-container {

  .progress-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;

      .step-number {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #e0e0e0;
        color: $text-tertiary;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .step-text {
        font-size: 12px;
        color: $text-tertiary;
        text-align: center;
      }

      &.active {
        .step-number {
          background: $primary-color;
          color: $white;
        }

        .step-text {
          color: $primary-color;
        }
      }

      &.completed {
        .step-number {
          background: $primary-color;
          color: $white;
        }

        .step-text {
          color: $text-secondary;
        }
      }
    }

    .progress-line {
      width: 30px;
      height: 2px;
      background: #e0e0e0;
      margin-top: -12px;

      &.active {
        background: $primary-color;
      }
    }
  }
}
}

.header {
  text-align: center;
  padding: 20px 16px;
  background: $white;

  .title {
    font-size: 20px;
    font-weight: bold;
    color: $black;
    margin: 0;
    line-height: 1.2;
  }
}



.form-container {
  background: $white;
  margin: 0;
  padding: 24px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;

  :deep(.van-field) {
    padding: 12px 20px;
    background-color:  #F7F8FA;
    border-radius: 4px;


    &:not(:last-child) {
      margin-bottom: 16px;
    }
    
    .van-field__control {
      font-size: 16px;
      color: $text-primary;
    }
    
    .van-field__left-icon {
      margin-right: 12px;
    }


  }
}

// 表单卡片
.form-card {
  background: $white;
  border-radius: 12px;
  margin-bottom: 20px;
}

// 步骤内容
.step-content {
  flex: 1;
}

.login-link {
    text-align: center;
    margin-bottom: 16px;

    span {
      color: $primary-color;
      font-size: 14px;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }

// 底部操作区域
.bottom-actions {
  margin-top: 90px;
  background: $white;



  .agreement {
    margin-bottom: 20px;

    :deep(.van-checkbox) {
      justify-content: center;
      .van-checkbox__label {
        font-size: 14px;
        text-align: center;
        color: $text-secondary;
        
        .agreement-link {
          color: $primary-color;
          cursor: pointer;
          text-decoration: underline;
          
          &:hover {
            opacity: 0.8;
          }
        }
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 12px;

    .prev-btn {
      flex: 1;
      height: 44px;
      border-radius: 6px;
      font-size: 16px;
      background: $white;
      border: 1px solid $primary-color;
      color: $primary-color;
    }

    .next-btn {
      flex: 2;
      height: 44px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
    }
  }
}

:deep(.van-cell-group) {
  margin: 0;
  border-radius: 0;
  overflow: hidden;
  border: none;
}

:deep(.van-cell-group::after) {
  border: none;
}

// Vant组件样式覆盖
:deep(.van-field) {
  padding: 16px 0;
  background: transparent;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

:deep(.van-field__control) {
  color: $text-primary;
  font-size: 16px;
  background-color: transparent;
  border: none;
  padding: 0;
  margin-left: 0;
  line-height: 1.5;
  display: flex;
  align-items: center;
}

:deep(.van-field__control::placeholder) {
  color: $text-tertiary;
}

:deep(.van-field__label) {
  width: auto;
  color: $text-primary;
  font-weight: normal;
  font-size: 16px;
  display: flex;
  align-items: center;
  padding-right: 16px;
  border-right: 1px solid #f0f0f0;
}

:deep(.van-field__right-icon) {
  color: $text-tertiary;
}

:deep(.van-field--error .van-field__control) {
  color: $error-color;
}

:deep(.van-field__error-message) {
  color: $error-color;
  font-size: 12px;
  margin-top: 4px;
  text-align: left;
}

:deep(.van-button--primary) {
  background: $primary-color;
  border: none;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 6px;
}

:deep(.van-button--default) {
  background: $white;
  border: 1px solid $primary-color;
  color: $primary-color;
  height: 44px;
  font-size: 16px;
  border-radius: 6px;
}

:deep(.van-picker__toolbar) {
  background: $picker-bg;
}

:deep(.van-picker__confirm) {
  color: $primary-color;
}

.error-message {
  color: $error-color;
  font-size: 12px;
  margin: 4px 16px 8px 102px;
  text-align: left;
}
</style>
