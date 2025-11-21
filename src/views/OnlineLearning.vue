<template>
  <div class="online-learning">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <van-nav-bar title="在线学习" left-arrow @click-left="onBack">
        <template #right>
          <van-icon name="home-o" size="18" @click="onGoHome" />
        </template>
      </van-nav-bar>
    </div>

    <!-- 视频播放器区域 -->
    <div class="video-container" @click="onVideoClick">
      <div class="video-player">
        <!-- 视频封面/占位图 -->
        <div class="video-cover" v-if="!isPlaying">
          <img :src="training.thumbnail" :alt="training.title" />
          <div class="play-overlay" v-if="!showPauseConfirm">
            <div class="play-button">
              <van-icon name="play" size="40" color="white" />
            </div>
          </div>
        </div>

        <!-- 视频元素 -->
        <video 
          ref="videoRef"
          v-if="isPlaying"
          :src="videoUrl"
          @timeupdate="onTimeUpdate"
          @ended="onVideoEnded"
          @pause="onVideoPause"
          @play="onVideoPlay"
          controls
          preload="metadata"
        >
          您的浏览器不支持视频播放
        </video>

        <!-- 暂停确认提示 -->
        <div v-if="showPauseConfirm" class="pause-overlay">
          <div class="pause-message">
            <div class="message-text">请点击屏幕,以确认继续播放</div>
          </div>
        </div>

        <!-- 积分获得提示 -->
        <div v-if="showPointsEarned" class="points-overlay">
          <div class="points-message">
            <div class="message-text">恭喜您获得{{ earnedPoints }}积分</div>
          </div>
        </div>
       </div>
     </div>

    <!-- 学习信息 -->
    <div class="learning-info">
      <div class="info-item">
        <span class="info-label">培训标题:</span>
        <span class="info-value">{{ training.title }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">总时长:</span>
        <span class="info-value">{{ formatTime(duration) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">已播放:</span>
        <span class="info-value">{{ formatTime(totalPlayedTime) }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">可获得积分:</span>
        <span class="info-value">{{ training.points }}积分</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const route = useRoute()

// 视频引用
const videoRef = ref(null)

// 培训数据
const training = ref({
  id: 1,
  title: '培训标题施工安全教育',
  points: 100,
  duration: 1800, // 30分钟，单位：秒
  thumbnail: 'https://fastly.jsdelivr.net/npm/@vant/assets/mountain.jpeg'
})

// 视频状态
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(1800) // 30分钟
const totalPlayedTime = ref(0) // 总播放时间
const lastRecordedTime = ref(0) // 上次记录的时间
const showPauseConfirm = ref(false)
const showPointsEarned = ref(false)
const earnedPoints = ref(0)

// 定时器
let pauseTimer = null
let pointsTimer = null
let autoPauseTimer = null

// 视频URL（模拟）
const videoUrl = ref('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')


// 模拟培训数据
const trainingList = {
  1: {
    id: 1,
    title: '培训标题施工安全教育',
    points: 100,
    duration: 1800, // 30分钟
    thumbnail: 'https://fastly.jsdelivr.net/npm/@vant/assets/mountain.jpeg'
  },
  2: {
    id: 2,
    title: '消防安全培训课程',
    points: 80,
    duration: 2700, // 45分钟
    thumbnail: 'https://fastly.jsdelivr.net/npm/@vant/assets/mountain.jpeg'
  },
  3: {
    id: 3,
    title: '设备操作安全培训',
    points: 120,
    duration: 3600, // 60分钟
    thumbnail: 'https://fastly.jsdelivr.net/npm/@vant/assets/mountain.jpeg'
  }
}

// 根据路由参数获取培训信息
const loadTraining = () => {
  const trainingId = route.params.id
  const trainingData = trainingList[trainingId]
  if (trainingData) {
    training.value = trainingData
    duration.value = trainingData.duration
  }
}

// 格式化时间
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

// 视频点击事件
const onVideoClick = () => {
  if (showPauseConfirm.value) {
    // 确认继续播放
    showPauseConfirm.value = false
    if (videoRef.value) {
      videoRef.value.play()
    }
    return
  }

  // 如果视频还没开始播放，直接开始播放
  if (!isPlaying.value) {
    startVideo()
  }
}

// 开始视频播放
const startVideo = () => {
  isPlaying.value = true
  showToast('开始播放视频')
  
  // 等待视频元素渲染后开始播放
  setTimeout(() => {
    if (videoRef.value) {
      // 初始化记录时间
      lastRecordedTime.value = 0
      videoRef.value.play().catch(error => {
        console.error('视频播放失败:', error)
        showToast('视频播放失败，请重试')
      })
    }
  }, 100)
  
  // 设置5分钟自动暂停定时器
  setAutoPauseTimer()
  
  // 设置积分提醒定时器（播放到一定时间后）
  setPointsReminderTimer()
}

// 设置自动暂停定时器（每5分钟）
const setAutoPauseTimer = () => {
  if (autoPauseTimer) {
    clearInterval(autoPauseTimer)
  }
  
  autoPauseTimer = setInterval(() => {
    if (isPlaying.value && videoRef.value && !videoRef.value.paused) {
      // 暂停视频
      videoRef.value.pause()
      showPauseConfirm.value = true
      showToast('视频已暂停，点击屏幕继续播放')
    }
  }, 5 * 60 * 1000) // 5分钟
}

// 设置积分提醒定时器
const setPointsReminderTimer = () => {
  if (pointsTimer) {
    clearTimeout(pointsTimer)
  }
  
  // 播放到总时长的30%时提醒获得积分
  const reminderTime = duration.value * 0.3
  pointsTimer = setTimeout(() => {
    if (isPlaying.value) {
      showPointsEarned.value = true
      earnedPoints.value = Math.floor(training.value.points * 0.3) // 获得30%的积分
      
      // 3秒后隐藏积分提醒
      setTimeout(() => {
        showPointsEarned.value = false
      }, 3000)
    }
  }, reminderTime * 1000)
}

// 视频时间更新
const onTimeUpdate = () => {
  if (videoRef.value) {
    const newTime = videoRef.value.currentTime
    currentTime.value = newTime
    
    // 记录总播放时间（累加实际播放的时长）
    if (!videoRef.value.paused) {
      // 计算本次播放的时长增量
      const timeDiff = newTime - lastRecordedTime.value
      if (timeDiff > 0 && timeDiff < 1) { // 防止异常大的时间跳跃
        totalPlayedTime.value += timeDiff
      }
      lastRecordedTime.value = newTime
    }
  }
}


// 视频播放
const onVideoPlay = () => {
  isPlaying.value = true
  // 重置记录时间
  lastRecordedTime.value = videoRef.value ? videoRef.value.currentTime : 0
}

// 视频暂停
const onVideoPause = () => {
  isPlaying.value = false
  // 暂停时记录当前时间
  if (videoRef.value) {
    lastRecordedTime.value = videoRef.value.currentTime
  }
}

// 视频结束
const onVideoEnded = () => {
  isPlaying.value = false
  totalPlayedTime.value = duration.value
  showSuccessToast('视频播放完成！')
  
  // 清除定时器
  clearTimers()
}

// 清除所有定时器
const clearTimers = () => {
  if (autoPauseTimer) {
    clearInterval(autoPauseTimer)
    autoPauseTimer = null
  }
  if (pointsTimer) {
    clearTimeout(pointsTimer)
    pointsTimer = null
  }
}

// 返回上一页
const onBack = () => {
  // 清除定时器
  clearTimers()
  router.back()
}

// 返回主页
const onGoHome = () => {
  // 清除定时器
  clearTimers()
  router.push('/')
}


// 页面加载时获取培训信息
onMounted(() => {
  loadTraining()
})

// 页面卸载时清除定时器
onUnmounted(() => {
  clearTimers()
})
</script>

<style lang="scss" scoped>

.online-learning {
  min-height: 100vh;
  background: $white;
  padding-top: 60px; // 为固定标题栏留出空间
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

// 视频容器
.video-container {
  background: $white;
  padding: 16px;
  margin-bottom: 8px;
}

.video-player {
  position: relative;
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;

  .video-cover {
    width: 100%;
    height: 100%;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;

      .play-button {
        width: 60px;
        height: 60px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;

        &:hover {
          background: rgba(0, 0, 0, 0.8);
        }
      }
    }
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pause-overlay,
  .points-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    padding: 16px;
    text-align: center;

    .message-text {
      color: $white;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .points-overlay {
    background: rgba(7, 193, 96, 0.9); // 绿色背景
  }
}


// 学习信息
.learning-info {
  background: $white;
  margin: 8px 0;
  padding: 16px;

  .info-item {
    display: flex;
    margin-bottom: 12px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      color: $text-secondary;
      width: 100px;
      flex-shrink: 0;
    }

    .info-value {
      color: $text-primary;
      flex: 1;
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

</style>
