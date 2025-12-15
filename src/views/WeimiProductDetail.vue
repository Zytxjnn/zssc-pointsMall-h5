<template>
  <div class="product-detail">
    <div class="page-header">
      <xjnn-nav-bar title="积分兑换" />
    </div>

    <div class="product-image">
      <img :src="product.productFilePath" :alt="product.productName" />
    </div>

    <div class="product-name">{{ product.productName }}</div>

    <div class="price-section">
      <div class="points-price">积分：<span class="points-value">{{ product.score }}</span></div>
      <div class="market-price" v-if="product.price > 0">市场价: {{ product.price }}元</div>
    </div>

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
        <span class="spec-value">{{ product.productionDate ? new Date(product.productionDate).toLocaleDateString() : '-' }}</span>
      </div>
    </div>

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
import { weimiPointsApi } from '@/api'

const router = useRouter()
const route = useRoute()

const aisleCode = ref(route.params.id || '')
const deviceCode = ref(route.query.deviceCode || '')
const showExchangeDialog = ref(false)
const exchangeMessage = ref('')
const product = ref({})

onMounted(() => {
  if (aisleCode.value) {
    loadProductDetail(aisleCode.value)
  } else {
    showToast('商品信息获取失败')
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }
})

const loadProductDetail = async (code) => {
  try {
    const res = await weimiPointsApi.getAisleDetail({ deviceCode: deviceCode.value, aisleCode: code })
    // 适配 Weimi 货道详情字段
    product.value = {
      ...res,
      productName: res?.goodsName,
      productFilePath: res?.thumbnailUrl,
      score: res?.score,
      laborerScore: res?.laborerScore ?? 0,
      channelLayer: res?.layer,
      channelNumber: res?.aisleCode,
      aisleCode: res?.aisleCode,
      goodsId: res?.goodsId,
      specification: res?.specification || res?.spec || '',
      manufacturer: res?.manufacturer || '',
      productionDate: res?.productionDate || res?.produceDate || res?.productionTime || ''
    }
  } catch (error) {
    console.error('加载商品详情失败:', error)
    showToast('加载商品详情失败')
  }
}

const currentPoints = computed(() => product.value.laborerScore || 0)
const canExchange = computed(() => currentPoints.value >= (product.value.score || 0))

const onEarnPoints = () => {
  router.push('/')
}

const onExchange = () => {
  if (!canExchange.value) {
    showToast('积分不足，无法兑换')
    return
  }
  exchangeMessage.value = `确定要用 ${product.value.score} 积分兑换 ${product.value.productName} 吗？`
  showExchangeDialog.value = true
}

const confirmExchange = async () => {
  showExchangeDialog.value = false
  showLoadingToast({
    message: '兑换中...',
    forbidClick: true,
    duration: 0
  })
  try {
    const res = await weimiPointsApi.redeem({
      deviceCode: deviceCode.value,
      aisleCode: aisleCode.value,
      goodsId: product.value.goodsId,
      score: product.value.score
    })
    closeToast()
    // 接口返回 data 为流水号字符串；拦截器已返回 data，所以优先字符串，其次对象字段
    const flowNo = typeof res === 'string'
      ? res
      : (res?.flowNo || res?.FlowNo || res?.flowNumber || '')
    if (!flowNo) {
      showToast('未获取到流水号，请重试')
      return
    }
    router.push({
      path: '/weimi-exchange-result',
      query: {
        flowNo,
        code: flowNo, // 兑换状态接口使用 code 参数
        productName: product.value.productName,
        score: product.value.score,
        channelLayer: product.value.channelLayer,
        channelNumber: product.value.channelNumber
      }
    })
  } catch (error) {
    closeToast()
    router.push({
      path: '/weimi-exchange-result',
      query: {
        success: 'false',
        message: error.message || '兑换失败，请重试'
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.product-detail {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 80px;
}

.product-image {
  width: 100%;
  height: 200px;

  img {
    width: 100%;
    height: 100%;
  }
}

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
</style>

