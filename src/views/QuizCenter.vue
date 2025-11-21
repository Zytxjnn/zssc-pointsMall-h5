<template>
  <div class="quiz-center">
    <xjnn-nav-bar title="答题中心" style="background-color: #1961AC; color: #ffffff;" />

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
          <span>{{ getTypeDisplayName(selectedType) }}▼</span>
        </div>
        <div class="points-display">
          当前积分: {{ currentPoints }}
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

    <!-- 答题列表 -->
    <div class="quiz-list">
      <div 
        class="quiz-item"
        v-for="item in filteredQuizzes"
        :key="item.id"
        @click="onQuizClick(item)"
      >
        <!-- 上半部分：主要内容 -->
        <div class="quiz-main">
          <!-- 左侧图片占位符 -->
          <div class="quiz-image">
            <div class="image-placeholder"></div>
          </div>
          
          <!-- 右侧内容 -->
          <div class="quiz-content">
            <div class="quiz-header">
                <div class="quiz-title">{{ item.name }}</div>
              <!-- 积分/状态图标 -->
              <div class="quiz-status">
                <van-image class="img img-gou" v-if="activeTab === 'completed'"  width="14" height="14" src="/images/quiz/gou.png" />
                <van-image class="img img-point" v-else  width="14" height="14" src="/images/quiz/point.png" />
                {{ activeTab === 'completed' ? '+' : '' }}{{ item.score }}
              </div>
            </div>
            
            <div class="quiz-type">类型: {{ item.examTypeName }}</div>
            
            <!-- 进度条 -->
            <div class="progress-section">
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
        <div class="quiz-footer">
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
import { examApi, userApi } from '@/api'

const router = useRouter()

// 当前积分
const currentPoints = ref(0)

// 当前标签页
const activeTab = ref('incomplete')

// 类型选择器
const showTypePicker = ref(false)
const selectedType = ref('all')

// 排序方式 (0:开始时间, 1:临期最短)
const sortType = ref(0)

// 类型选项（从API获取）
const typeActions = ref([])
const examTypeList = ref([])

// 答题数据（从API获取）
const quizzes = ref([])

// 分页参数
const currentPageIndex = ref(0) // 页码从0开始
const pageSize = ref(10)
const totalCount = ref(0)

// 显示考试列表（数据已通过API过滤和排序）
const filteredQuizzes = computed(() => {
  return quizzes.value
})

// 获取类型显示名称
const getTypeDisplayName = (type) => {
  if (type === 'all') {
    return '全部类型'
  }
  
  // 从API数据中查找类型名称
  const typeItem = examTypeList.value.find(item => 
    (item.id || item.value) === type
  )
  
  return typeItem ? (typeItem.name || typeItem.typeName) : '全部类型'
}

// 排序点击
const onSortClick = (type) => {
  sortType.value = type === 'newest' ? 0 : 1
  // 重新加载数据
  loadExamList()
}

// 加载考试类型列表
const loadExamTypes = async () => {
  try {
    const res = await examApi.getExamTypeList()
    examTypeList.value = res || []
    
    // 构建类型选项，添加"全部类型"选项
    typeActions.value = [
      { name: '全部类型', value: 'all' },
      ...(res || []).map(item => ({
        name: item.name || item.typeName,
        value: item.id || item.value
      }))
    ]
    
    console.log('考试类型列表:', examTypeList.value)
    console.log('类型选项:', typeActions.value)
  } catch (error) {
    console.error('获取考试类型失败:', error)
    // 使用默认选项
    typeActions.value = [
      { name: '全部类型', value: 'all' }
    ]
  }
}

// 获取DescField值（根据标签页和排序类型）
const getDescField = () => {
  if (activeTab.value === 'completed') {
    // 已完成：根据sortType决定排序方式
    return sortType.value
  } else {
    // 未完成：根据sortType决定排序方式
    return sortType.value
  }
}

// 加载考试列表
const loadExamList = async () => {
  try {
    const params = {
      ExamTypeId: selectedType.value === 'all' ? null : selectedType.value,
      DescField: getDescField(),
      IsComplete: activeTab.value === 'completed',
      CurrentPageIndex: currentPageIndex.value,
      PageSize: pageSize.value
    }
    
    
    const {list} = await examApi.getExamList(params)

    quizzes.value = list || []
    // totalCount.value = res?.totalCount || res?.length || 0

  } catch (error) {
    quizzes.value = []
    totalCount.value = 0
  }
}

// 类型选择
const onTypeSelect = (action) => {
  selectedType.value = action.value
  showTypePicker.value = false
  // 重新加载数据
  loadExamList()
}

