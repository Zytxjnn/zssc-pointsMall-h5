<template>
  <div class="hazard-detail">
    <div class="header-section">
      <xjnn-nav-bar title="隐患详情" class="page-header" style="background-color: transparent;" />
      <div class="page-title"> 
          <div class="type-title"> {{ hazardDetail.riskRegisterTypeName }} </div>
          <div class="level" :class="getStatusClass(hazardDetail.riskStatus)"> {{ hazardDetail.riskStatusName }} </div>
      </div>
    </div>

    <div class="content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <van-loading type="spinner" size="24px">加载中...</van-loading>
      </div>
      
      <!-- 隐患信息（组件化） -->
      <HazardInfoCard v-else :info="hazardDetail" :status="hazardDetail.riskStatus" />

      <!-- 下一步处理人 - 审核通过时不显示 -->
      <div v-if="hazardDetail.riskStatus !== 2" class="section">
        <div class="section-header">
          <div class="section-title">下一步处理人</div>
        </div>
        
        <div class="info-list">
          <div class="info-item">
            <span class="label">待整改人：</span>
            <span class="value">{{ hazardDetail.actionOwnerName }}</span>
          </div>
          <div class="info-item">
            <span class="label">待复核人：</span>
            <span class="value">{{ hazardDetail.approverName }}</span>
          </div>
        </div>
      </div>

      <!-- 整改和复核记录 -->
      <div v-if="hazardDetail.riskWorkFlows && hazardDetail.riskWorkFlows.length > 0" class="workflow-section">
        <div 
          v-for="(workflow, index) in hazardDetail.riskWorkFlows" 
          :key="index"
          class="workflow-item"
        >
          <!-- 整改信息 -->
          <div v-if="workflow.actionDescription || workflow.actionOwnerName || workflow.actionTime" class="workflow-card rectification-card">
            <div class="card-header">
              <div class="card-title">
                {{ getRectificationTitle(index) }}
              </div>
            </div>
            <div class="card-content">
              <div v-if="workflow.actionOwnerName" class="info-item">
                <span class="label">整改人：</span>
                <span class="value">{{ workflow.actionOwnerName }}</span>
              </div>
              <div v-if="workflow.actionTime" class="info-item">
                <span class="label">整改时间：</span>
                <span class="value">{{ workflow.actionTime }}</span>
              </div>
              <div v-if="workflow.riskActionFiles && workflow.riskActionFiles.length > 0" class="info-item">
                <span class="label">隐患图片：</span>
                <div class="image-list">
                  <div 
                    v-for="(file, fileIndex) in workflow.riskActionFiles" 
                    :key="fileIndex"
                    class="image-item"
                    @click="previewImage(workflow.riskActionFiles, fileIndex)"
                  >
                    <van-image
                      :src="file.filePath"
                      fit="cover"
                      class="workflow-image"
                    />
                    <div class="image-overlay">点击预览</div>
                  </div>
                </div>
              </div>
              <div v-if="workflow.actionDescription" class="info-item">
                <span class="label">整改描述：</span>
                <span class="value">{{ workflow.actionDescription }}</span>
              </div>
            </div>
          </div>

          <!-- 复核信息 -->
          <div v-if="workflow.auditDescription || workflow.approverName || workflow.auditTime" class="workflow-card review-card">
            <div class="card-header">
              <div class="card-title">
                {{ getReviewTitle(index) }}
              </div>
            </div>
            <div class="card-content">
              <div v-if="workflow.approverName" class="info-item">
                <span class="label">复核人：</span>
                <span class="value">{{ workflow.approverName }}</span>
              </div>
              <div v-if="workflow.auditTime" class="info-item">
                <span class="label">复核时间：</span>
                <span class="value">{{ workflow.auditTime }}</span>
              </div>
              <div v-if="workflow.auditDescription" class="info-item">
                <span class="label">复核意见：</span>
                <span class="value" :class="{ 'reject-text': isRejected(workflow.auditDescription) }">
                  {{ workflow.auditDescription }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div v-if="showActionButtons" class="action-buttons">
      <van-button 
        class="cancel-btn" 
        @click="onCancel"
      >
        {{ actionButtonConfig.cancelText }}
      </van-button>
      <van-button 
        :type="actionButtonConfig.submitType" 
        class="submit-btn"
        @click="onSubmit"
      >
        {{ actionButtonConfig.submitText }}
      </van-button>
    </div>

    <!-- 驳回弹窗 -->
    <van-popup
      v-model:show="showRejectDialog"
      position="center"
      round
      :style="{ width: '320px', padding: '0' }"
    >
      <div class="reject-dialog">
        <div class="dialog-title">审核不通过</div>
        <div class="dialog-content">
          <van-field
            v-model="rejectReason"
            type="textarea"
            placeholder="审核不通过时，原因为必填"
            autosize
            maxlength="200"
            show-word-limit
            class="reason-field"
          />
        </div>
        <div class="dialog-actions">
          <van-button 
            class="cancel-btn" 
            @click="showRejectDialog = false"
          >
            取消
          </van-button>
          <van-button 
            type="primary" 
            class="confirm-btn"
            @click="onConfirmReject"
          >
            确定
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 图片预览 -->
    <van-image-preview
      v-model:show="showImagePreview"
      :images="previewImages"
      :start-position="previewIndex"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import HazardInfoCard from '@/components/HazardInfoCard.vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { riskApi } from '@/api'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()

// 加载状态
const loading = ref(false)

// 驳回弹窗相关
const showRejectDialog = ref(false)
const rejectReason = ref('')

// 图片预览相关
const showImagePreview = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)

