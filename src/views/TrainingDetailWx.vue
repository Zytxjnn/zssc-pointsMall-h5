<template>
<div class="training-detail">
    <div class="video-player-container">
      <video  id="videoPlayer" preload="auto" playsinline webkit-playsinline controls></video>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" size="24px" />
      <span class="loading-text">加载中...</span>
    </div>

    <!-- 培训标题和状态 -->
    <div v-else class="training-header">
      <h1 class="training-title">{{ training.title }}</h1>
      <div v-if="training.status === 'completed'" class="status-badge">您已完成</div>
    </div>

    <!-- 观看进度 -->
    <div v-if="!loading && watchTime > 0 && training.status !== 'completed'" class="watch-progress">
      <div class="progress-info">
        <span class="progress-label">观看进度:</span>
        <span class="progress-value">{{ (watchTime / 60).toFixed(2) }}分钟 / {{ (requiredWatchTime / 60).toFixed(2) }}分钟</span>
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: Math.min((watchTime / requiredWatchTime) * 100, 100) + '%' }"
        ></div>
      </div>
    </div>

    <!-- 培训详情 -->
    <div v-if="!loading" class="training-info">
      <div class="info-item">
        <span class="info-label">截止时间:</span>
        <span class="info-value">{{ training.endTime }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">类型:</span>
        <span class="info-value">{{ training.type }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">最低时长:</span>
        <span class="info-value">{{ training.minMinutes }} 分钟</span>
      </div>
      <div class="info-item">
        <div class="info-label">视频名称:</div>
        <div class="info-value">{{ training.videoCourseName }}</div>
      </div>
    </div>

    <!-- 开始学习按钮 -->
    <div v-if="!loading" class="action-section">
      <div class="points-display">
        <span class="points-label">积分：</span>
        <span class="points-value">{{ training.points }}</span>
      </div>
      <div class="action-button">
        <van-button 
          block 
          type="primary" 
          :disabled="training.status === 'completed'"
          @click="onStartLearning"
        >
          {{ training.status === 'completed' ? '已完成' : '开始学习' }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import TCPlayer from 'tcplayer.js';

import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { request } from '@/utils/http'

const router = useRouter()
const route = useRoute()
const identityToken = ref(typeof route.query.identity_token === 'string' ? route.query.identity_token : '')

// 培训数据
const training = ref({
  id: null,
  title: '',
  type: '',
  points: 0,
  duration: '',
  startTime: '',
  endTime: '',
  status: 'incomplete',
  thumbnail: '',
  description: '',
  vodFileId: '',
  playerSign: ''
})

// 播放器实例
let player = null
// 强制重建 video DOM 的 key
const videoDomKey = ref(0)
// 存储事件监听器引用，用于清理
let timeUpdateHandler = null
let playHandler = null
let pauseHandler = null
let seekingHandler = null
// 记录真实时间流逝
let lastRealTime = 0 // 上次记录的真实时间（毫秒）
let isPlaying = false // 当前是否在播放

// 加载状态
const loading = ref(false)

// 观看时长记录
const watchTime = ref(0) // 实际观看时长（秒）
const requiredWatchTime = ref(0) // 要求观看时长（秒）
const isSubmitted = ref(false) // 是否已提交
const isSubmitting = ref(false) // 是否正在提交中

// 根据路由参数获取培训信息
const loadTraining = async () => {
  const trainingId = route.params.id
  if (!trainingId) {
    showToast('培训ID不存在')
    router.back()
    return
  }
  if (!identityToken.value) {
    showToast('缺少访问凭证')
    return
  }
  
  loading.value = true
  
  try {
    // 调用API获取培训详情
    const response = await request.get(
      '/Training/Get',
      { id: trainingId, identity_token: identityToken.value },
      { skipAuthRedirect: true }
    )
    
    // 映射API响应数据到组件数据
    training.value = {
      id: response.id || trainingId,
      title: response.name || '培训标题',
      type: response.courseTypeName || '培训类型',
      points: response.score || 0,
      duration: response.totalMinutes ? `${response.totalMinutes}分钟` : '30分钟',
      startTime: '', // 接口中没有开始时间字段
      endTime: response.endTime || '',
      status: response.isComplete ? 'completed' : 'incomplete', // 使用isComplete判断完成状态
      thumbnail: response.coverUrl || 'https://fastly.jsdelivr.net/npm/@vant/assets/mountain.jpeg',
      videoCourseName: response.videoCourseName,
      // 新增字段用于视频播放
      vodFileId: response.vodFileId || '',
      playerSign: response.playerSign || '',
      appId: response.playerSign || '',
      vodLicenseUrl: response.vodLicenseUrl || '',
      minMinutes: response.minMinutes,
      isComplete: response.isComplete
    }

    // 设置要求观看时长（使用接口返回的minMinutes字段）
    requiredWatchTime.value = response.minMinutes ? response.minMinutes * 60 : 30 * 60

    // 销毁旧实例并强制重建 video DOM，再初始化

    player = new TCPlayer('videoPlayer',{
      appID: response.appId,
      fileID: response.vodFileId,
      psign: response.playerSign,
      licenseUrl: response.vodLicenseUrl,
    })

    // 只有未完成的培训才监听播放器事件进行时长统计
    if (training.value.status !== 'completed') {
      setupPlayerEvents()
    } else {
      console.log('培训已完成，不进行观看时长统计')
    }
  } catch (error) {
    console.error('获取培训详情失败:', error)
    if (isIdentityUnauthorized(error)) {
      handleIdentityUnauthorized()
    } else {
      showToast('获取培训详情失败')
    }
  } finally {
    loading.value = false
  }
}

// 设置播放器事件监听
const setupPlayerEvents = () => {
  if (!player) return

  // 先清理旧的事件监听器
  removePlayerEvents()

  // 重置状态
  lastRealTime = 0
  isPlaying = false

  // 播放事件 - 开始计时
  playHandler = () => {
    // 如果已完成，不进行计时
    if (training.value.status === 'completed') {
      return
    }
    isPlaying = true
    lastRealTime = Date.now()
    console.log('开始播放，开始计时')
  }

  // 暂停事件 - 停止计时
  pauseHandler = () => {
    // 如果已完成，不进行统计
    if (training.value.status === 'completed') {
      return
    }
    if (isPlaying && lastRealTime > 0) {
      const realTimeDiff = (Date.now() - lastRealTime) / 1000 // 转换为秒
      watchTime.value += realTimeDiff
      console.log(`暂停播放，本次累积: ${realTimeDiff.toFixed(2)}秒，总观看时长: ${watchTime.value.toFixed(2)}秒`)
    }
    isPlaying = false
    lastRealTime = 0
  }

  // 快进/快退事件 - 重置计时
  seekingHandler = () => {
    // 如果已完成，不进行统计
    if (training.value.status === 'completed') {
      return
    }
    console.log('检测到快进/快退，重置计时')
    // 如果正在播放，先累积当前的观看时长
    if (isPlaying && lastRealTime > 0) {
      const realTimeDiff = (Date.now() - lastRealTime) / 1000
      watchTime.value += realTimeDiff
      console.log(`快进前累积: ${realTimeDiff.toFixed(2)}秒`)
    }
    // 重置真实时间记录，等待下次播放
    lastRealTime = Date.now()
  }

  // 时间更新事件 - 用于检查是否完成
  timeUpdateHandler = () => {
    // 如果已完成，不进行任何统计
    if (training.value.status === 'completed') {
      return
    }
    
    // 如果正在播放，累积真实时间
    if (isPlaying && lastRealTime > 0) {
      const currentRealTime = Date.now()
      const realTimeDiff = (currentRealTime - lastRealTime) / 1000
      
      // 每秒更新一次
      if (realTimeDiff >= 1) {
        watchTime.value += realTimeDiff
        lastRealTime = currentRealTime
        console.log(`累积观看时长: ${watchTime.value.toFixed(2)}秒`)
      }
    }
    
    // 检查是否达到要求观看时长
    if (watchTime.value >= requiredWatchTime.value && !isSubmitted.value && !isSubmitting.value) {
      console.log('达到要求观看时长，开始提交培训')
      submitTraining()
    }
  }

  // 绑定事件监听器
  player.on('play', playHandler)
  player.on('pause', pauseHandler)
  player.on('seeking', seekingHandler)
  player.on('timeupdate', timeUpdateHandler)
}

// 移除播放器事件监听
const removePlayerEvents = () => {
  if (player) {
    try {
      if (playHandler) {
        player.off('play', playHandler)
        playHandler = null
      }
      if (pauseHandler) {
        player.off('pause', pauseHandler)
        pauseHandler = null
      }
      if (seekingHandler) {
        player.off('seeking', seekingHandler)
        seekingHandler = null
      }
      if (timeUpdateHandler) {
        player.off('timeupdate', timeUpdateHandler)
        timeUpdateHandler = null
      }
    } catch (e) {
      console.error('移除事件监听器失败:', e)
    }
  }
}

// 优雅销毁播放器
const destroyPlayer = () => {
  // 先移除事件监听器
  removePlayerEvents()
  
  // 重置时间记录
  lastRealTime = 0
  isPlaying = false
  
  // 再销毁播放器实例
  if (player) {
    try {
        player.dispose()
    } catch (e) {
      console.error('销毁播放器失败:', e)
    }
    player = null
  }
}

// 提交培训完成
const submitTraining = async () => {
  // 如果已完成，不提交
  if (training.value.status === 'completed') {
    console.log('培训已完成，无需提交')
    return
  }
  
  // 防止重复提交
  if (isSubmitted.value || isSubmitting.value) {
    console.log('培训已提交或正在提交中，跳过')
    return
  }
  
  isSubmitting.value = true
  
  try {
    // 计算观看时长（分钟，保留两位小数）
    const watchMinutes = (watchTime.value / 60).toFixed(2)
    
    console.log(`开始提交培训，观看时长: ${watchMinutes} 分钟`)
    
    await request.post(
      '/Training/Submit',
      {
        id: training.value.id,
        viewMinutes: Number(watchMinutes)
      },
      {
        params: {
          identity_token: identityToken.value
        },
        skipAuthRedirect: true
      }
    )
    
    console.log('培训提交成功')
    showToast('培训完成！')
    
    // 更新培训状态
    training.value.status = 'completed'
    isSubmitted.value = true
    
  } catch (error) {
    console.error('提交培训失败:', error)
    if (isIdentityUnauthorized(error)) {
      handleIdentityUnauthorized()
    } else {
      showToast('提交培训失败')
      // 提交失败后也标记为已提交，防止重复请求
      isSubmitted.value = true
    }
  } finally {
    isSubmitting.value = false
  }
}

const isIdentityUnauthorized = (error) => {
  return error?.code === 401 || error?.response?.status === 401
}

const handleIdentityUnauthorized = () => {
  showToast('身份凭证无效，请获取新凭证')
}

// 开始学习
const onStartLearning = () => {
  if (player) {
    player.play()
  }
}

// 页面加载时获取培训信息
onMounted(() => {
  loadTraining()
})

onUnmounted(() => {
  console.log('onUnmounted')
  // 清理播放器资源
  destroyPlayer()
  
})
</script>

<style lang="scss" scoped>

.training-detail {
  min-height: 100vh;
  background: $white;
  padding-bottom: 80px; // 为底部按钮留出空间
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

// 加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: $white;

  .loading-text {
    margin-top: 16px;
    font-size: 14px;
    color: $text-secondary;
  }
}

// 培训标题和状态
.training-header {
  background: $white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .training-title {
    font-size: 18px;
    font-weight: bold;
    color: $text-primary;
    margin: 0;
    flex: 1;
    line-height: 1.4;
  }

  .status-badge {
    background: #e8f5e8;
    color: $success-color;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-left: 12px;
    flex-shrink: 0;
  }
}

// 视频播放器
.video-player-container {
  width: 100%;
  background: #000;
  
  .video-element {
    width: 100%;
    height: 200px;
    background: #000;
    border-radius: 8px;
  }
  

}

// 培训封面
.training-cover {
  position: relative;
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }
  }
}

// 积分和截止时间
.points-deadline {
  background: $white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .points {
    font-size: 18px;
    font-weight: bold;
    color: $primary-color;
  }

  .deadline {
    font-size: 14px;
    color: $text-primary;

    .deadline-label {
      color: $text-secondary;
    }

    .deadline-value {
      color: $text-primary;
      margin-left: 4px;
    }
  }
}

// 观看进度
.watch-progress {
  background: $white;
  margin: 8px 0;
  padding:0 16px;
  
  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .progress-label {
      font-size: 14px;
      color: $text-secondary;
    }
    
    .progress-value {
      font-size: 14px;
      color: $primary-color;
      font-weight: 500;
    }
  }
  
  .progress-bar {
    width: 100%;
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: $primary-color;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
  }
}

