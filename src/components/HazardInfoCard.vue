<template>
  <div class="section">
    <div class="section-header">
      <div class="section-title">隐患信息</div>
    </div>

    <div class="info-list">
      <div class="info-item">
        <span class="label">隐患类型：</span>
        <span class="value">{{ info.riskRegisterTypeName }}</span>
      </div>
      <div class="info-item">
        <span class="label">隐患内容：</span>
        <span class="value">{{ info.riskRegisterName }}</span>
      </div>
      <div class="info-item">
        <span class="label">隐患级别：</span>
        <span class="value">{{ info.riskLevelName }}</span>
      </div>
      <div class="info-item">
        <span class="label">整改要求：</span>
        <span class="value">{{ info.actionsRequired }}</span>
      </div>
      <div class="info-item">
        <span class="label">检查部位：</span>
        <span class="value">{{ info.inspectionArea }}</span>
      </div>
      <div class="info-item">
        <span class="label">整改期限：</span>
        <span class="value">{{ info.rectificationDeadline }}</span>
      </div>
    </div>

    <div class="section-subtitle">隐患图片</div>
    <div class="image-list">
      <div
        v-for="(file, index) in info.riskReportFiles"
        :key="index"
        class="image-item"
        @click="preview(index)"
      >
        <van-image :src="file.filePath" fit="cover" class="hazard-image" />
        <div class="image-overlay">点击预览</div>
      </div>
    </div>

    <van-image-preview
      v-model:show="showPreview"
      :images="info.riskReportFiles.map(file => file.filePath)"
      :start-position="previewIndex"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  info: {
    type: Object,
    required: true
  },
  status: {
    type: Number,
    default: 0
  }
})

const statusText = computed(() => ({
  0: '待整改',
  1: '待审批',
  2: '审批通过'
}[props.status] || '未知'))

const showPreview = ref(false)
const previewIndex = ref(0)
const preview = (index) => {
  previewIndex.value = index
  showPreview.value = true
}
</script>

<style lang="scss" scoped>

.section {
  background: #fff;
  border-radius: $border-radius;
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
.section-title { font-size: 16px; font-weight: 500; color: $text-color-primary; }
.section-subtitle { padding: 16px; font-size: 14px; color: $text-color-primary; }
.status-tag { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.status-tag.status-pending { background: #FFF3EF; color: #D9402B; }
.status-tag.status-reviewing { background: #FFFAF0; color: #FF9500; }
.status-tag.status-approved { background: #ECF7EC; color: #32953D; }

.info-list { padding: 16px; }
.info-item { 
  display: flex; margin-bottom: 12px; 
  padding-bottom: 12px;

  &:not(:last-child) {
    border-bottom: 1px solid $border-color-light;
  }
}
.info-item:last-child { margin-bottom: 0; }
.label { font-size: 14px; color: $text-color-secondary; min-width: 80px; flex-shrink: 0; }
.value { 
  font-size: 14px; 
  color: $text-color-primary; 
  flex: 1; 
  word-break: break-all; 
  text-align: right;
}

.image-list { padding: 0 16px 16px; display: flex; gap: 12px; flex-wrap: wrap; }
.image-item { position: relative; width: 80px; height: 80px; border-radius: $border-radius; overflow: hidden; cursor: pointer; }
.hazard-image { width: 100%; height: 100%; }
.image-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: #fff; font-size: 12px; text-align: center; padding: 4px; }
</style>


