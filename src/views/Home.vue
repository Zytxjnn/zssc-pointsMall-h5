<template>
  <div class="home">
    <!-- 应用标题栏 -->
    <div class="app-header">
      <h1 class="app-title">云积分超市</h1>
    </div>

    <!-- 功能图标区域 -->
    <div class="function-icons">
      <div class="icon-item" @click="onFunctionClick('hazard')">
        <van-image src="/images/home/hazardReport.png"/>
        <span class="icon-text">隐患上报</span>
      </div>
      <div class="icon-item" @click="onFunctionClick('quiz')">
        <van-image src="/images/home/study.png" />
        <span class="icon-text">答题中心</span>
      </div>
      <div class="icon-item" @click="onFunctionClick('learning')">
        <van-image src="/images/home/quizCenter.png" />
        <span class="icon-text">学习平台</span>
      </div>
      <div class="icon-item" @click="onFunctionClick('ledger')">
        <van-image src="/images/home/hazardList.png" />
        <span class="icon-text">隐患台账</span>
      </div>
    </div>

    <!-- 扫一扫区域 -->
    <div class="scan-section" @click="onScanClick">
      <div class="scan-content">
        <van-image src="/images/home/scan.png" />
        <div class="scan-info">
          <div class="scan-title">
            <span class="scan-title-text">扫一扫</span>
            <van-image src="/images/home/arrowRight.png" />
          </div>
          <div class="scan-desc">扫货柜货柜二维码，积分码上兑</div>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="tab-section">
      <van-tabs v-model:active="activeTab" @change="onTabChange">
        <van-tab title="积分信息" name="points">
          <div class="tab-content">
            <div class="points-list">
              <div class="points-item" v-for="item in pointsList" :key="item.id">
                <div class="points-info">
                  <div class="points-name">{{ item.laborerName }}</div>
                  <div class="points-desc"> 完成了《{{ item.description }} {{ item.scoreName }}》</div>
                </div>
                <div class="points-date">{{ item.completionTime }}</div>
              </div>
            </div>
          </div>
        </van-tab>
        <van-tab :title="`待我处理 (${pendingCount})`" name="pending">
          <div class="tab-content">
            <div class="pending-section">
              <div class="pending-tabs">
                <div
                  class="pending-tab" 
                  :class="{ active: activePendingTab === 'rectify' }"
                  @click="activePendingTab = 'rectify'"
                >
                  待我整改的({{ actionList.length }})
                </div>
                <div 
                  class="pending-tab" 
                  :class="{ active: activePendingTab === 'review' }"
                  @click="activePendingTab = 'review'"
                >
                  待我复核的({{ approvalList.length }})
                </div>
              </div>
              
              <!-- 待我整改列表 -->
              <div v-if="activePendingTab === 'rectify'" class="scrollable-content">
                <div 
                  class="hazard-card" 
                  v-for="item in actionList" 
                  :key="item.id"
                  @click="onActionItemClick(item)"
                >
                  <!-- 顶部：等级标签 + 类型 + 状态徽标 -->
                  <div class="pending-head">
                    <div class="left">
                      <span class="level-badge" :class="'lv-' + (item.riskLevel || 0)">{{ item.riskLevelName }}</span>
                      <div class="type-title">
                        {{ item.riskRegisterTypeName }}
                        <van-icon name="arrow" size="12" />
                      </div>
                    </div>
                    <div class="status-badge">{{ item.riskStatusName }}</div>
                  </div>

                  <!-- 信息块 -->
                  <div class="pending-info">
                    <div class="row">
                      <div class="cell"><span class="label">上报时间</span><span class="value">{{ item.reportTime }}</span></div>
                      <div class="cell"><span class="label">上报人</span><span class="value">{{ item.reporterName }}</span></div>
                    </div>
                    <div class="row">
                      <div class="cell full">
                        <span class="label">隐患内容</span><span class="value">{{ item.riskRegisterName }}</span>
                      </div>
                    </div>
                    <div class="row">
                      <div class="cell"><span class="label">整改期限</span><span class="value">{{ item.rectificationDeadline }}</span></div>
                      
                    </div>
                    <div class="row">
                      <div class="cell"><span class="label">待整改人</span><span class="value">{{ item.actionOwnerName }}</span></div>
                      <div class="cell"><span class="label">待复核人</span><span class="value">{{ item.approverName }}</span></div>
                    </div>
                  </div>
                </div>
                
                <!-- 无数据时显示 -->
                <div v-if="actionList.length === 0" class="empty-state">
                  <div class="empty-text">暂无待整改项目</div>
                </div>
              </div>
              
              <!-- 待我复核列表 -->
              <div v-if="activePendingTab === 'review'" class="scrollable-content">
                <div 
                  class="hazard-card" 
                  v-for="item in approvalList" 
                  :key="item.id"
                  @click="onApprovalItemClick(item)"
                >
                  <!-- 顶部：等级标签 + 类型 + 状态徽标 -->
                  <div class="pending-head">
                    <div class="left">
                      <span class="level-badge" :class="'lv-' + (item.riskLevel || 0)">{{ item.riskLevelName }}</span>
                      <div class="type-title">
                        {{ item.riskRegisterTypeName }}
                        <van-icon name="arrow" size="12" />
                      </div>
                    </div>
                    <div class="status-badge">{{ item.riskStatusName }}</div>
                  </div>

                  <!-- 信息块 -->
                  <div class="pending-info">
                    <div class="row">
                      <div class="cell"><span class="label">上报时间</span><span class="value">{{ item.reportTime }}</span></div>
                      <div class="cell"><span class="label">上报人</span><span class="value">{{ item.reporterName }}</span></div>
                    </div>
                    <div class="row">
                      <div class="cell full">
                        <span class="label">隐患内容</span><span class="value">{{ item.riskRegisterName }}</span>
                      </div>
                    </div>
                    <div class="row">
                      <div class="cell"><span class="label">整改期限</span><span class="value">{{ item.rectificationDeadline }}</span></div>
                      
                    </div>
                    <div class="row">
                      <div class="cell"><span class="label">待整改人</span><span class="value">{{ item.actionOwnerName }}</span></div>
                      <div class="cell"><span class="label">待复核人</span><span class="value">{{ item.approverName }}</span></div>
                    </div>
                  </div>
                </div>
                
                <!-- 无数据时显示 -->
                <div v-if="approvalList.length === 0" class="empty-state">
                  <div class="empty-text">暂无待复核项目</div>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 底部导航 -->
    <TabBar style="height: 0;" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import TabBar from '@/components/TabBar.vue'
