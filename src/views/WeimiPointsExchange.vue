<template>
  <div class="points-exchange">
    <xjnn-nav-bar title="积分兑换" style="background-color: #1961AC; color: #fff;" />

    <div class="cabinet-info">
      <div class="cabinet-title">{{ cabinetName }}</div>
      <div class="current-points">当前积分: <span class="points-value">{{ currentPoints }}</span></div>
    </div>

    <div class="product-grid">
      <div
        class="product-card"
        v-for="product in products"
        :key="product.id || product.vendingMachineChannelId"
        @click="onProductClick(product)"
      >
        <div class="product-aisle">货道{{ product.channelLayer }} - {{ product.channelNumber }}</div>
        <div class="product-image">
          <img :src="product.productFilePath" :alt="product.name" />
          <div v-if="product.score > currentPoints" class="insufficient-overlay">
            积分不足
          </div>
        </div>
        <div class="product-info">
          <div class="product-name">{{ product.productName }}</div>
          <div class="product-points">
            <div class="left">
              <van-image src="/images/point.png" fit="contain" />
              <div class="point-value">{{ product.score }}</div>
            </div>
            <div class="right">
              市场价：{{ product.price }}元
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { weimiPointsApi } from '@/api'

const router = useRouter()
const route = useRoute()

const cabinetId = ref(route.query.cabinetId || '')
const deviceCode = ref('')
const cabinetName = ref('积分超市货柜')
const currentPoints = ref(0)
const products = ref([])

onMounted(() => {
  if (cabinetId.value) {
    loadCabinetData(cabinetId.value)
  } else {
    showToast('请通过扫码进入')
  }
})

const loadCabinetData = async (id) => {
  try {
    const res = await weimiPointsApi.getScoreRedeem({ deviceCode: id })
    deviceCode.value = res?.deviceCode || id
    cabinetName.value = res?.deviceName || res?.name || res?.cabinetName || '积分超市货柜'
    currentPoints.value = res?.laborerScore ?? 0
    // 适配 aisles 返回结构
    products.value = (res?.aisles || []).map(item => ({
      ...item,
      productName: item.goodsName,
      productFilePath: item.thumbnailUrl,
      score: item.score,
      channelLayer: item.layer,
      channelNumber: item.aisleCode,
      aisleCode: item.aisleCode,
      goodsId: item.goodsId
    }))
  } catch (error) {
    console.error('加载货柜信息失败:', error)
    showToast('加载货柜信息失败')
  }
}

const onProductClick = (product) => {
  if (!product?.vendingMachineChannelId) {
    // Weimi 返回 aisleCode / goodsId
    if (!product?.aisleCode) {
      showToast('缺少货道信息')
      return
    }
  }
  const targetAisle = product.vendingMachineChannelId || product.aisleCode
  router.push(`/weimi-product-detail/${targetAisle}?deviceCode=${encodeURIComponent(deviceCode.value)}`)
}
</script>

<style lang="scss" scoped>
.points-exchange {
  min-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
}

.cabinet-info {
  display: flex;
  justify-content: space-between;
  background: #1961AC;
  padding: 8px 16px;
  color: #fff;
  font-size: 16px;
  position: sticky;
  top: 40px;
  z-index: 900;

  .cabinet-title {
    margin: 0;
    font-weight: 600;
    text-align: center;
  }

  .current-points {
    color: #ffffffcc;
    .points-value {
      font-size: 20px;
      color: #fff;
      font-weight: 500;
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 0;
  box-sizing: border-box;
  width: 100%;
  padding: 0 12px;
}

.product-card {
  background: $white;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  box-sizing: border-box;
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  .product-aisle {
    text-align: center;
    font-size: 12px;
    color: $text-secondary;
    margin-bottom: 8px;
  }

  .product-image {
    position: relative;
    width: 100%;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 8px;
    background: #f0f0f0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .insufficient-overlay {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      font-size: 12px;
      font-weight: 500;
    }
  }

  .product-info {
    .product-name {
      font-size: 14px;
      color: $text-primary;
      margin-bottom: 4px;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-points {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: $primary-color;
      font-weight: 500;

      .left {
        display: flex;
        align-items: center;
        font-size: 20px;

        .point-value {
          margin-bottom: 2px;
          margin-left: 2px;
        }
      }

      .right {
        color: #9195A2;
        font-size: 14px;
      }
    }
  }
}
</style>

