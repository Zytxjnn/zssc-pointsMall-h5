<template>
  <div class="rectification-report">
    <!-- 导航栏 -->
    <van-nav-bar
      title="上报成果"
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
      <!-- 隐患图片 -->
      <div class="section">
        <div class="section-title">
          <span class="required">*</span>
          隐患图片
        </div>
        <div class="image-counter">({{ uploadedImages.length }}/4)</div>
        
        <div class="image-upload">
          <div class="image-list">
            <!-- 已上传的图片 -->
            <div 
              v-for="(image, index) in uploadedImages" 
              :key="image.id || index"
              class="image-item"
            >
              <van-image
                :src="image.url"
                fit="cover"
                class="uploaded-image"
              />
              <div class="remove-btn" @click="removeImage(index)">
                <van-icon name="cross" />
              </div>
            </div>
            
            <!-- 添加图片按钮 -->
            <div 
              v-if="uploadedImages.length < 4"
              class="add-image-btn"
              :class="{ 'uploading': uploading }"
              @click="onAddImage"
            >
              <van-icon v-if="!uploading" name="plus" size="24" />
              <van-loading v-else size="20" />
            </div>
          </div>
        </div>
      </div>

      <!-- 整改情况描述 -->
      <div class="section">
        <div class="section-title">
          <span class="required">*</span>
          整改情况描述
        </div>
        
        <van-field
          v-model="description"
          type="textarea"
          placeholder="请在此输入详细描述"
          maxlength="200"
          show-word-limit
          autosize
          class="description-field"
        />
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="action-buttons">
      <van-button 
        class="cancel-btn" 
        @click="onCancel"
      >
        取消
      </van-button>
      <van-button 
        type="primary" 
        class="submit-btn"
        @click="onSubmit"
        :disabled="!canSubmit"
      >
        确认上传
      </van-button>
    </div>

    <!-- 文件上传 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="onFileChange"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast, showLoadingToast, closeToast } from 'vant'
import { riskApi, uploadApi } from '@/api'

const route = useRoute()
const router = useRouter()

// 隐患ID
const hazardId = ref(route.params.id || '')

// 已上传的图片
const uploadedImages = ref([])

// 整改情况描述
const description = ref('')

// 文件输入引用
const fileInput = ref(null)

// 上传状态
const uploading = ref(false)

// 是否可以提交
const canSubmit = computed(() => {
  return uploadedImages.value.length > 0 && description.value.trim().length > 0
})

// 返回
const onBack = () => {
  router.back()
}

// 返回首页
const onGoHome = () => {
  router.push('/')
}

// 添加图片
const onAddImage = () => {
  if (uploadedImages.value.length >= 4) {
    showToast('最多只能上传4张图片')
    return
  }
  fileInput.value?.click()
}

// 文件选择
const onFileChange = async (event) => {
  const files = Array.from(event.target.files)
  
  if (files.length === 0) return
  
  // 检查数量限制
  if (uploadedImages.value.length + files.length > 4) {
    showToast('最多只能上传4张图片')
    return
  }
  
  // 验证文件类型
  const validFiles = files.filter(file => {
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件')
      return false
    }
    return true
  })
  
  if (validFiles.length === 0) return
  
  // 立即上传图片
  await uploadImages(validFiles)
  
  // 清空input
  event.target.value = ''
}

// 上传图片
const uploadImages = async (files) => {
  try {
    uploading.value = true
    showLoadingToast('上传中...')
    
    // 调用批量上传API
    const response = await uploadApi.uploadBatchImages(files)
    
    // 处理上传结果
    const uploadedFiles = response.data || response || []
    
    uploadedFiles.forEach(fileInfo => {
      uploadedImages.value.push({
        id: fileInfo.id,
        url: fileInfo.filePath,
        fileName: fileInfo.fileName,
        fileOriginalName: fileInfo.fileOriginalName,
        fileSize: fileInfo.fileSize,
        filePath: fileInfo.filePath
      })
    })
    
    closeToast()
    showSuccessToast('图片上传成功')
    
  } catch (error) {
    console.error('图片上传失败:', error)
    closeToast()
    showToast('图片上传失败，请重试')
  } finally {
    uploading.value = false
  }
}

// 删除图片
const removeImage = (index) => {
  // 释放URL对象（如果是本地预览URL）
  if (uploadedImages.value[index].url.startsWith('blob:')) {
    URL.revokeObjectURL(uploadedImages.value[index].url)
  }
  uploadedImages.value.splice(index, 1)
}

// 取消
const onCancel = () => {
  showToast('已取消')
  router.back()
}

// 提交
const onSubmit = async () => {
  if (!canSubmit.value) {
    showToast('请完善必填信息')
    return
  }
  
  if (uploading.value) {
    showToast('图片正在上传中，请稍候')
    return
  }
  
  try {
    showLoadingToast('提交中...')
    
    // 构造提交数据
    const submitData = {
      riskId: hazardId.value,
      actionDescription: description.value.trim(),
      riskActionFileIds: uploadedImages.value.map(img => img.id)
    }
    
    console.log('提交数据:', submitData)
    
    // 调用API提交
    await riskApi.doAction(submitData)
    
    closeToast()
    showSuccessToast('整改成果提交成功')
    
    // 延迟跳转回隐患详情页
    setTimeout(() => {
      router.back()
    }, 1500)
    
  } catch (error) {
    console.error('提交失败:', error)
    closeToast()
    showToast('提交失败，请重试')
  }
}
</script>

<style lang="scss" scoped>

.rectification-report {
  min-height: 100vh;
  background-color: $bg-color-light;
}

.content {
  padding: 16px;
  padding-bottom: 80px; // 为底部按钮留出空间
}

.section {
  background: #fff;
  border-radius: $border-radius;
  margin-bottom: 16px;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: $text-color-primary;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.required {
  color: $error-color;
  margin-right: 4px;
}

.image-counter {
  font-size: 12px;
  color: $text-color-secondary;
  margin-bottom: 12px;
}

.image-upload {
  .image-list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: $border-radius;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.add-image-btn {
  width: 80px;
  height: 80px;
  border: 2px dashed #ddd;
  border-radius: $border-radius;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover:not(.uploading) {
    border-color: $primary-color;
    color: $primary-color;
  }
  
  &.uploading {
    cursor: not-allowed;
    opacity: 0.6;
    border-color: $primary-color;
    color: $primary-color;
  }
}

.description-field {
  :deep(.van-field__control) {
    min-height: 120px;
    font-size: 14px;
    line-height: 1.5;
  }
  
  :deep(.van-field__word-limit) {
    color: $text-color-secondary;
    font-size: 12px;
  }
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
  
  &:disabled {
    opacity: 0.5;
  }
}
</style>