// 用户 store
const userStore = useUserStore()

// 当前用户信息
const currentUser = computed(() => userStore.userInfo.userId || userStore.userInfo.id)

// 隐患详情数据（与API字段名一致）
const hazardDetail = reactive({
  id: '',
  code: '',
  reporterName: '',
  reporterCompanyName: '',
  reportTime: '',
  inspectionArea: '',
  riskRegisterTypeName: '',
  riskRegisterName: '',
  riskLevel: 0,
  riskLevelName: '',
  actionsRequired: '',
  rectificationDeadline: '',
  riskStatus: 0,
  riskStatusName: '',
  actionOwnerName: '',
  actionOwnerId: '',
  approverName: '',
  approverId: '',
  riskReportFiles: [],
  riskWorkFlows: []
})

// 获取隐患详情
const loadHazardDetail = async () => {
  try {
    loading.value = true
    const id = route.params.id
    
    if (!id) {
      showToast('缺少隐患ID')
      router.back()
      return
    }
    
    const data = await riskApi.getRiskDetail({ id })
    
    // 映射API数据到本地数据结构（保持字段名一致）
    Object.assign(hazardDetail, {
      id: data.id || '',
      code: data.code || '',
      reporterName: data.reporterName || '',
      reporterCompanyName: data.reporterCompanyName || '',
      reportTime: data.reportTime || '',
      inspectionArea: data.inspectionArea || '',
      riskRegisterTypeName: data.riskRegisterTypeName || '',
      riskRegisterName: data.riskRegisterName || '',
      riskLevel: data.riskLevel || 0,
      riskLevelName: data.riskLevelName || '',
      actionsRequired: data.actionsRequired || '',
      rectificationDeadline: data.rectificationDeadline || '',
      riskStatus: data.riskStatus || 0,
      riskStatusName: data.riskStatusName || '',
      actionOwnerName: data.actionOwnerName || '',
      actionOwnerId: data.actionOwnerId || '',
      approverName: data.approverName || '',
      approverId: data.approverId || '',
      riskReportFiles: data.riskReportFiles || [],
      riskWorkFlows: data.riskWorkFlows || []
    })
  } catch (error) {
    console.error('获取隐患详情失败:', error)
    showToast('获取隐患详情失败')
  } finally {
    loading.value = false
  }
}

// 获取状态对应的CSS类名（直接使用API返回的0,1,2状态值）
const getStatusClass = (riskStatus) => {
  const statusClassMap = {
    0: 'status-pending',    // 待整改
    1: 'status-reviewing',  // 待审批
    2: 'status-approved'    // 审批通过
  }
  return statusClassMap[riskStatus] || 'status-pending'
}

// 是否显示操作按钮（根据状态和用户角色显示）
const showActionButtons = computed(() => {
  const userId = currentUser.value
  if (!userId) return false
  
  // 待整改状态：只有待整改人是自己才显示
  if (hazardDetail.riskStatus === 0 && hazardDetail.actionOwnerId === userId) {
    return true
  }
  // 待审批状态：只有审批人是自己才显示
  if (hazardDetail.riskStatus === 1 && hazardDetail.approverId === userId) {
    return true
  }
  return false
})

// 获取操作按钮的文本和类型
const actionButtonConfig = computed(() => {
  if (hazardDetail.riskStatus === 0) {
    return {
      cancelText: '取消',
      submitText: '上传整改成果',
      submitType: 'primary'
    }
  }
  if (hazardDetail.riskStatus === 1) {
    return {
      cancelText: '驳回',
      submitText: '审批通过',
      submitType: 'success'
    }
  }
  return {
    cancelText: '取消',
    submitText: '确认',
    submitType: 'primary'
  }
})