// 培训详情
.training-info {
  background: $white;
  margin: 8px 0;
  padding:0 16px 16px 16px;

  .info-item {
    display: flex;
    margin-bottom: 12px;
    font-size: 14px;

    .info-label {
      color: $text-secondary;
      width: 80px;
      flex-shrink: 0;
    }

    .info-value {
      color: $text-primary;
      flex: 1;
    }
  }

  .info-section {
    margin-top: 16px;

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: $text-primary;
      margin-bottom: 8px;
    }

    .section-content {
      font-size: 14px;
      color: $text-secondary;
      line-height: 1.6;
    }
  }
}

// 操作区域
.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $white;
  padding: 16px;
  border-top: 1px solid $border-color;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 16px;
}

// 积分显示
.points-display {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  .points-value {
    font-size: 20px;
    font-weight: bold;
    color: $primary-color;
    line-height: 1;
  }
  
  .points-label {
    font-size: 16px;
    color: $text-secondary;
    margin-top: 2px;
  }
}

// 开始学习按钮
.action-button {
  flex: 1;

  :deep(.van-button--primary) {
    background: $primary-color;
    border-color: $primary-color;
    height: 44px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 6px;

    &:disabled {
      background: #f0f0f0;
      border-color: #f0f0f0;
      color: $text-tertiary;
    }
  }
}

#videoPlayer {
  width: 100%;
  height: 170px;
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
</style>
