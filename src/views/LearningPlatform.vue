<template>
  <div class="learning-platform">
    <xjnn-nav-bar title="学习平台" style="background-color: #1961AC; color: #ffffff;" />

    <!-- 次级标题栏 - 标签页和积分 -->
    <div class="secondary-header">
      <div class="tab-section">
        <div class="tab-bar">
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'incomplete' }"
            @click="activeTab = 'incomplete'"
          >
            未完成
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'completed' }"
            @click="activeTab = 'completed'"
          >
            已完成
          </div>
        </div>
      </div>
      
      <!-- 类型筛选和积分显示 -->
      <div class="filter-row">
        <div class="filter-item" @click="showTypePicker = true">
          <span>{{ getTypeDisplayName(selectedType) }} ▼</span>
        </div>
        <div class="points-display">
          当前积分: <span class="points-value">{{ currentPoints }}</span>
        </div>
      </div>
    </div>

    <!-- 排序栏 -->
    <div class="sort-section">
      <div 
        class="sort-item" 
        :class="{ active: sortType === 0 }"
        @click="onSortClick('newest')"
      >
        <span>按开始时间</span><van-icon name="filter-o" />
      </div>
      <div 
        class="sort-item" 
        :class="{ active: sortType === 1 }"
        @click="onSortClick('expiry')"
      >
        <span>临期最短</span><van-icon name="filter-o" />
      </div>
    </div>

    <!-- 培训列表 -->
    <div class="training-list">
      <div 
        class="training-item"
        v-for="item in filteredTrainings"
        :key="item.id"
        @click="onTrainingClick(item)"
      >
        <!-- 上半部分：主要内容 -->
        <div class="training-main">
          <!-- 左侧图片占位符 -->
          <div class="training-image">
            <div class="image-placeholder">
              <span class="video-text">视频</span>
            </div>
          </div>
          
          <!-- 右侧内容 -->
          <div class="training-content">
            <div class="training-header">
                <div class="training-title">{{ item.name }}</div>
              <!-- 积分/状态图标 -->
              <div class="training-status">
                <van-image class="img img-gou" v-if="activeTab === 'completed'"  width="14" height="14" src="/images/quiz/gou.png" />
                <van-image class="img img-point" v-else  width="14" height="14" src="/images/quiz/point.png" />
                {{ activeTab === 'completed' ? '+' : '' }}{{ item.score }}
              </div>
            </div>
            
            <div class="training-type">类型: {{ item.trainingTypeName }}</div>
            
            <!-- 进度条 -->
            <div class="progress-section">
              <span>进度：</span>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getProgressWidth(item) }"
                ></div>
              </div>
              <span class="progress-text">{{ getProgressText(item) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 下半部分：时间信息 -->
        <div class="training-footer">
          <div class="time-info">
            <div class="time-item">
              <span class="time-label">开始时间:</span>
              <span class="time-value">{{ item.startTime }}</span>
            </div>
            <div class="time-item">
              <span class="time-label">截止时间:</span>
              <span class="time-value">{{ item.endTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 类型选择器 -->
    <van-action-sheet
      v-model:show="showTypePicker"
      :actions="typeActions"
      @select="onTypeSelect"
      title="选择类型"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { trainingApi, userApi } from '@/api'

const router = useRouter()

// 当前积分
const currentPoints = ref(0)

// 当前标签页
const activeTab = ref('incomplete')

// 类型选择器
const showTypePicker = ref(false)
const selectedType = ref('all')

// 排序方式
const sortType = ref(0) // 0: 开始时间, 1: 临期最短

// 分页相关
const currentPageIndex = ref(0)
const pageSize = ref(10)
const totalCount = ref(0)

// 数据列表
const trainings = ref([])
const trainingTypeList = ref([])

// 类型选项
const typeActions = ref([
  { name: '全部类型', value: 'all' }
])

// 加载培训类型
const loadTrainingTypes = async () => {
  try {
    const res = await trainingApi.getTrainingTypeTreeList()
    trainingTypeList.value = res || []
    
    // 更新类型选项
    typeActions.value = [
      { name: '全部类型', value: 'all' },
      ...trainingTypeList.value.map(type => ({
        name: type.name,
        value: type.id
      }))
    ]
  } catch (error) {
    console.error('获取培训类型失败:', error)
  }
}

// 加载培训列表
const loadTrainingList = async () => {
  try {
    const params = {
      TrainingTypeId: selectedType.value === 'all' ? '' : selectedType.value,
      DescField: getDescField(),
      IsComplete: activeTab.value === 'completed',
      CurrentPageIndex: currentPageIndex.value,
      PageSize: pageSize.value
    }
    
    const { list } = await trainingApi.getTrainingList(params)
    trainings.value = list || []
  } catch (error) {
    console.error('获取培训列表失败:', error)
    showToast('获取培训列表失败')
  }
}

// 获取DescField参数
const getDescField = () => {
  if (activeTab.value === 'completed') {
    return sortType.value === 0 ? 0 : 1
  } else {
    return sortType.value === 0 ? 0 : 1
  }
}

// 过滤后的培训列表
const filteredTrainings = computed(() => {
  return trainings.value
})

// 获取类型显示名称
const getTypeDisplayName = (type) => {
  if (type === 'all') return '全部类型'
  const typeItem = trainingTypeList.value.find(t => t.id === type)
  return typeItem ? typeItem.name : '全部类型'
}

// 获取进度条宽度
const getProgressWidth = (item) => {
  return activeTab.value === 'completed' ? '100%' : '0%'
}

// 获取进度条文本
const getProgressText = (item) => {
  return activeTab.value === 'completed' ? '100%' : '0%'
}

// 排序点击
const onSortClick = (type) => {
  if (type === 'newest') {
    sortType.value = 0
  } else if (type === 'expiry') {
    sortType.value = 1
  }
  loadTrainingList()
}

// 类型选择
const onTypeSelect = (action) => {
  selectedType.value = action.value
  showTypePicker.value = false
  loadTrainingList()
}

// 培训点击
const onTrainingClick = (training) => {
  // 跳转到培训详情页面
  router.push(`/training-detail/${training.id}`)
}

// 监听标签页变化
watch(activeTab, () => {
  currentPageIndex.value = 0
  loadTrainingList()
})

// 加载当前积分
const loadCurrentPoints = async () => {
  try {
    const res = await userApi.getScore()
    // 根据API返回的数据结构设置积分值
    // 如果返回的是对象，可能需要 res.score 或 res.laborerScore
    currentPoints.value = res;
  } catch (error) {
    console.error('获取积分失败:', error)
    currentPoints.value = 0
  }
}

// 初始化
onMounted(() => {
  loadCurrentPoints()
  loadTrainingTypes()
  loadTrainingList()
})
</script>

<style lang="scss" scoped>

.learning-platform {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $white;
}

// 次级标题栏
.secondary-header {
  background: $primary-color;
  padding: 0 16px;

  .tab-section {
    .tab-bar {
      display: flex;
      justify-content: center;

      .tab-item {
        color: rgba(255, 255, 255, 0.7);
        font-size: 16px;
        padding: 8px 16px;
        cursor: pointer;
        position: relative;
        transition: color 0.3s ease;

        &.active {
          color: $white;
          font-weight: 500;

          &::after {
            content: '';
            position: absolute;
            bottom: -12px;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            height: 2px;
            background: $white;
          }
        }
      }
    }
  }

  // 类型筛选和积分行
  .filter-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding: 12px 0;

    .filter-item {
      text-align: center;
      flex: 1;
      color: $white;
      font-size: 14px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      span {
        color: $white;
      }
    }

    .points-display {
      display: flex;
      align-items: center;
      text-align: center;
      flex: 1;
      color: $white;
      font-size: 14px;

      .points-value {
        margin-left: 2px;
        font-size: 20px;
      }
    }
  }
}

// 排序栏
.sort-section {
  background: #F7F8FA;
  padding: 12px 16px;
  display: flex;
  gap: 16px;
  
  .sort-item {
    background: white;
    padding: 8px 12px;
    border-radius: 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
    
    &:hover {
      background: #E8F4FF;
    }
    
    &.active {
      background: #E8F4FF;
    }
    
    &:active {
      background: #E8F4FF;
    }
  }
}

// 培训列表
.training-list {
  flex: 1;
  overflow-y: auto;
  background: $white;
  border-radius: 24px 24px 0 0;
}

.training-item {
  background: white;
  margin: 0 16px 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:not(:last-child) {
      border-bottom: 0.5px solid  #E1E4EB;
    }
  

}

.training-main {
  display: flex;
  padding: 16px;
  
  .training-image {
  width: 80px;
  height: 80px;
  margin-right: 12px;
  position: relative;
  }

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #98aedd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.training-image::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 5px;
  right: -5px;
  height: 100%;
  background: #D0D0D0;
  border-radius: 8px;
  z-index: 0;
} 

.video-text {
  color: #ffffff;
  font-size: 24px;
  font-weight: 500;
  position: relative;
  z-index: 2;
}
  .training-content {
    flex: 1;
    
    .training-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      
      .training-title {
        font-size: 16px;
        font-weight: 500;
        color: $text-primary;
        line-height: 1.4;
        flex: 1;
        margin-right: 8px;
      }
      
      .training-status {
        display: flex;
          align-items: center;
          padding: 2px 8px;
          background:  #ECF2FE;
          color: $primary-color;
          font-size: 12px;
          border-radius: 2px;

          .img{
            position: relative;
            top: 1px;
            margin-right: 2px;
          }
      }
    }
    
    .training-type {
      font-size: 12px;
      color: $text-secondary;
      margin-bottom: 12px;
    }
    
    .progress-section {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #636878;
      font-size: 14px;
      font-weight: 400;
      
      .progress-bar {
        flex: 1;
        height: 4px;
        background: #E8F4FF;
        border-radius: 2px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: #1961AC;
          transition: width 0.3s;
        }
      }
      
      .progress-text {
        font-size: 12px;
        color: $text-secondary;
      }
    }
  }
}

.training-footer {
  padding: 12px 16px;
  
  .time-info {
    display: flex;
    justify-content: space-between;
    color: #9195a2;
    font-size: 12px;
    font-weight: 400;
    
    .time-item {
      display: flex;
      justify-content: space-between;
      
    }
  }
}

// Vant组件样式覆盖
:deep(.van-nav-bar) {
  background: #1961AC;
}

:deep(.van-nav-bar__title) {
  color: white;
  font-weight: 500;
}

:deep(.van-nav-bar__arrow) {
  color: white;
}
</style>