// 获取进度条宽度
const getProgressWidth = (item) => {
  if (activeTab.value === 'completed') {
    return '100%'  // 已完成标签页显示100%
  } else {
    return '0%'    // 未完成标签页显示0%
  }
}

// 获取进度条文本
const getProgressText = (item) => {
  if (activeTab.value === 'completed') {
    return '100%'  // 已完成标签页显示100%
  } else {
    return '0%'    // 未完成标签页显示0%
  }
}

// 答题点击
const onQuizClick = (quiz) => {
  // 如果当前是已完成标签页，不响应点击
  if (activeTab.value === 'completed') {
    return
  }
  
  // 跳转到试卷详情页面
  router.push(`/quiz-detail/${quiz.id}`)
}

// 监听标签页切换
watch(activeTab, () => {
  currentPageIndex.value = 0 // 重置页码到第0页
  loadExamList()
})

// 加载当前积分
const loadCurrentPoints = async () => {
  try {
    const res = await userApi.getScore()
    console.log('获取积分:', res)
    currentPoints.value = res;
  } catch (error) {
    console.error('获取积分失败:', error)
    currentPoints.value = 0
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadCurrentPoints()
  loadExamTypes()
  loadExamList()
})

</script>

<style lang="scss" scoped>

.quiz-center {
  height: 100vh;
  background: $background-color;
  display: flex;
  flex-direction: column;
}

// 顶部标题栏
.page-header {
  background: $primary-color;
  padding: 12px 16px;
  color: $white;

  .header-content {
    display: flex;
    align-items: center;
    position: relative;

    .back-icon {
      font-size: 20px;
      cursor: pointer;
      margin-right: 16px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 500;
      margin: 0;
      text-align: center;
      flex: 1;
      margin-right: 36px; // 补偿返回按钮的宽度
    }
  }
}

// 次级标题栏 - 标签页和筛选行
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
      flex: 1;
      text-align: center;
      color: $white;
      font-size: 14px;
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

// 答题列表
.quiz-list {
  flex: 1;
  padding:0 16px;
  background: $white;
  border-radius: 24px 24px 0 0;
  overflow-y: auto;

  .quiz-item {
    background: $white;
    padding: 16px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    &:not(:last-child) {
      border-bottom: 0.5px solid  #E1E4EB;
    }

    &:last-child {
      margin-bottom: 0;
    }

    // 上半部分：主要内容
    .quiz-main {
      display: flex;
      align-items: center;
      margin-bottom: 12px;

      .quiz-image {
        margin-right: 12px;
        flex-shrink: 0;

        .image-placeholder {
          width: 60px;
          height: 60px;
          background: #f0f0f0;
          border-radius: 6px;
        }
      }

      .quiz-content {
        flex: 1;
        min-width: 0;

        .quiz-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;

        .quiz-title {
          font-size: 16px;
          font-weight: 500;
          color: $text-primary;
          line-height: 1.4;
          flex: 1;
          margin-right: 8px;
        }

        .quiz-status {
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

      .quiz-type {
        color: $text-secondary;
        font-size: 14px;
        margin-bottom: 12px;
      }

      .progress-section {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        .progress-bar {
          flex: 1;
          height: 6px;
          background: #e8e8e8;
          border-radius: 3px;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background: $primary-color;
            border-radius: 3px;
            transition: width 0.3s ease;
          }
        }

        .progress-text {
          font-size: 12px;
          color: $text-secondary;
          min-width: 35px;
          text-align: right;
        }
      }
    }

    // 下半部分：时间信息
   
    }

    .quiz-footer {
      padding-top: 12px;

      .time-info {
        display: flex;
        justify-content: space-between;
        width: 100%;

        .time-item {
          font-size: 12px;
          color: $text-secondary;
          flex: 1;
          display: flex;
          align-items: center;

          &:first-child {
            justify-content: flex-start;
          }

          &:last-child {
            justify-content: flex-end;
          }

          .time-label {
            margin-right: 4px;
          }

          .time-value {
            color: $text-primary;
          }
        }
      }
    }
  }
} 

// 确保 Action Sheet 保持白色背景（不受灰色Popup影响）
:deep(.van-action-sheet) {
  background: $white !important;
  
  .van-action-sheet__header {
    background: $white !important;
    color: $text-primary !important;
  }
  
  .van-action-sheet__item {
    background: $white !important;
    color: $text-primary !important;
  }
  
  .van-action-sheet__cancel {
    background: $white !important;
    color: $text-primary !important;
  }
}

</style>
