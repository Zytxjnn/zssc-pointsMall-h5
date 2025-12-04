<template>
  <div class="login-page">
    
    
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="page-title">登录</div>
      <div class="welcome-content">
        <div class="welcome-text">
          <h2 class="greeting">您好, 欢迎使用</h2>
          <h1 class="app-name">云积分超市</h1>
        </div>
      </div>
    </div>

    <!-- 登录表单 -->
    <div class="form-container">
      <van-form @submit="onSubmit">
        <van-cell-group>
          <!-- 手机号 -->
          <van-field
            v-model="form.mobilePhone"
            name="mobilePhone"
            type="tel"
            :rules="mobilePhoneRules"
            required
          >
            <template #left-icon>
              <van-icon name="phone-o" size="18" color="#666" />
            </template>
          </van-field>

          <!-- 密码 -->
          <van-field
            v-model="form.password"
            name="password"
            type="password"
            :rules="passwordRules"
            required
          >
            <template #left-icon>
              <van-icon name="lock" size="18" color="#666" />
            </template>
          </van-field>
        </van-cell-group>

        <!-- 注册链接 -->
        <div class="register-link">
          <span class="register-text">
            没有账号, 
            <span class="register-btn" @click="goToRegister">去注册</span>
          </span>
        </div>

        <!-- 用户协议 -->
        <div class="agreement-section">
          <van-checkbox v-model="agreed" shape="square" />
          <span class="agreement-text">
            我已阅读并同意
            <span class="agreement-link" @click.stop="goToUserAgreement">《用户协议》</span>
            和
            <span class="agreement-link" @click.stop="goToPrivacyPolicy">《隐私政策》</span>
          </span>
        </div>

        <!-- 登录按钮 -->
        <div class="login-btn">
          <van-button
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            :disabled="!agreed"
          >
            登录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const returnUrl = ref(typeof route.query.returnUrl === 'string' ? route.query.returnUrl : '')

watch(
  () => route.query.returnUrl,
  (val) => {
    if (typeof val === 'string') {
      returnUrl.value = val
    }
  },
  { immediate: true }
)

// 表单数据
const form = reactive({
  mobilePhone: '17382022624',
  // mobilePhone: '',
  password: ''
})

// 加载状态
const loading = ref(false)

// 用户协议同意状态
const agreed = ref(true)

// 表单验证规则
const mobilePhoneRules = [
  { required: true, message: '请填写手机号' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
]

const passwordRules = [
  { required: true, message: '请填写密码' }
]

// 去注册
const goToRegister = () => {
  router.push('/register')
}

// 跳转到用户协议页面
const goToUserAgreement = (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  router.push('/user-agreement').catch(err => {
    console.error('路由跳转失败:', err)
  })
}

// 跳转到隐私政策页面
const goToPrivacyPolicy = (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }
  router.push('/privacy-policy').catch(err => {
    console.error('路由跳转失败:', err)
  })
}

// 表单提交
const onSubmit = async () => {
  loading.value = true
  
  try {
    // 获取用户store实例并调用登录方法
    const userStore = useUserStore()
    await userStore.login(form)
    
    // 登录成功
    showSuccessToast('登录成功！')
    
    // 登录成功后跳转到首页
    setTimeout(() => {
      const target = returnUrl.value || '/'
      returnUrl.value = ''
      router.replace(target)
    }, 300)
    
  } catch (error) {
    // 显示接口返回的错误消息
    const errorMessage = error.message || '登录失败，请重试'
    showToast(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>

.login-page {
  min-height: 100vh;
  background: #fff;
  font-family: $font-family;
}

// 状态栏
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: $white;
  font-size: 14px;
  font-weight: 600;
  
  .time {
    color: #000;
  }
  
  .status-icons {
    display: flex;
    gap: 4px;
    
    span {
      font-size: 12px;
    }
  }
}


  
  .page-title {
    font-size: 16px;
    color: $text-primary;
    margin: 0;
  }

// 欢迎横幅
.welcome-banner {
  .page-title {
    text-align: center;
    padding-bottom: 54px;
  }

  background-image: url('/images/login/bg@2x.png');
  background-position: center center;
  background-size: 100% 130%;
  padding:  20px 20px 45px 20px;
  
  .welcome-content {
    display: flex;
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
        font-size: 24px;
        color: $text-primary;
        margin: 0;
        font-weight: 700;
      }
    }
    
    .decoration {
      position: relative;
      margin-left: 20px;
      
     
      
      .stars {
        position: absolute;
        top: -10px;
        right: 10px;
        color: #ffa500;
        font-size: 14px;
        font-weight: bold;
      }
    }
  }
}

// 表单容器
.form-container {
  background: $white;
  margin: 0;
  padding: 24px 20px;
  
  :deep(.van-cell-group) {
    overflow: hidden;
  }
  
  :deep(.van-field) {
    padding: 16px 20px;
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

// 注册链接
.register-link {
  text-align: center;
  margin: 16px 0 24px 0;
  font-size: 14px;
  
  .register-text {
    color: $text-secondary;
    
    .register-btn {
      color: $primary-color;
      cursor: pointer;
      font-weight: 500;
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

// 用户协议
.agreement-section {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 240px 0 32px 0;
  gap: 8px;
  
  :deep(.van-checkbox) {
    margin-top: 2px;
  }
  
  .agreement-text {
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.4;
    
    .agreement-link {
      color: $primary-color;
      cursor: pointer;
      text-decoration: underline;
      font-weight: 500;
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

// 登录按钮
.login-btn {
  margin-top: 8px;
  
  :deep(.van-button--primary) {
    background: $primary-color;
    border: none;
    height: 50px;
    font-size: 16px;
    border-radius: 12px;
    background: $primary-color;
    letter-spacing: 4px;
    border-radius: 999px;
    
    &:disabled {
      background: #ccc;
      box-shadow: none;
    }
  }
}
</style>