import { homeApi } from '@/api'
import { useUserStore } from '@/stores/user'
import jsQR from 'jsqr'

const router = useRouter()
const userStore = useUserStore()
const laborerStatus = computed(() => userStore.userInfo?.laborerStatus ?? 1)

// 标签页状态
const activeTab = ref('points')
const activePendingTab = ref('rectify')

// 积分列表数据
const pointsList = ref([])

// 待我整改的数据
const actionList = ref([]);

// 待我复核的数据
const approvalList = ref([]);

// 待我处理的总数
const pendingCount = computed(() => actionList.value.length + approvalList.value.length)

  // 功能图标点击
  const onFunctionClick = (type) => {
    const functionNames = {
      hazard: '隐患上报',
      quiz: '答题中心',
      learning: '学习平台',
      ledger: '隐患台账'
    }
    
    // 隐患上报跳转
    if (type === 'hazard') {
      if (laborerStatus.value === 0) {
        showToast('账号待审核，请联系管理员')
        return
      }
      router.push('/hazard-report')
      return
    }

    // 隐患台账跳转
    if (type === 'ledger') {
      router.push('/hazard-ledger')
      return
    }
    
    // 学习平台跳转
    if (type === 'learning') {
      router.push('/learning-platform')
      return
    }
    
    // 答题中心跳转
    if (type === 'quiz') {
      router.push('/quiz-center')
      return
    }
    
    showToast(`点击了${functionNames[type]}`)
  }

  // 点击待整改项目
  const onActionItemClick = (item) => {
    // 跳转到隐患详情页，传递项目ID
    router.push(`/hazard-detail/${item.id}`)
  }

  // 点击待复核项目
  const onApprovalItemClick = (item) => {
    // 跳转到隐患详情页，传递项目ID
    router.push(`/hazard-detail/${item.id}`)
  }

