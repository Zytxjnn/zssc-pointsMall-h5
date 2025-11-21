<template>
  <div class="income-record">
    <!-- 页面标题栏 -->
    <xjnn-nav-bar title="收入记录" />

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
      <!-- 收入记录列表 -->
      <div class="record-list">
        <div 
          class="record-item" 
          v-for="item in incomeRecords" 
          :key="item.id"
        >
          <div class="record-header">
            <div class="record-time">{{ item.completionTime }}</div>
            <div class="record-type">{{ item.scoreEventTypeName }}</div>
          </div>
          <div class="record-content">
            <div class="record-desc">{{ item.description }}</div>
            <div class="record-points">+ {{ item.score }}</div>
          </div>
          <div class="record-serial">编号: {{ item.code }}</div>
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

// 收入记录数据
const incomeRecords = ref([])

// 组件加载事件
onMounted(async () => {
  
})

// onLoad - 加载更多数据
const onLoad = async () => {
  console.log('触发load事件，当前页码：', page.value)
  
  try {
    const { list, total } = await pointsApi.getScoreEventList({
      timePeriod: selectedDate.value,
      currentPageIndex: page.value - 1,
      pageSize: pageSize.value
    })

    // 追加数据到列表
    incomeRecords.value.push(...list)
    
    // 完成加载
    loading.value = false
    
    // 检查是否还有更多数据
    if (incomeRecords.value.length >= total) {
      finished.value = true
    } else {
      // 页码+1，准备加载下一页
      page.value++
    }
    
    console.log(`已加载${incomeRecords.value.length}/${total}条数据`)
  } catch (error) {
    console.error('获取收入记录失败:', error)
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
  return incomeRecords.value.reduce((sum, item) => sum + item.score, 0)
})

// 日期选择确认
const onDateConfirm = ({ selectedValues }) => {
  currentDate.value = selectedValues
  showDatePicker.value = false

  // 重置分页状态
  page.value = 1
  incomeRecords.value = []
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
$primary-color: #1989fa;
$type-bg: #e8f4ff;
$type-color: #1989fa;

.income-record {
  min-height: 100vh;
  background: $background-color;
  display: flex;
  flex-direction: column;
}

// 筛选和统计区域
.filter-section {
  position: sticky;
  top: 40px;
  background: $white;
  padding: 16px 0;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .date-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex: 1;

    .date-text {
      font-size: 16px;
      color: $text-primary;
      margin-right: 4px;
    }
  }

  .total-points {
    flex: 1;
    font-size: 16px;
    color: $text-primary;
    font-size: 18px;
    text-align: center;

    .points-value {
      color: #1961AC;
      font-weight: 600;
    }
  }
}

.van-list {
  height: calc(100vh - 150px);
  overflow-y: auto;
}

// 收入记录列表
.record-list {
  background: $white;

.record-item {
  padding: 16px;
  margin-bottom: 4px;

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .record-type {
      display: flex;
      padding: 2px 8px;
      align-items: center;
      gap: 4px;
      border-radius: 2px;
      background: var(----1, #ECF2FE);
      color: #1961ac;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
    }

    .record-time {
      color: #9195a2;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      flex: 1;
    }


  }

  .record-content {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .record-desc {
      flex: 1 0 0;
      color: #3a3f50;
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 24px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .record-points {
      color: #1961ac;
      text-align: center;
      font-size: 18px;
      font-style: normal;
      font-weight: 500;
      line-height: 26px;
      margin-top: 4px;
    }
   
  }
  .record-serial {
      font-size: 12px;
      color: $text-tertiary;
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

:deep(.van-date-picker) {
  background: $white;
}
</style>
