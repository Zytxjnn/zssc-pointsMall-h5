<template>
  <div class="quiz-detail">
    <xjnn-nav-bar title="试卷内容" style="background: #1961AC; color: #ffffff;" />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" size="24px" />
      <span>加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <van-icon name="warning-o" size="48px" color="#ff6b6b" />
      <p>{{ error }}</p>
      <van-button type="primary" @click="loadExamDetail">重试</van-button>
    </div>

    <!-- 考试内容 -->
    <div v-else>
      <div class="quiz-header">
        <div class="top">
          <div class="left"> {{ quiz.title }}</div>
          <div class="right" v-if="quiz.trainingId" @click="goToTraining">
            学习关联课件
          </div>
        </div>
        <div class="bottom">
          共{{ totalQuestions }}题, 已答{{ answeredQuestions }}题
        </div>
      </div>
     

    <!-- 题目列表 -->
    <div class="questions-container">
      <!-- 单选题 -->
      <div class="question-section" v-if="singleChoiceQuestions.length > 0">
        <div class="section-header">
          <span class="section-title">单选题</span>
          <span class="section-info">每题1分, 已答 ({{ getAnsweredCount('single') }}/{{ singleChoiceQuestions.length }})</span>
        </div>
        
         <div class="question-card" v-for="(question, index) in singleChoiceQuestions" :key="`single-${question.id}`">
          <div class="question-content"> 
            <span class="question-number">{{ question.displayNumber }}.</span>
            {{ question.content }}
          </div>
          <van-radio-group v-model="question.selected">
            <van-radio 
              v-for="(option, optionIndex) in question.options" 
              :key="optionIndex"
              :name="optionIndex"
            >
              {{ option.name }}
            </van-radio>
          </van-radio-group>
        </div>
      </div>

      <!-- 多选题 -->
      <div class="question-section" v-if="multipleChoiceQuestions.length > 0">
        <div class="section-header">
          <span class="section-title">多选题</span>
          <span class="section-info">每题1分, 已答 ({{ getAnsweredCount('multiple') }}/{{ multipleChoiceQuestions.length }})</span>
        </div>
        
         <div class="question-card" v-for="(question, index) in multipleChoiceQuestions" :key="`multiple-${question.id}`">
          <div class="question-content">
            <span class="question-number">{{ question.displayNumber }}.</span>
            {{ question.content }}
          </div>
          <van-checkbox-group v-model="question.selected">
            <van-checkbox 
              v-for="(option, optionIndex) in question.options" 
              :key="optionIndex"
              :name="optionIndex"
            >
              {{ option.name }}
            </van-checkbox>
          </van-checkbox-group>
        </div>
      </div>

      <!-- 判断题 -->
      <div class="question-section" v-if="trueFalseQuestions.length > 0">
        <div class="section-header">
          <span class="section-title">判断题</span>
          <span class="section-info">每题1分, 已答 ({{ getAnsweredCount('truefalse') }}/{{ trueFalseQuestions.length }})</span>
        </div>
        
         <div class="question-card" v-for="(question, index) in trueFalseQuestions" :key="`truefalse-${question.id}`">
          <div class="question-content">
            <span class="question-number">{{ question.displayNumber }}.</span>
            {{ question.content }}
          </div>
          <van-radio-group v-model="question.selected">
            <van-radio 
              v-for="(option, optionIndex) in question.options" 
              :key="optionIndex"
              :name="optionIndex"
            >
              {{ option.name }}
            </van-radio>
          </van-radio-group>
        </div>
      </div>
    </div>

      <!-- 底部提交按钮 -->
      <div class="submit-section">
        <van-button 
          type="primary" 
          block 
          class="submit-btn"
          @click="onSubmitQuiz"
        >
          提交答卷
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { examApi } from '@/api'

const router = useRouter()
const route = useRoute()

// 试卷数据
const quiz = ref({
  id: null,
  title: '',
  type: '',
  points: 0,
  passingScore: 0,
  totalScore: 0,
  trainingId: null // 关联的培训ID
})

// 题目显示数据（用于界面渲染）
const displayQuestions = ref([])

// 答案数据（用于提交，格式：{ questionId, answer }）
const answers = ref([])

// 加载状态
const loading = ref(true)
const error = ref('')

// 计算属性
const singleChoiceQuestions = computed(() => {
  return displayQuestions.value.filter(q => q.type === 'single')
})

const multipleChoiceQuestions = computed(() => {
  return displayQuestions.value.filter(q => q.type === 'multiple')
})

const trueFalseQuestions = computed(() => {
  return displayQuestions.value.filter(q => q.type === 'truefalse')
})

const totalQuestions = computed(() => {
  return displayQuestions.value.length
})

const answeredQuestions = computed(() => {
  return answers.value.filter(a => a.answer !== '').length
})