// 获取完整的隐患信息（包含更多API字段）
const fullHazardInfo = computed(() => {
  return {
    ...hazardDetail,
    // 添加更多API字段的访问
    hasImages: hazardDetail.riskReportFiles && hazardDetail.riskReportFiles.length > 0,
    hasWorkFlows: hazardDetail.riskWorkFlows && hazardDetail.riskWorkFlows.length > 0
  }
})

// 取消操作
const onCancel = () => {
  if (hazardDetail.riskStatus === 0) {
    showToast('已取消')
  } else if (hazardDetail.riskStatus === 1) {
    // 显示驳回弹窗
    showRejectDialog.value = true
    rejectReason.value = ''
  }
}

// 确认驳回
const onConfirmReject = async () => {
  try {
    // 调用审核API - 审核不通过
    await riskApi.doAudit({
      riskId: hazardDetail.id,
      auditDescription: rejectReason.value.trim(),
      isPass: false
    })
    
    showToast('审核不通过')
    showRejectDialog.value = false
    
    // 重新加载隐患详情
    await loadHazardDetail()
    
  } catch (error) {
    console.error('审核失败:', error)
    showToast('审核失败，请重试')
  }
}

// 提交操作
const onSubmit = async () => {
  if (hazardDetail.riskStatus === 0) {
    // 待整改状态：跳转到上传整改成果页面
    router.push(`/rectification-report/${hazardDetail.id}`)
  } else if (hazardDetail.riskStatus === 1) {
    // 待审批状态：审批通过
    try {
      // 调用审核API - 审核通过
      await riskApi.doAudit({
        riskId: hazardDetail.id,
        auditDescription: '', // 审核通过不需要原因
        isPass: true
      })
      
      showToast('审批通过')
      
      // 重新加载隐患详情
      await loadHazardDetail()
      
    } catch (error) {
      console.error('审核失败:', error)
      showToast('审核失败，请重试')
    }
  }
}

// 计算实际的整改记录数量（有整改信息的workflow数量）
const rectificationCount = computed(() => {
  return hazardDetail.riskWorkFlows.filter(workflow => 
    workflow.actionDescription || workflow.actionOwnerName || workflow.actionTime
  ).length
})

// 计算实际的复核记录数量（有复核信息的workflow数量）
const reviewCount = computed(() => {
  return hazardDetail.riskWorkFlows.filter(workflow => 
    workflow.auditDescription || workflow.approverName || workflow.auditTime
  ).length
})

// 获取整改标题
const getRectificationTitle = (index) => {
  // 如果只有一次整改记录，直接显示"整改信息"
  if (rectificationCount.value === 1) {
    return '整改信息'
  }
  
  // 如果有多次，第一次显示"整改信息"，第二次及以后显示"二次整改信息"等
  const rectificationIndex = getRectificationIndex(index)
  if (rectificationIndex === 0) {
    return '整改信息'
  }
  
  const numbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  const number = numbers[rectificationIndex + 1] || (rectificationIndex + 1)
  return `${number}次整改信息`
}

// 获取复核标题
const getReviewTitle = (index) => {
  // 如果只有一次复核记录，直接显示"复核信息"
  if (reviewCount.value === 1) {
    return '复核信息'
  }
  
  // 如果有多次，第一次显示"复核信息"，第二次及以后显示"二次复核信息"等
  const reviewIndex = getReviewIndex(index)
  if (reviewIndex === 0) {
    return '复核信息'
  }
  
  const numbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  const number = numbers[reviewIndex + 1] || (reviewIndex + 1)
  return `${number}次复核信息`
}

// 获取当前workflow在整改记录中的实际索引
const getRectificationIndex = (workflowIndex) => {
  let count = 0
  for (let i = 0; i <= workflowIndex; i++) {
    const workflow = hazardDetail.riskWorkFlows[i]
    if (workflow && (workflow.actionDescription || workflow.actionOwnerName || workflow.actionTime)) {
      if (i === workflowIndex) {
        return count
      }
      count++
    }
  }
  return count
}

// 获取当前workflow在复核记录中的实际索引
const getReviewIndex = (workflowIndex) => {
  let count = 0
  for (let i = 0; i <= workflowIndex; i++) {
    const workflow = hazardDetail.riskWorkFlows[i]
    if (workflow && (workflow.auditDescription || workflow.approverName || workflow.auditTime)) {
      if (i === workflowIndex) {
        return count
      }
      count++
    }
  }
  return count
}

// 判断是否为驳回
const isRejected = (auditDescription) => {
  return auditDescription && auditDescription.includes('不通过')
}

// 预览图片
const previewImage = (files, fileIndex) => {
  previewImages.value = files.map(file => file.filePath)
  previewIndex.value = fileIndex
  showImagePreview.value = true
}