// 处理扫码结果
const handleScanResult = (result) => {
  console.log('扫码结果:', result)
  
  if (!result) {
    showToast('扫码结果为空')
    return
  }
  
  // 判断是否是绝对URL
  if (result.startsWith('http://') || result.startsWith('https://')) {
    showToast('识别成功，正在跳转...')
    // 跳转到绝对URL
    window.location.href = result
  } else {
    // 如果不是URL，可能是其他数据
    showToast('扫码成功')
    console.log('扫码数据:', result)
  }
}

// 扫一扫点击
const onScanClick = () => {
  // 检查是否有原生APP的扫码方法
  if (window.native && typeof window.native.scanQRCode === 'function') {
    // 使用原生APP扫码
    window.native.scanQRCode((result) => {
      handleScanResult(result)
    })
    return
  }
  
  // 浏览器环境，使用文件上传模拟
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.capture = 'environment' // 使用后置摄像头
  
  input.onchange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      showToast('正在识别二维码...')
      
      try {
        console.log('选择的文件:', file.name, file.size, file.type)
        
        // 读取图片文件
        const imageUrl = URL.createObjectURL(file)
        const image = new Image()
        
        image.onload = () => {
          console.log('图片加载成功，尺寸:', image.width, 'x', image.height)
          
          // 移动端优化：直接缩放到合适尺寸，避免处理大图片
          const maxSize = 600 // 降低最大尺寸，提高移动端性能
          let targetWidth = image.width
          let targetHeight = image.height
          
          // 如果图片过大，先计算合适的缩放尺寸
          if (image.width > maxSize || image.height > maxSize) {
            const ratio = Math.min(maxSize / image.width, maxSize / image.height)
            targetWidth = Math.floor(image.width * ratio)
            targetHeight = Math.floor(image.height * ratio)
            console.log('图片过大，缩放至:', targetWidth, 'x', targetHeight)
          }
          
          // 创建canvas
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // 设置canvas尺寸
          canvas.width = targetWidth
          canvas.height = targetHeight
          
          console.log('Canvas尺寸:', canvas.width, 'x', canvas.height)
          
          // 使用高质量缩放绘制图片
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
          
          // 获取图片数据
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          console.log('图片数据长度:', imageData.data.length)
          
          // 优化解析策略：移动端只尝试一次解析，减少计算量
          let finalCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth" // 一次性尝试所有反转选项
          })
          
          // 如果第一次失败，且是移动端，再尝试一次不反转
          if (!finalCode) {
            console.log('第一次解析失败，尝试不反转模式')
            finalCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert"
            })
          }
          
          // 释放内存
          URL.revokeObjectURL(imageUrl)
          
          if (finalCode) {
            // 解析成功
            console.log('二维码解析成功:', finalCode.data)
            handleScanResult(finalCode.data)
          } else {
            // 解析失败
            console.log('二维码解析失败，可能是图片质量问题')
            showToast('未识别到二维码，请重试')
          }
        }
        
        image.onerror = (error) => {
          console.error('图片加载失败:', error)
          URL.revokeObjectURL(imageUrl)
          showToast('图片加载失败')
        }
        
        // 设置跨域属性（如果需要）
        image.crossOrigin = 'anonymous'
        image.src = imageUrl
      } catch (error) {
        console.error('二维码识别过程出错:', error)
        showToast('二维码识别失败')
      }
    }
  }
  
  input.click()
}

// 标签页切换
const onTabChange = (name) => {
  activeTab.value = name
}
  
onMounted(async () => {
  // 页面加载完成后的逻辑
  pointsList.value = await homeApi.getScoreList();
  actionList.value = await homeApi.getActionList();
  approvalList.value = await homeApi.getApprovalList();
  
  // 调试信息
  console.log('actionList数据:', actionList.value)
  console.log('approvalList数据:', approvalList.value)
})
</script>

<style lang="scss" scoped>

  .home {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  // 应用标题栏
  .app-header {
    background: $primary-color;
    padding: 12px 0;
    text-align: center;
    z-index: 1000;

    .app-title {
      color: $white;
      font-size: 18px;
      font-weight: 500;
      margin: 0;
    }
  }

// 功能图标区域
.function-icons {
  display: flex;
  justify-content: space-around;
  padding: 20px 16px 50px 16px;
  background: $white;
  margin-bottom: 8px;
  background-color: $primary-color;
  flex-shrink: 0;

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    .van-image {
      width: 42px;
      height: 42px;
    }

    .icon-text {
      margin-top: 8px;
      font-size: 12px;
      color: $white;
    }
  }
}

