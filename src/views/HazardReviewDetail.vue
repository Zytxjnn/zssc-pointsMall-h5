<template>
  <div class="hazard-review-detail">
    <van-nav-bar
      title="隐患详情"
      left-arrow
      @click-left="onBack"
      fixed
      placeholder
    >
      <template #right>
        <van-icon name="wap-home-o" @click="onGoHome" />
      </template>
    </van-nav-bar>

    <div class="content">
      <HazardInfoCard :info="hazard" :status="hazard.status || 'reviewing'" />

      <!-- 交替展示：一条整改后跟一条复核 -->
      <div class="section" v-for="(entry, idx) in mixedRecords" :key="`mix-${idx}-${entry.type}`">
        <div class="section-header">
          <div class="section-title">
            {{ getTitle(entry) }}
          </div>
        </div>
        <div class="info-list" v-if="entry.type === 'rectify'">
          <div class="info-item">
            <span class="label">整改人：</span>
            <span class="value">{{ entry.data.rectifier }}</span>
          </div>
          <div class="info-item">
            <span class="label">整改时间：</span>
            <span class="value">{{ entry.data.time }}</span>
          </div>
          <div class="info-item">
            <span class="label">隐患图片：</span>
            <div class="image-row">
              <div v-for="(img, p) in entry.data.images" :key="p" class="review-image" @click="openPreview(entry.data.images, p)">
                <van-image :src="img" fit="cover" width="80" height="80" />
              </div>
            </div>
          </div>
          <div class="info-item">
            <span class="label">整改描述：</span>
            <span class="value">{{ entry.data.desc }}</span>
          </div>
        </div>
        <div class="info-list" v-else>
          <div class="info-item">
            <span class="label">复核人：</span>
            <span class="value">{{ entry.data.reviewer }}</span>
          </div>
          <div class="info-item">
            <span class="label">复核时间：</span>
            <span class="value">{{ entry.data.time }}</span>
          </div>
          <div class="info-item">
            <span class="label">复核意见：</span>
            <span class="value">{{ entry.data.opinion }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showActions" class="review-actions">
      <van-button class="reject-btn" @click="openRejectDialog">审核不通过</van-button>
      <van-button type="primary" class="approve-btn" @click="openApproveDialog">审核通过</van-button>
    </div>

    <van-image-preview v-model:show="showPreview" :images="previewImages" :start-position="previewStart" />

    <!-- 审核不通过弹窗 -->
    <van-dialog v-model:show="showReject" :show-cancel-button="true" @confirm="confirmReject" @cancel="cancelReview">
      <template #title>
        <div class="dialog-title danger">审核不通过</div>
      </template>
      <van-field
        v-model="rejectReason"
        type="textarea"
        placeholder="审核不通过时，原因未为必填"
        rows="3"
        autosize
      />
    </van-dialog>

    <!-- 审核通过弹窗 -->
    <van-dialog v-model:show="showApprove" :show-cancel-button="true" @confirm="confirmApprove" @cancel="cancelReview">
      <template #title>
        <div class="dialog-title success">审核通过</div>
      </template>
      <van-field
        v-model="approveRemark"
        type="textarea"
        placeholder="非必填"
        rows="3"
        autosize
      />
    </van-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import HazardInfoCard from '@/components/HazardInfoCard.vue'

const route = useRoute()
const router = useRouter()

const hazard = reactive({
  id: '',
  primaryType: '',
  secondaryType: '',
  content: '',
  level: '',
  requirements: '',
  inspectionPart: '',
  deadline: '',
  images: [],
  status: 'reviewing',
  rectifyRecords: [],
  reviewRecords: []
})

const showPreview = ref(false)
const previewImages = ref([])
const previewStart = ref(0)
const openPreview = (images, start = 0) => {
  previewImages.value = images
  previewStart.value = start
  showPreview.value = true
}

const onBack = () => router.back()
const onGoHome = () => router.push('/')

const showActions = computed(() => hazard.status === 'reviewing')

// 审核弹窗相关
const showReject = ref(false)
const showApprove = ref(false)
const rejectReason = ref('')
const approveRemark = ref('')

const openRejectDialog = () => { showReject.value = true }
const openApproveDialog = () => { showApprove.value = true }
const cancelReview = () => { showReject.value = false; showApprove.value = false }

const confirmReject = () => {
  if (!rejectReason.value.trim()) {
    showToast('请填写不通过原因')
    // 阻止关闭：Vant Dialog 在 @confirm 里无法阻止默认关闭，这里重新打开
    showReject.value = true
    return
  }
  hazard.reviewRecords.push({ reviewer: '詹飞龙', time: '2023-09-01 12:23', opinion: rejectReason.value })
  showToast('已提交审核不通过')
  showReject.value = false
}

const confirmApprove = () => {
  hazard.reviewRecords.push({ reviewer: '詹飞龙', time: '2023-09-01 12:23', opinion: approveRemark.value || '通过' })
  hazard.status = 'approved'
  showSuccessToast('审核通过')
  showApprove.value = false
}

const loadData = () => {
  const id = route.params.id
  // 若从台账带入查询参数覆盖状态（approved/reviewing）
  const incomingStatus = route.query.status
  if (incomingStatus === 'approved' || incomingStatus === 'reviewing') {
    hazard.status = incomingStatus
  }
  Object.assign(hazard, {
    id,
    primaryType: '施工安全类型',
    secondaryType: '工地使用安全用水',
    content: '那里严重损坏,线路也断了,停水停电电路坏了',
    level: '一般',
    requirements: '按照企业规章制度要求完成整改',
    inspectionPart: '工地一号井',
    deadline: '2023-01-03',
    images: [
      'https://fastly.jsdelivr.net/npm/@vant/assets/mountain.jpeg',
      'https://fastly.jsdelivr.net/npm/@vant/assets/mountain.jpeg',
      'https://fastly.jsdelivr.net/npm/@vant/assets/mountain.jpeg'
    ],
    // 保留路由带入的 hazard.status，不再覆盖
    rectifyRecords: [
      {
        rectifier: '詹飞龙',
        time: '2023-09-01 12:23',
        images: ['https://fastly.jsdelivr.net/npm/@vant/assets/mountain.jpeg'],
        desc: '整改好了'
      },
      {
        rectifier: '詹飞龙',
        time: '2023-09-01 12:23',
        images: ['https://fastly.jsdelivr.net/npm/@vant/assets/mountain.jpeg'],
        desc: '整改好了'
      }
    ],
    reviewRecords: [
      { reviewer: '詹飞龙', time: '2023-09-01 12:23', opinion: '不通过' },
      { reviewer: '詹飞龙', time: '2023-09-01 12:23', opinion: '通过' }
    ]
  })
}

onMounted(loadData)

// 交替合并整改与复核记录
const mixedRecords = computed(() => {
  const result = []
  const maxLen = Math.max(hazard.rectifyRecords.length, hazard.reviewRecords.length)
  for (let i = 0; i < maxLen; i++) {
    if (hazard.rectifyRecords[i]) {
      result.push({ type: 'rectify', index: i, data: hazard.rectifyRecords[i] })
    }
    if (hazard.reviewRecords[i]) {
      result.push({ type: 'review', index: i, data: hazard.reviewRecords[i] })
    }
  }
  return result
})

// 获取标题
const getTitle = (entry) => {
  if (entry.type === 'rectify') {
    // 如果只有一次整改记录，直接显示"整改信息"
    if (hazard.rectifyRecords.length === 1) {
      return '整改信息'
    }
    // 如果有多次，第一次显示"整改信息"，第二次及以后显示"二次整改信息"等
    if (entry.index === 0) {
      return '整改信息'
    }
    const numbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
    const number = numbers[entry.index + 1] || (entry.index + 1)
    return `${number}次整改信息`
  } else {
    // 如果只有一次复核记录，直接显示"复核信息"
    if (hazard.reviewRecords.length === 1) {
      return '复核信息'
    }
    // 如果有多次，第一次显示"复核信息"，第二次及以后显示"二次复核信息"等
    if (entry.index === 0) {
      return '复核信息'
    }
    const numbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
    const number = numbers[entry.index + 1] || (entry.index + 1)
    return `${number}次复核信息`
  }
}
</script>

<style lang="scss" scoped>

.hazard-review-detail { min-height: 100vh; background-color: $bg-color-light; }
.content { padding: 16px; padding-bottom: 80px; }

.section { background: #fff; border-radius: $border-radius; margin-bottom: 16px; overflow: hidden; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid $border-color-light; position: relative; }
.section-header::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 16px; background: $primary-color; border-radius: 2px; }
.section-title { font-size: 16px; font-weight: 500; color: $text-color-primary; margin-left: 12px; }
.info-list { padding: 16px; }
.info-item { display: flex; margin-bottom: 12px; }
.label { font-size: 14px; color: $text-color-secondary; min-width: 80px; flex-shrink: 0; }
.value { font-size: 14px; color: $text-color-primary; flex: 1; }

.review-actions { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; padding: 16px; display: flex; gap: 12px; box-shadow: 0 -2px 8px rgba(0,0,0,0.1); }
.reject-btn { flex: 1; height: 44px; background: $bg-color-light; color: $text-color-primary; border: none; border-radius: $border-radius; }
.approve-btn { flex: 2; height: 44px; border-radius: $border-radius; }

.dialog-title { text-align: center; font-size: 16px; font-weight: 500; }
.dialog-title.danger { color: $danger-color; }
.dialog-title.success { color: $success-color; }
</style>