// 获取已答题数量（按类型）
const getAnsweredCount = (type) => {
  const typeQuestionIds = displayQuestions.value
    .filter(q => q.type === type)
    .map(q => q.id)
  
  return answers.value.filter(a => typeQuestionIds.includes(a.questionId) && a.answer !== '').length
}

// 监听题目选择变化，自动更新answers
watch(displayQuestions, (newQuestions) => {
  newQuestions.forEach(question => {
    let answer = ''
    
    if (question.type === 'multiple') {
      // 多选题：将选中的选项索引转换为选项ID，用逗号分隔
      if (question.selected && question.selected.length > 0) {
        const selectedIds = question.selected.map(index => question.options[index]?.id || '')
        answer = selectedIds.filter(id => id).join(',')
      }
    } else {
      // 单选题和判断题：将选中的选项索引转换为选项ID
      if (question.selected !== null && question.selected !== undefined) {
        answer = question.options[question.selected]?.id || ''
      }
    }
    
    // 更新对应题目的答案
    const answerIndex = answers.value.findIndex(a => a.questionId === question.id)
    if (answerIndex >= 0) {
      answers.value[answerIndex].answer = answer
    }
  })
}, { deep: true })

// 获取考试详情和题目
const loadExamDetail = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const examId = route.params.id
    if (!examId) {
      error.value = '考试ID不能为空'
      return
    }
    
    const examDetail = await examApi.getExamDetail({ id: examId })
    
    // 更新试卷基本信息
    quiz.value = {
      id: examDetail.id,
      title: examDetail.name,
      type: examDetail.examTypeName,
      points: examDetail.points,
      passingScore: examDetail.passingScore,
      totalScore: examDetail.totalScore,
      trainingId: examDetail.trainingId || null // 关联的培训ID
    }
    
    
    // 临时数组用于存放所有题目
    const allQuestions = []
    let questionNumber = 1 // 题目序号
    

    // 处理单选题
    if (examDetail.singleChoiceQuestions && Array.isArray(examDetail.singleChoiceQuestions)) {
      examDetail.singleChoiceQuestions.forEach(q => {
        allQuestions.push({
          id: q.questionId,
          displayNumber: questionNumber++,
          type: 'single',
          content: q.name,
          options: q.questionItems,
          selected: null,
          correct: q.correct || q.answer
        })
      })
    }
    
    // 处理多选题
    if (examDetail.multipleChoiceQuestions && Array.isArray(examDetail.multipleChoiceQuestions)) {
      examDetail.multipleChoiceQuestions.forEach(q => {
        allQuestions.push({
          id: q.questionId,
          displayNumber: questionNumber++,
          type: 'multiple',
          content: q.name,
          options: q.questionItems,
          selected: [],
          correct: q.correct || q.answer
        })
      })
    }
    
    // 处理判断题
    if (examDetail.trueOrFalseQuestions && Array.isArray(examDetail.trueOrFalseQuestions)) {
      examDetail.trueOrFalseQuestions.forEach(q => {
        allQuestions.push({
          id: q.questionId,
          displayNumber: questionNumber++,
          type: 'truefalse',
          content: q.name,
          options: q.questionItems,
          selected: null,
          correct: q.correct || q.answer
        })
      })
    }
    
    displayQuestions.value = allQuestions
    
    // 初始化answers数组（为每道题目创建一个answer对象）
    answers.value = allQuestions.map(q => ({
      questionId: q.id,
      answer: ''
    }))
    
    console.log('考试详情加载完成:', {
      quiz: quiz.value,
      totalQuestions: displayQuestions.value.length,
      single: examDetail.singleChoiceQuestions?.length || 0,
      multiple: examDetail.multipleChoiceQuestions?.length || 0,
      truefalse: examDetail.trueOrFalseQuestions?.length || 0,
      displayQuestions: displayQuestions.value,
      answers: answers.value
    })
    
    if (displayQuestions.value.length === 0) {
      showToast('暂无题目数据')
    }
    
  } catch (err) {
    console.error('获取考试详情失败:', err)
    error.value = '加载考试详情失败，请重试'
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}


// 跳转到关联的培训页面
const goToTraining = () => {
  if (quiz.value.trainingId) {
    router.push(`/training-detail/${quiz.value.trainingId}`)
  }
}

