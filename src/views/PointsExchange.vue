<template>
  <div class="points-exchange">
    <!-- 页面标题栏 -->
    <xjnn-nav-bar title="积分兑换" style="background-color: #1961AC; color: #fff;" />

    <!-- 货柜信息 -->
    <div class="cabinet-info">
      <div class="cabinet-title">{{ cabinetName }}</div>
      <div class="current-points">当前积分: <span class="points-value">{{ currentPoints }}</span></div>
    </div>


    <!-- 商品网格 -->
    <div class="product-grid">
      <div 
        class="product-card" 
        v-for="product in products" 
        :key="product.id"
        @click="onProductClick(product)"
      >
        <div class="product-aisle">货道{{ product.channelLayer }} - {{ product.channelNumber }}</div>
        <div class="product-image">
          <img :src="product.productFilePath" :alt="product.name" />
          <div 
            v-if="product.points > currentPoints" 
            class="insufficient-overlay"
          >
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { pointsApi } from '@/api'

const router = useRouter()
const route = useRoute()

// 获取URL参数中的货柜ID
const cabinetId = ref(route.query.cabinetId || '')
const cabinetName = ref('长赣积分超市货柜1')

// 当前积分
const currentPoints = ref(10)

// 组件挂载时检查货柜ID
onMounted(() => {
  if (cabinetId.value) {
    console.log(`扫码进入，货柜ID: ${cabinetId.value}`)
    // 加载货柜信息和商品
    loadCabinetData(cabinetId.value)
  } else {
    console.log('直接进入积分兑换页面（无货柜ID）')
    showToast('请通过扫码进入')
    // 可以选择跳转回主页
    // router.push('/')
  }
})

// 加载货柜信息和商品
const loadCabinetData = async (id) => {
  try {
    const res = await pointsApi.getScoreRedeem({ id })
    
    // 更新货柜信息
    cabinetName.value = res.name || res.cabinetName || '积分超市货柜'
    
    products.value = res.channels;
    // 更新积分信息
    currentPoints.value = res.laborerScore;
  } catch (error) {
    console.error('加载货柜信息失败:', error)
    showToast('加载货柜信息失败')
  }
}

// 兑换弹窗
const showExchangeDialog = ref(false)
const selectedProduct = ref(null)
const exchangeMessage = ref('')

// 商品数据（由API加载）
const products = ref([])

// 返回上一页
const onBack = () => {
  router.back()
}

// 返回主页
const onGoHome = () => {
  router.push('/')
}

// 商品点击
const onProductClick = (product) => {
  // 跳转到商品详情页面
  router.push(`/product-detail/${product.vendingMachineChannelId}`)
}

// 确认兑换
const confirmExchange = () => {
  if (!selectedProduct.value) return
  
  // 扣除积分
  currentPoints.value -= selectedProduct.value.points
  
  // 显示成功提示
  showSuccessToast(`兑换成功！获得 ${selectedProduct.value.name}`)
  
  // 关闭弹窗
  showExchangeDialog.value = false
  selectedProduct.value = null
  
  // 这里可以添加实际的兑换逻辑，比如调用API
  console.log('兑换商品:', selectedProduct.value)
}
</script>

<style lang="scss" scoped>

.points-exchange {
  min-height: 100vh;
  padding-bottom: 20px;
}

// 页面标题栏
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #1961AC;
  z-index: 1000;
}

// 货柜信息
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

// 商品分类和积分信息
.category-section {
  background: $white;
  padding: 16px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .category-title {
    font-size: 16px;
    color: $text-primary;
    font-weight: 500;
  }


}

// 商品网格
.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 16px;
}

.product-card {
  background: $white;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

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
      font-size: 12px;
      color: $text-primary;
      margin-bottom: 4px;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
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

// Vant组件样式覆盖
:deep(.van-nav-bar) {
  background: $white;
}

:deep(.van-nav-bar__title) {
  color: #fff;
  font-weight: normal;
}

:deep(.van-icon) {
  color: #fff;
  font-weight: normal;
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
