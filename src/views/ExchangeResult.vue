<template>
  <div class="exchange-result">
    <xjnn-nav-bar title="兑换结果" />

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 加载中状态 -->
      <div v-if="exchangeStatus === 'loading'" class="loading-state">
        <div class="loading-spinner">
          <van-loading type="spinner" size="24" color="#1989fa" />
        </div>
        <div class="loading-text">货柜出货中,请稍后...</div>
        <div class="tip">出货中，请不要离开</div>
      </div>

      <!-- 成功状态 -->
      <div v-else-if="exchangeStatus === 'success'" class="success-state">
        <van-image src="/images/exchangeResult/success.png" width="100" height="100" />
        <div class="success-text">兑换成功!</div>
        <div class="success-tip">请在货柜下方取走物品</div>
        
        <!-- 兑换详情 -->
        <!-- <div class="exchange-info" v-if="exchangeResult.productName">
          <div class="info-item">
            <span class="label">商品名称：</span>
            <span class="value">{{ exchangeResult.productName }}</span>
          </div>
          <div class="info-item">
            <span class="label">货道位置：</span>
            <span class="value">{{ exchangeResult.channelLayer }} - {{ exchangeResult.channelNumber }}</span>
          </div>
          <div class="info-item">
            <span class="label">消耗积分：</span>
            <span class="value">{{ exchangeResult.score }}</span>
          </div>
          <div class="info-item" v-if="exchangeResult.remainingScore">
            <span class="label">剩余积分：</span>
            <span class="value">{{ exchangeResult.remainingScore }}</span>
          </div>
          <div class="info-item" v-if="exchangeResult.orderId">
            <span class="label">订单号：</span>
            <span class="value">{{ exchangeResult.orderId }}</span>
          </div>
        </div> -->
        
        <van-button 
          type="primary" 
          class="action-btn"
          @click="onContinueExchange"
        >
          继续兑换
        </van-button>
      </div>

      <!-- 失败状态 -->
      <div v-else-if="exchangeStatus === 'failed'" class="failed-state">
        <van-image src="/images/exchangeResult/failed.png" width="100" height="100" />
        <div class="failed-text">兑换失败!</div>
        <div class="failed-reason" v-if="exchangeResult.message">
          {{ exchangeResult.message }}
        </div>
        <van-button 
          type="primary" 
          class="action-btn"
          @click="onRetryExchange"
        >
          继续兑换
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 兑换状态：loading, success, failed
const exchangeStatus = ref('loading')

// 兑换结果数据
const exchangeResult = ref({
  success: false,
  productName: '',
  score: 0,
  channelLayer: '',
  channelNumber: '',
  orderId: '',
  remainingScore: 0,
  message: ''
})

// 获取兑换结果
const getExchangeResult = () => {
  // 从URL参数获取兑换结果
  const success = route.query.success === 'true'
  
  if (success) {
    exchangeResult.value = {
      success: true,
      productName: route.query.productName || '',
      score: route.query.score || 0,
      channelLayer: route.query.channelLayer || '',
      channelNumber: route.query.channelNumber || '',
      orderId: route.query.orderId || '',
      remainingScore: route.query.remainingScore || 0
    }
  } else {
    exchangeResult.value = {
      success: false,
      message: route.query.message || '兑换失败'
    }
  }
  
  console.log('兑换结果数据:', exchangeResult.value)
  return success
}

// 模拟出货过程（加载状态）
const simulateDispensing = () => {
  // 模拟货柜出货过程（1秒）
  setTimeout(() => {
    // 根据实际结果设置状态
    const success = getExchangeResult()
    exchangeStatus.value = success ? 'success' : 'failed'
  }, 1000)
}


// 继续兑换
const onContinueExchange = () => {
  router.back() // 返回商品详情页
}

// 重新兑换
const onRetryExchange = () => {
  router.back() // 返回商品详情页
}

// 页面加载时开始模拟出货过程
onMounted(() => {
  simulateDispensing()
})
</script>

<style lang="scss" scoped>

.exchange-result {
  min-height: 100vh;
  background: $white;
}


// 内容区域
.content-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  padding: 40px 20px;
}

// 加载中状态
.loading-state {
  text-align: center;

  .loading-text {
    font-size: 16px;
    margin-bottom: 10px;
  }

  .tip {
    font-size: 12px;
    color: $text-secondary;
  }

  .loading-spinner {
    display: flex;
    justify-content: center;
  }
}

// 成功状态
.success-state {
  text-align: center;
  width: 100%;
  max-width: 500px;

  .success-text {
    font-weight: bold;
    margin-bottom: 16px;
  }

  .success-icon {
    margin-bottom: 16px;
  }

  .success-tip {
    font-size: 14px;
    color: #9195A2;
    margin-bottom: 26px;
  }

  .exchange-info {
    background: #f7f8fa;
    border-radius: 8px;
    padding: 16px;
    margin: 24px 0;
    width: 100%;
    text-align: left;

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;

      &:not(:last-child) {
        border-bottom: 1px solid #ebedf0;
      }

      .label {
        color: $text-secondary;
      }

      .value {
        color: $text-primary;
        font-weight: 500;
      }
    }
  }
}

// 失败状态
.failed-state {
  text-align: center;
  width: 100%;
  max-width: 500px;

  .failed-text {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
    margin-top: 16px;
  }

  .failed-reason {
    font-size: 14px;
    color: $text-secondary;
    margin-bottom: 24px;
    padding: 12px 16px;
    background: #fff3f3;
    border-radius: 8px;
  }
}

.action-btn {
    display: inline-flex;
    height: 36px;
    padding: 9px 16px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    border-radius: 26px;
    background-color:  #ECF2FE !important;
    border-color: #ECF2FE !important;
    color: $primary-color;
  }

// Vant组件样式覆盖
:deep(.van-nav-bar) {
  background: $white;
}

:deep(.van-nav-bar__title) {
  color: $text-primary;
  font-weight: 500;
}

:deep(.van-nav-bar__arrow) {
  color: $text-primary;
}


:deep(.van-loading) {
  .van-loading__spinner {
    color: $primary-color;
  }
}
</style>