// 提交答卷
const onSubmitQuiz = async () => {
  const unansweredCount = totalQuestions.value - answeredQuestions.value
  
  // 根据未作答题目数量设置提示文字
  let message = ''
  if (unansweredCount > 0) {
    message = `还有 ${unansweredCount} 道题没有作答，确定要提交吗？提交后将无法修改。`
  } else {
    message = '所有题目已完成，确定要提交答卷吗？提交后将无法修改。'
  }

  try {
    await showConfirmDialog({
      title: '确认提交',
      message: message
    })
    
    // 准备提交数据
    const submitData = {
      id: route.params.id,  // 试卷ID
      items: answers.value   // 答案数组
    }
    
    console.log('提交的答案数据:', submitData)
    
    // 显示加载状态
    const toast = showToast({
      type: 'loading',
      message: '提交中...',
      forbidClick: true,
      duration: 0
    })
    
    try {
      // 调用提交接口
      const result = await examApi.examSubmit(submitData)
      
      toast.close()

      
      // 提取考试结果信息
      const examResult = {
        isPassmark: result?.isPassmark || false,  // 是否通过考试
        passmark: quiz.value.passingScore || 60,   // 合格分数
        score: result?.score || 0                   // 实际得分
      }
      
      
      // 提交成功后跳转到考试结果页面，传递结果参数
      router.push({
        path: `/quiz-result/${route.params.id}`,
        query: {
          isPassmark: examResult.isPassmark,
          passmark: examResult.passmark,
          score: examResult.score
        }
      })
      
    } catch (err) {
      toast.close()
      console.error('提交失败:', err)
      showToast({
        type: 'fail',
        message: '提交失败，请重试'
      })
    }
    
  } catch (error) {
    // 用户取消提交
    console.log('用户取消提交')
  }
}

// 页面加载时获取试卷信息
onMounted(() => {
  loadExamDetail()
})
</script>

<style lang="scss" scoped>

.quiz-detail {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 80px; // 为底部按钮留出空间
  
}

.quiz-header {
  padding: 16px;
  // background-image: url('/images/quiz/header-bg.png');
  // background-size: 100% 100%;
  background-color: #1961AC;

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .left {
      color: #ffffff;
      font-family: "PingFang SC";
      font-size: 18px;
      font-style: normal;
      font-weight: 500;
      line-height: 26px;
    }

    .right {
      display: flex;
      padding: 5px 16px;
      justify-content: center;
      align-items: center;
      gap: 4px;
      border-radius: 999px;
      background: #FFF;

      color: #1961ac;
      text-align: center;
      font-family: "PingFang SC";
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 22px;
    }
    
  }

  .bottom {
    margin-top: 7px;
    display: flex;
    padding: 4px 16px;
    justify-content: center;
    align-items: center;
    border-radius: 99px;
    background: #ffffff26;
    width: 124px;
    color: #ffffff;
    font-size: 12px;
    font-weight: 400;
  }
}


// 加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: $text-secondary;

  .van-loading {
    margin-bottom: 12px;
  }
}

// 错误状态
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .van-icon {
    margin-bottom: 16px;
  }

  p {
    color: $text-secondary;
    margin-bottom: 20px;
  }
}

// 学习关联课件按钮
.courseware-section {
  background: $white;
  padding: 16px;
  margin-bottom: 8px;

  .courseware-btn {
    height: 44px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
  }
}

// 试卷标题
.quiz-title-section {
  background: $white;
  padding: 16px;
  margin-bottom: 8px;

  .quiz-title {
    font-size: 18px;
    font-weight: bold;
    color: $text-primary;
    margin: 0;
    line-height: 1.4;
  }
}

// 答题进度
.progress-section {
  background: #fff7e6; // 浅黄色背景
  padding: 12px 16px;
  margin-bottom: 8px;

  .progress-info {
    font-size: 14px;
    color: $text-primary;
    text-align: center;
  }

}

// 题目容器
.questions-container {
  padding: 0 16px;
}

// 题目类型区域
.question-section {
  margin-bottom: 16px;

  .section-header {
    background: $white;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 8px 8px 0 0;
    border-bottom: 1px solid $border-color;

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: $text-primary;
    }

    .section-info {
      font-size: 12px;
      color: $text-secondary;
    }
  }
}

// 题目卡片
.question-card {
  background: $white;
  padding: 16px;
  border-bottom: 1px solid $border-color;

  &:last-child {
    border-bottom: none;
    border-radius: 0 0 8px 8px;
  }

  .question-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .question-number {
      background: $primary-color;
      color: $white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 8px;
    }

    .question-type {
      font-size: 12px;
      color: $text-secondary;
    }
  }

  .question-content {
    font-size: 16px;
    color: $text-primary;
    font-weight: 500;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  :deep(.van-radio-group) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    .van-radio {
      margin-bottom: 0;
    }
  }

  :deep(.van-checkbox-group) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    .van-checkbox {
      margin-bottom: 0;
    }
  }
}

// 底部提交按钮
.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $white;
  padding: 16px;
  border-top: 1px solid $border-color;
  z-index: 100;

  .submit-btn {
    height: 44px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
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

:deep(.van-button--primary) {
  background-color: $primary-color;
}
</style>
