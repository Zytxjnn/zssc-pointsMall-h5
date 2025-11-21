<template>
  <div class="exchange-record">
    <!-- 页面标题栏 -->
    <xjnn-nav-bar title="兑换记录" />

    <!-- 筛选和统计区域 -->
    <div class="filter-section">
      <div class="date-filter" @click="showDatePicker = true">
        <span class="date-text">{{ selectedDate }}</span>
        <van-icon name="arrow-down" />
      </div>
      <div class="total-points">
        合计: <span class="points-value">{{ totalPoints }}</span>
      </div>
    </div>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <!-- 兑换记录列表 -->
      <div class="record-list">
        <div 
          class="record-item" 
          v-for="item in exchangeRecords" 
          :key="item.id"
        >
        <div class="record-header">
          <div class="record-time">{{ item.redeemTime }}</div>
          <div class="record-type">{{ item.recordType }}</div>
        </div>
        <div class="record-content">
          <div class="product-image">
            <img :src="item.imageFilePath" :alt="item.productName" />
          </div>
          <div class="product-info">
            <div class="product-name">{{ item.productName }}</div>
            <div class="product-serial">编号: {{ item.code }}</div>
          </div>
          <div class="record-points"> - {{ item.score }}</div>
        </div>
      </div>
    </div>
</van-list>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="currentDate"
        title="选择日期"
         :columns-type="['year', 'month']"
         @confirm="onDateConfirm"
         @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { pointsApi } from '@/api'

// 当前选择的日期 - 初始化为当前年月
const now = new Date()
const currentDate = ref([
  now.getFullYear().toString(),
  String(now.getMonth() + 1).padStart(2, '0')
])
const showDatePicker = ref(false)

// 分页相关
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 兑换记录数据
const exchangeRecords = ref([])



// 组件加载事件
onMounted(async () => {
  
})

// onLoad - 加载更多数据
const onLoad = async () => {
  console.log('触发load事件，当前页码：', page.value)
  
  try {
    const { list, total } = await pointsApi.getExchangeRecord({
      timePeriod: selectedDate.value,
      currentPageIndex: page.value - 1,
      pageSize: pageSize.value
    })

    // 追加数据到列表
    exchangeRecords.value.push(...list)
    
    // 完成加载
    loading.value = false
    
    // 检查是否还有更多数据
    if (exchangeRecords.value.length >= total) {
      finished.value = true
    } else {
      // 页码+1，准备加载下一页
      page.value++
    }
    
    console.log(`已加载${exchangeRecords.value.length}/${total}条数据`)
  } catch (error) {
    console.error('获取兑换记录失败:', error)
    loading.value = false
    finished.value = true
  }
}

// 格式化日期显示
const selectedDate = computed(() => {
  return `${currentDate.value[0]}-${currentDate.value[1]}`
})

// 计算总积分
const totalPoints = computed(() => {
  return - exchangeRecords.value.reduce((sum, item) => sum + item.score, 0)
})

// 日期选择确认
const onDateConfirm = ({ selectedValues }) => {
  currentDate.value = selectedValues
  showDatePicker.value = false

  // 重置分页状态
  page.value = 1
  exchangeRecords.value = []
  loading.value = false
  
  // 设置finished为false会自动触发van-list的load事件
  finished.value = false
}
</script>

<style lang="scss" scoped>
// 变量定义
$white: #ffffff;
$background-color: #f5f5f5;
$text-primary: #333;
$text-secondary: #666;
$text-tertiary: #999;
$primary-color: #D9402B;
$type-bg: #e8f4ff;
$type-color: #8b5cf6;

.exchange-record {
  min-height: 100vh;
  background: $background-color;
}

// 页面标题栏
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: $white;
  z-index: 1000;
  border-bottom: 1px solid $border-color;
}

// 筛选和统计区域
.filter-section {
  position: sticky;
  top: 40px;
  background: $white;
  padding: 16px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .date-filter {
    display: flex;
    align-items: center;
    cursor: pointer;

    .date-text {
      font-size: 16px;
      color: $text-primary;
      margin-right: 4px;
    }
  }

  .total-points {
    font-size: 16px;
    color: $text-primary;
    font-weight: 600;
    line-height: 28px;
    .points-value {
      color: $primary-color;
    }
  }
}

.van-list {
  height: calc(100vh - 150px);
  overflow-y: auto;
}

// 兑换记录列表
.record-list {
  padding: 0 16px;
}

.record-item {
  background: $white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .record-type {
      display: flex;
      padding: 2px 8px;
      font-size: 12px;
      align-items: center;
      gap: 4px;
      border-radius: 2px;
      background: var(---, #F0F2F5);
    }

    .record-time {
      font-size: 12px;
      color: $text-secondary;
      flex: 1;
      text-align: left;
    }

  
  }

  .record-content {
    display: flex;
    align-items: flex-start;

    .product-image {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      overflow: hidden;
      margin-right: 12px;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .product-info {
      flex: 1;

      .product-name {
        font-size: 14px;
        color: $text-primary;
        margin-bottom: 4px;
        line-height: 1.4;
      }

      .product-serial {
        font-size: 12px;
        color: $text-tertiary;
      }
    }

    .record-points {
      font-size: 18px;
      color: #D9402B;
      font-weight: 500;
    }
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

:deep(.van-picker) {
  background: $white;
}
</style>
