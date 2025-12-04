<template>
  <div class="profile">
    <div class="page-header">
      <!-- 导航栏 -->
      <xjnn-nav-bar title="我的" style="background-color: transparent; color: #000;" />

      <div class="user-info-section" @click="onUserCardClick">
        <div class="user-avatar">
          <van-image
            :src="userInfo.avatar"
            width="80"
            height="80"
            round
          />
        </div>
        <div class="user-details">
          <div class="user-name-row">
            <span class="user-name">{{ userInfo.userName }}</span>
            <span class="user-role-tag">{{ userInfo.post }}</span>
          </div>
          <div class="user-phone">{{ userInfo.mobilePhone }}</div>
          <div class="user-company">{{ userInfo.companyName }}</div>
        </div>
        <!-- 暂时隐藏箭头（设置页面已隐藏） -->
        <!-- <div class="user-arrow">
          <van-icon name="arrow" />
        </div> -->
      </div>
      <!-- 积分显示区域 -->
      <div class="points-section">
        <div class="points-content">
          <div class="points-label">
            <van-image src="/images/profile/points@2x.png" width="20" height="20" />
            <span>当前积分</span>
          </div>
          <div class="points-value">{{ userInfo.score }}</div>
        </div>
      </div>

    </div>


    <!-- 功能菜单 -->
    <div class="menu-section">
      <div class="menu-item" @click="onMenuClick('exchange')">
        <div class="menu-icon">
          <van-image src="/images/point@2x.png" width="20" height="20" />
        </div>
        <div class="menu-text">积分兑换记录</div>
        <div class="menu-arrow">
          <van-icon name="arrow" />
        </div>
      </div>
      
      <div class="menu-item" @click="onMenuClick('income')">
        <div class="menu-icon">
          <van-image src="/images/profile/钱包@2x.png" width="20" height="20" />
        </div>
        <div class="menu-text">积分收入记录</div>
        <div class="menu-arrow">
          <van-icon name="arrow" />
        </div>
      </div>
    </div>

    <!-- 退出登录按钮 -->
    <div class="logout-section">
     
      <van-button class="logout-btn" @click="onLogout">退出登录</van-button>
    </div>

    <!-- 底部导航 -->
    <TabBar />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showConfirmDialog } from 'vant'
import { userApi } from '@/api'
import TabBar from '@/components/TabBar.vue'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = ref({})

onMounted(async () => {
  const res = await userApi.getUserInfo()
  userInfo.value = res;
})  

// 用户卡片点击 - 跳转到设置页面（暂时隐藏）
const onUserCardClick = () => {
  // router.push('/settings')  // 暂时隐藏设置页面
}

// 菜单点击
const onMenuClick = (type) => {
  switch (type) {
    case 'exchange':
      router.push('/exchange-record')
      break
    case 'income':
      router.push('/income-record')
      break
    default:
      break
  }
}

// 退出登录
const onLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '您确定要退出登录吗？',
    })
    
    userStore.logout()
    showToast('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消退出
  }
}
</script>

<style lang="scss" scoped>
// 变量定义
$background-color: #f5f5f5;
$white: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$text-tertiary: #999999;
$border-color: #f0f0f0;
$primary-blue: #1989fa;
$light-blue: #e8f4fd;
$gradient-blue: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

.profile {
  min-height: 100vh;
  padding-bottom: 80px; // 为底部导航留出空间

  .page-header {
    background-image: url('/images/profile/Mask.png');
    background-size: 375px 375px;
    // 用户信息区域
    .user-info-section {
      padding: 20px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s ease;

      .user-avatar {
        margin-right: 16px;
        flex-shrink: 0;
      }

      .user-details {
        flex: 1;
        min-width: 0;

        .user-name-row {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          gap: 8px;

          .user-name {
            color: #3a3f50;
            text-align: center;
            font-family: "PingFang SC";
            font-size: 20px;
            font-style: normal;
            font-weight: 600;
            line-height: 28px;
          }

          .user-role-tag {
            background: #D4E3FC;
            color: #1961AC;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            border-radius: 2px;
          }
        }

        .user-phone {
          font-size: 14px;
          color: $text-secondary;
          margin-bottom: 4px;
        }

        .user-company {
          font-size: 12px;
          color: $text-tertiary;
          line-height: 1.4;
        }
      }

      .user-arrow {
        color: $text-tertiary;
        flex-shrink: 0;
        margin-top: 4px;
      }
    }
    // 积分显示区域
    .points-section {
      background: linear-gradient(92deg, #448BFF 2.55%, #1664E2 98.96%);
      padding: 8px 20px;
      margin: 0 16px;

      .points-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;

        .points-label {
          display: flex;
          align-items: center;
          color: $white;
          font-size: 14px;
          font-weight: 500;
        }

        .points-value {
          font-size: 24px;
          font-weight: 700;
          color: $white;
        }
      }
    }
  }
  
}

.menu-section {
  background: $white;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 16px 16px 0 0;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid #f8f9fa;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: #f8f9fa;
    }

    .menu-icon {
      margin-right: 16px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .menu-text {
      flex: 1;
      font-size: 15px;
      color: $text-primary;
      font-weight: 500;
    }

    .menu-arrow {
      color: $text-tertiary;
      flex-shrink: 0;
    }
  }
}

// 退出登录按钮
.logout-section {
  display: flex;
  height: 48px;
  justify-content: center;
  align-items: center;
  background: #F0F2F5;

  .logout-btn {
    display: flex;
    width: 343px;
    height: 48px;
    padding: 9px 16px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    border-radius: 9000px;
    background: #F0F2F5;
    color: #9195a2;
    text-align: center;
    font-family: "PingFang SC";
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
    margin-top: 50px;
  }
}
</style>