// 扫一扫区域
.scan-section {
  position: relative;
  top: -40px;
  margin: 0 10px;
  border-radius: 4px;
  
  background: $white;
  margin-bottom: 8px;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;

  &:hover {
    background: $hover-bg;
  }

  &:active {
    background: $active-bg;
  }

  .scan-content {
    display: flex;
    align-items: center;

    .scan-info {
      margin-left: 9px;

      .scan-title {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .scan-title-text {
          font-size: 16px;
          font-style: normal;
          font-weight: 600;
          line-height: 24px;
        }
      }
    }

    .scan-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      margin-right: 12px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .scan-title {
      font-size: 16px;
      font-weight: 500;
      color: $text-primary;
      margin-bottom: 4px;
    }

    .scan-desc {
      align-self: stretch;
      color: #9195a2;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
    }
  }
}

// 标签页区域
.tab-section {
  position: relative;
  top: -30px;
  background: $white;
  margin-bottom: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; // 重要：允许flex子元素收缩

  :deep(.van-tabs) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; // 重要：允许flex子元素收缩
  }

  :deep(.van-tabs__content) {
    flex: 1;
    overflow-y: auto;
    min-height: 0; // 重要：允许flex子元素收缩
  }

  .tab-content {
    padding: 16px;
    height: 100%;
    overflow-y: auto;
  }
}

// 积分列表
.points-list {
  margin-bottom: 16px;

  .points-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid $border-color;

    &:last-child {
      border-bottom: none;
    }

    .points-info {
      flex: 1;

      .points-name {
        font-size: 14px;
        color: $text-primary;
        margin-bottom: 4px;
      }

      .points-desc {
        font-size: 12px;
        color: $text-secondary;
      }
    }

    .points-date {
      font-size: 12px;
      color: $text-tertiary;
      margin-left: 12px;
    }
  }

  .points-note {
    font-size: 12px;
    color: $text-tertiary;
    text-align: center;
    margin-top: 16px;
  }
}

// 待处理区域
.pending-section {
  padding: 0 0;
  height: 100%;
  overflow-y: auto;

  .pending-header {
    font-size: 14px;
    color: $text-primary;
    margin-bottom: 12px;
  }

  .pending-tabs {
    display: flex;
    margin-bottom: 16px;
    flex-shrink: 0;


    .pending-tab {
      padding: 8px 16px;
      background: #F0F2F5;
      border-radius: 100px;
      margin-right: 8px;
      font-size: 12px;
      color: $text-secondary;
      cursor: pointer;

      &.active {
        background: #ECF2FE;
        color: #1961AC;
        font-weight: 600;
      }
    }
  }
}

// 隐患卡片
.hazard-card {
  background: #F9F9FA;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-1px);
  }

  .pending-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    .left { display: flex; align-items: center; gap: 8px; }
    .level-badge { padding: 2px 6px; border-radius: 3px; font-size: 12px; background: #e6f7ff; color: #1890ff; }
    .type-title { color: $text-primary; font-weight: 500; font-size: 14px; display: flex; align-items: center; gap: 4px; }
    .status-badge { background: #fff2e8; color: #fa541c; border-radius: 10px; padding: 2px 8px; font-size: 12px; }
  }

  .pending-info {
    .row {
       display: flex;
       justify-content: space-between;
       margin: 6px 0; 
    }
    .cell {  display: flex; gap: 6px; font-size: 12px; }
    .cell.full { flex: 1 0 100%; }
    .label { color: $text-secondary; white-space: nowrap; }
    .value { color: $text-primary; }
  }

  .hazard-actions { display: none; }
}

// 空状态样式
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  
  .empty-text {
    color: $text-secondary;
    font-size: 14px;
  }
}

// 可滚动内容区域
.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

// Vant组件样式覆盖
:deep(.van-tabs__line) {
  background: $primary-color;
}

:deep(.van-tab--active) {
  color: $primary-color;
}
</style>