// 初始化
onMounted(() => {
  loadHazardDetail()
})
</script>

<style lang="scss" scoped>

:deep(.van-toast) {
  background: rgba(0, 0, 0, 0.8);
}

.header-section {
  position: sticky;
  top: 0;
  z-index: 100;
  background-image: url('/images/header-bg.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  color: $white;
}

.page-header {
  color: $white;
}

.page-title {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  align-items: center;
  color: $white;
  font-size: 16px;
  font-weight: 500;
  
  .level {
    padding: 2px 8px;
    border-radius: 2px;
    font-size: 12px;
    font-weight: 500;
    margin-left: 8px;
    
    &.status-pending {
      background: #FFF3EF;
      color: #D9402B;
    }
    
    &.status-reviewing {
      background: #FFFAF0;
      color: #FF9500;
    }
    
    &.status-approved {
      background: #ECF7EC;
      color: #32953D;
    }
  }
}

.hazard-detail {
  min-height: 100vh;
  background-color: $bg-color-light;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.content {
  padding-bottom: 80px; // 为底部按钮留出空间
}

.section {
  background: #fff;
  margin-bottom: 16px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid $border-color-light;
  position: relative;
  

}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: $text-color-primary;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  &.pending {
    background: #FFF3EF;
    color: #D9402B;
  }
  
  &.reviewing {
    background: #FFFAF0;
    color: #FF9500;
  }
  
  &.approved {
    background: #ECF7EC;
    color: #32953D;
  }
}

.info-list {
  padding: 16px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  font-size: 14px;
  color: $text-color-secondary;
  min-width: 80px;
  flex-shrink: 0;
}

.value {
  font-size: 14px;
  color: $text-color-primary;
  flex: 1;
  word-break: break-all;
}

.image-list {
  padding: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: $border-radius;
  overflow: hidden;
  cursor: pointer;
}

.hazard-image {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  text-align: center;
  padding: 4px;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 16px;
  display: flex;
  gap: 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  flex: 1;
  height: 44px;
  background: $bg-color-light;
  color: $text-color-primary;
  border: none;
  border-radius: $border-radius;
}

.submit-btn {
  flex: 2;
  height: 44px;
  border-radius: $border-radius;
  background: $primary-color;
  border-color: $primary-color;
}

// 驳回弹窗样式
.reject-dialog {
  background: #ffffff;

  .dialog-title {
    padding: 20px 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: #D9402B;
    text-align: center;
  }

  .dialog-content {
    padding: 20px;

    .reason-field {
      border-radius: 8px;
      background: #F7F8FA;

      :deep(.van-field__control) {
        min-height: 100px;
        font-size: 14px;
        line-height: 1.5;
      }
      
      :deep(.van-field__placeholder) {
        color: #999;
        font-size: 14px;
      }
      
      :deep(.van-field__word-limit) {
        color: $text-color-secondary;
        font-size: 12px;
      }
    }
  }

  .dialog-actions {
    display: flex;
    border-top: 1px solid #eee;
    font-weight: 500;
    
    .cancel-btn {
      flex: 1;
      height: 50px;
      background: #fff;
      color: $text-color-primary;
      border: none;
      border-radius: 0;
      font-size: 16px;
    }
    
    .confirm-btn {
      flex: 1;
      height: 50px;
      color: $primary-color;
      background: #fff !important;
      border: none;
      border-radius: 0;
      font-size: 16px;
    }
  }
}

// 整改和复核记录样式
.workflow-section {
  .workflow-item {
    margin-bottom: 16px;
  }
  
  .workflow-card {
    background: #fff;
    margin-bottom: 12px;
    overflow: hidden;
    
    .card-header {
      position: relative;
      padding: 12px 16px;
      
      .card-title {
        font-size: 16px;
        color: $text-color-primary;
        position: relative;
        
      }
    }
    
    .card-content {
      padding: 0 16px 16px;
      
      .info-item {
        margin-bottom: 12px;
        display: flex;
        align-items: flex-start;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: $text-color-secondary;
          font-size: 14px;
          min-width: 80px;
          flex-shrink: 0;
        }
        
        .value {
          color: $text-color-primary;
          font-size: 14px;
          flex: 1;
          
          &.reject-text {
            color: #D9402B;
          }
        }
        
        .image-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          flex: 1;
          
          .image-item {
            position: relative;
            width: 80px;
            height: 80px;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            
            .workflow-image {
              width: 100%;
              height: 100%;
            }
            
            .image-overlay {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              background: rgba(0, 0, 0, 0.6);
              color: #fff;
              font-size: 12px;
              text-align: center;
              padding: 4px;
            }
          }
        }
      }
    }
  }
  

}
</style>