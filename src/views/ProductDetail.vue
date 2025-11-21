<template>
  <div class="product-detail">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <xjnn-nav-bar title="积分兑换"  />
    </div>


    <!-- 商品图片轮播 -->
    <div class="product-image">
        <img :src="product.productFilePath" :alt="product.productName" />
    </div>

    <div class="product-name">{{ product.productName }}</div>

    <!-- 积分和价格信息 -->
    <div class="price-section">
      <div class="points-price">积分：<span class="points-value">{{ product.score }}</span></div>
      <div class="market-price" v-if="product.price > 0">市场价: {{ product.price }}元</div>
    </div>

    <!-- 商品规格信息 -->
    <div class="spec-section">  
      <div class="spec-item">
        <span class="spec-label">规格:</span>
        <span class="spec-value">{{ product.specification }}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">厂家:</span>
        <span class="spec-value">{{ product.manufacturer }}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">生产日期:</span>
        <span class="spec-value">{{ new Date(product.productionDate).toLocaleDateString() }}</span>
      </div>
    </div>

    <!-- 底部操作区域 -->
    <div class="bottom-actions">
      <div class="points-info">
        <div v-if="canExchange" class="current-points">当前积分： <span class="points-value">{{ product.laborerScore }}</span></div>
        <div v-else class="insufficient-points">积分不足，<span class="earn-points" @click="onEarnPoints">去赚积分</span></div>
      </div>
      <van-button 
        type="primary"
        :disabled="!canExchange"
        class="exchange-btn"
        @click="onExchange"
      >
        立即兑换
      </van-button>
    </div>

    <!-- 测试按钮 - 仅开发环境显示 -->
    <div v-if="isDev" class="test-controls">
      <van-button size="small" @click="togglePoints">切换积分状态</van-button>
    </div>

    <!-- 兑换确认弹窗 -->
    <van-dialog
      v-model:show="showExchangeDialog"
      title="确认兑换"
      :message="exchangeMessage"
      show-cancel-button
      @confirm="confirmExchange"
      @cancel="showExchangeDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { pointsApi } from '@/api'

const router = useRouter()
const route = useRoute()

// 获取URL参数中的货道ID
const channelId = ref(route.params.id || '')

// 当前积分 - 从商品数据中获取
const currentPoints = computed(() => {
  return product.value.laborerScore || 0
})

// 开发环境标识
const isDev = import.meta.env.DEV

// 兑换弹窗
const showExchangeDialog = ref(false)
const exchangeMessage = ref('')

// 商品数据（由API加载）
const product = ref({})

// 组件挂载时加载商品详情
onMounted(() => {
  if (channelId.value) {
    loadProductDetail(channelId.value)
  } else {
    showToast('商品信息获取失败')
    // 安全返回：如果有历史记录则返回，否则跳转到首页
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }
})

// 加载商品详情
const loadProductDetail = async (id) => {
  try {
    const res = await pointsApi.getChannelDetail({ id })
    
    // 更新商品信息
    product.value = res;
    
    console.log('商品详情加载成功:', product.value)
  } catch (error) {
    console.error('加载商品详情失败:', error)
    showToast('加载商品详情失败')
  }
}

// 计算是否可以兑换
const canExchange = computed(() => {
  return currentPoints.value >= (product.value.score || 0)
})

// 赚积分点击
const onEarnPoints = () => {
  router.push('/')
}

// 兑换点击
const onExchange = () => {
  if (!canExchange.value) {
    showToast('积分不足，无法兑换')
    return
  }
  
  exchangeMessage.value = `确定要用 ${product.value.score} 积分兑换 ${product.value.productName} 吗？`
  showExchangeDialog.value = true
}

