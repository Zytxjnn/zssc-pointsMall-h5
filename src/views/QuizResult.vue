<template>
  <div class="quiz-result">
    <xjnn-nav-bar title="考试结果" />

    <!-- 考试结果内容 -->
    <div class="result-content">
      <!-- 环形进度条和分数 -->
      <div class="score-section">
        <van-circle
          v-model:current-rate="progressRate"
          :rate="progressRate"
          :speed="100"
          :color="progressColor"
          :stroke-width="8"
          :size="200"
          text=""
        >
          <div class="score-display">
            <div class="score-number" :class="isPassed ? 'success' : 'fail'">{{ currentScore }}</div>
            <div class="passing-info">合格分: {{ passingScore }}分</div>
          </div>
        </van-circle>
      </div>

      <!-- 结果信息 -->
      <div class="result-message">
        <h2 class="result-title" :class="isPassed ? 'pass' : 'fail'">
          {{ isPassed ? '恭喜你通过考试!' : '本次考试未通过!' }}
        </h2>
      </div>

      <!-- 答题情况 -->
      <div v-if="examQuestionResponses.length > 0" class="answer-status">
        <div class="status-title">答题情况</div>
        <div class="status-content">
          <div 
            v-for="response in examQuestionResponses" 
            :key="response.questionType"
            class="status-item"
          >
            <span class="question-type">{{ response.questionTypeName }}：</span>
            <span class="question-info">
              {{ response.questionQuantity }}题, 每题{{ response.questionScore }}分 | 答对: 
              <span class="correct-count">{{ response.questionTrueQuantity }} 题  </span>
            </span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <van-button 
          :type="isPassed ? 'success' : 'warning'"
          block 
          class="action-btn"
          @click="isPassed ? onContinue() : onRetake()"
        >
          {{ isPassed ? '继续答题' : '重新答题' }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 考试结果数据
const currentScore = ref(0)
const passingScore = ref(70)
const isPassed = ref(false)
const examQuestionResponses = ref([])

// 从路由参数获取考试结果
const initExamResult = () => {
  const query = route.query
  
  // 获取传递的参数
  const score = parseInt(query.score) || 0
  const passmark = parseInt(query.passmark) || 70
  const isPassmark = query.isPassmark === 'true'
  const questionResponses = query.examQuestionResponses ? JSON.parse(query.examQuestionResponses) : []
  
  // 设置结果数据
  currentScore.value = score
  passingScore.value = passmark
  isPassed.value = isPassmark
  examQuestionResponses.value = questionResponses
  
  console.log('接收到的考试结果:', {
    score: currentScore.value,
    passmark: passingScore.value,
    isPassmark: isPassed.value,
    examQuestionResponses: examQuestionResponses.value
  })
}

// 计算进度条进度（基于总分100分）
const progressRate = computed(() => {
  return Math.min(currentScore.value, 100)
})

// 计算进度条颜色
const progressColor = computed(() => {
  if (isPassed.value) {
    return '#07c160' // 绿色 - 通过
  } else {
    return '#ff6b35' // 橙色 - 未通过
  }
})

// 继续答题
const onContinue = () => {
  router.push('/quiz-center')
}

// 重新答题
const onRetake = () => {
  // 返回试卷详情页面重新答题
  router.push(`/quiz-detail/${route.params.id}`)
}

// 获取题目类型显示名称
const getQuestionTypeName = (questionType) => {
  const typeMap = {
    1: '单选题',
    2: '多选题', 
    3: '判断题'
  }
  return typeMap[questionType] || '未知题型'
}

// 页面加载时获取数据
onMounted(() => {
  initExamResult()
})
</script>

<style lang="scss" scoped>

.quiz-result {
  min-height: 100vh;
  background: $white;
}

// 页面标题栏
.page-header {
  background: $white;
  border-bottom: 1px solid $border-color;
}

// 结果内容
.result-content {
  padding: 60px 20px 40px;
  text-align: center;
  background: $white;
}

// 分数区域
.score-section {
  margin-bottom: 40px;
  
  .score-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    
    .score-number {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 8px;
      
      &.success {
        color: #329571;
      }
      
      &.fail {
        color: #DC340F;
      }
    }
    
    .passing-info {
      font-size: 14px;
      color: $text-secondary;
    }
  }
}

// 结果信息
.result-message {
  margin-bottom: 24px;
  
  .result-title {
    font-size: 20px;
    font-weight: 500;
    margin: 0;
  }
}

// 答题情况
.answer-status {
  margin-bottom: 24px;
  
  .status-title {
    font-size: 16px;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 12px;
    text-align: left;
  }
  
  .status-content {
    background: #F7F8FA;
    border-radius: 8px;
    padding: 16px;
    
    .status-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .question-type {
        font-size: 14px;
        color: $text-secondary;
        min-width: 60px;
        flex-shrink: 0;
      }
      
      .question-info {
        font-size: 14px;
        color: $text-primary;
        flex: 1;
        
        .correct-count {
          color: #07c160;
          font-weight: 500;
        }
      }
    }
  }
}

// 操作按钮区域
.action-section {
  .action-btn {
    height: 36px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 500;
    
    // 通过状态按钮样式
    &.van-button--success {
      background: #ECF7F6;
      border-color: #ECF7F6;
      color: #329571;
    }
    
    // 未通过状态按钮样式
    &.van-button--warning {
      background: #FFF3EF;
      color:#DC340F;
      border-color: #FFF3EF;
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

:deep(.van-circle) {
  .van-circle__text {
    display: none;
  }
}
</style>