// 确认兑换
const confirmExchange = async () => {
  // 关闭弹窗
  showExchangeDialog.value = false
  showLoadingToast({
    message: '兑换中...',
    forbidClick: true,
    duration: 0
  })
  try {
    // 构建兑换数据
    const exchangeData = {
      vendingMachineChannelId: channelId.value,  // 货道ID
      timestamp: product.value.timestamp           // 时间戳
    }
    
    // 调用API兑换商品
    const res = await pointsApi.exchangeProduct(exchangeData)
    closeToast()
    // 根据返回结果判断兑换状态
    if (res) {
      // 跳转到兑换结果页面，携带兑换结果数据
        router.push({
          path: '/exchange-result',
          query: {
            success: 'true',
            productName: product.value.productName,
            score: product.value.score,
            channelLayer: product.value.channelLayer,
            channelNumber: product.value.channelNumber,
            orderId: res.orderId || res.id || '',
            remainingScore: res.remainingScore || res.laborerScore || ''
          }
        })
    } else {
        router.push({
          path: '/exchange-result',
          query: {
            success: 'false',
            message: res.message || '兑换失败，请重试'
          }
        })
    }
    
  } catch (error) {
    closeToast()
    // 跳转到兑换结果页面显示失败状态
    router.push({
      path: '/exchange-result',
      query: {
        success: 'false',
        message: error.message || '网络错误，请重试'
      }
    })
  }
}

// 切换积分状态（测试用）
const togglePoints = () => {
  // 注意：currentPoints现在是计算属性，无法直接修改
  // 如果需要测试，可以修改product.value.laborerScore
  if (product.value.laborerScore >= product.value.score) {
    product.value.laborerScore = product.value.score - 1 // 设置为不足状态
  } else {
    product.value.laborerScore = product.value.score + 5 // 设置为足够状态
  }
}

</script>

<style lang="scss" scoped>

.product-detail {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 80px; // 为底部操作区域留出空间
}



// 商品图片
.product-image {
  width: 100%;
  height: 200px;

  img {
    width: 100%;
    height: 100%;
  }
}

// 商品名称
.product-name {
  display: flex;
  padding: 12px 16px;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  align-self: stretch;
  background-color: #FFF;
  color: #3A3F50;
  margin-bottom: 10px;
  font-weight: 500;
}


// 积分和价格信息
.price-section {
  background: $white;
  padding: 16px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .points-price {
    font-size: 16px;
    font-weight: bold;
    .points-value {
      color: $primary-color;
      font-size: 20px;
    }
  }

  .market-price {
    font-size: 14px;
    color: $text-secondary;
  }
}

// 商品规格信息
.spec-section {
  background: $white;
  padding: 16px;
  margin-bottom: 8px;

  .spec-item {
    display: flex;
    margin-bottom: 12px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    .spec-label {
      color: $text-secondary;
      flex-shrink: 0;
      margin-right: 10px;
    }

    .spec-value {
      color: $text-primary;
      flex: 1;
      line-height: 1.4;
    }
  }
}

// 底部操作区域
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $white;
  padding: 12px 16px;
  border-top: 1px solid $border-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.1);

  .points-info {
    flex: 1;

    .current-points {
      font-size: 14px;
      .points-value {
        color: $primary-color;
        font-size: 20px;
        font-weight: 600;
      }
    }

    .insufficient-points{
      font-size: 12px;

      .earn-points {
        color: $primary-color;
        text-decoration: underline;
      }
    }
    
  }

  .exchange-btn {
    width: 204px;
    height: 40px;
    border-radius: 38px;
    font-size: 14px;

    &.van-button--primary {
      background: $primary-color;
      border-color: $primary-color;
    }


  }
}

// 测试控件
.test-controls {
  position: fixed;
  top: 100px;
  right: 16px;
  z-index: 200;
  
  .van-button {
    background: rgba(0, 0, 0, 0.7);
    color: $white;
    border: none;
    border-radius: 20px;
    font-size: 12px;
    padding: 4px 12px;
  }
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

:deep(.van-dialog) {
  .van-dialog__header {
    font-weight: 500;
  }
  
  .van-dialog__message {
    color: $text-primary;
    line-height: 1.5;
  }
}
</style>
