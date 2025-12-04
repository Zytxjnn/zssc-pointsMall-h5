<template>
  <div class="hazard-report">
    <!-- 页面标题栏 -->
    <xjnn-nav-bar title="隐患上报" />

    <!-- 隐患信息 -->
    <div class="hazard-info-section">
      <div class="section-title">隐患信息</div>
      
      <div class="form-card">
        <!-- 隐患类型 -->
        <div class="form-item">
          <van-field
            v-model="hazardForm.primaryType"
            placeholder="隐患库里的一级类型"
            label="隐患类型"
            readonly
            required
            is-link
            @click="showPrimaryTypePicker = true"
          />
        </div>

        <!-- 二级类型 -->
        <div class="form-item">
          <van-field
            v-model="hazardForm.secondaryType"
            placeholder="隐患库里的二级类型"
            label="二级类型"
            readonly
            required
            is-link
            @click="onSecondaryFieldClick"
          />
        </div>

        <!-- 隐患内容 -->
        <div class="form-item">
          <div class="label-row">
            <label class="form-label required">隐患内容</label>
            <span class="select-link" @click="onOpenContentPicker">选择</span>
          </div>
          <van-field
            v-model="hazardForm.content"
            type="textarea"
            placeholder="请在此输入详细描述"
            maxlength="200"
            show-word-limit
            autosize
            rows="3"
          />
          <div class="form-tip">(可从下拉选择或直接输入；未匹配的内容将被新增保存)</div>
        </div>

        <!-- 隐患级别 -->
        <div class="form-item">
          <van-field
            v-model="hazardForm.level"
            placeholder="一般"
            label="隐患级别"
            required
            readonly
            is-link
            @click="showLevelPicker = true"
          />
        </div>

        <!-- 整改要求 -->
        <div class="form-item">
          <van-field
            v-model="hazardForm.requirements"
            type="textarea"
            placeholder="请在此输入详细描述"
            label="整改要求"
            required
            maxlength="200"
            show-word-limit
            autosize
            rows="3"
          />
        </div>

        <!-- 检查部位 -->
        <div class="form-item">
          <van-field
            v-model="hazardForm.inspectionPart"
            required
            label="检查部位"
            placeholder="请输入"
          />
        </div>

        <!-- 整改期限 -->
        <div class="form-item">
          <van-field
            v-model="hazardForm.deadline"
            :placeholder="today.toISOString().split('T')[0]"
            label="整改期限"
            required
            readonly
            is-link
            @click="showDatePicker = true"
          />
        </div>

        <!-- 隐患图片 -->
        <div class="form-item">
          <label class="form-label required">隐患图片（{{ hazardForm.images.length }}/4）</label>
          <div class="image-upload">
            <div class="image-list">
              <div 
                v-for="(image, index) in hazardForm.images" 
                :key="index"
                class="image-item"
              >
                <img :src="image" :alt="`图片${index + 1}`" />
                <div class="image-remove" @click="removeImage(index)">
                  <van-icon name="cross" size="12" />
                </div>
              </div>
              <div 
                v-if="hazardForm.images.length < 4"
                class="image-add"
                @click="onAddImage"
              >
                <van-icon name="plus" size="24" />
              </div>
            </div>
            <div class="image-count">({{ hazardForm.images.length }}/4)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 整改信息 -->
    <div class="rectification-info-section">
      <div class="section-title">整改信息</div>
      
      <div class="form-card">
        <!-- 整改人 -->
        <div class="form-item">
          <van-field
            v-model="hazardForm.rectifier"
            placeholder="请选择"
            label="整改人"
            required
            readonly
            is-link
            @click="showRectifierSelector = true"
          />
        </div>

        <!-- 复核人 -->
        <div class="form-item">
          <van-field
            v-model="hazardForm.reviewer"
            placeholder="请选择"
            label="复核人"
            required
            readonly
            is-link
            @click="showReviewerSelector = true"
          />
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-actions">
      <van-button class="cancel-btn" @click="onCancel">取消</van-button>
      <van-button type="primary" class="submit-btn" @click="onSubmit">提交</van-button>
    </div>

    <!-- 选择器弹窗 -->
    <!-- 隐患类型选择器 -->
    <van-popup v-model:show="showPrimaryTypePicker" position="bottom">
      <van-picker
        :columns="primaryTypeOptions"
        @confirm="onPrimaryTypeConfirm"
        @cancel="showPrimaryTypePicker = false"
      />
    </van-popup>

    <!-- 二级类型选择器 -->
    <van-popup v-model:show="showSecondaryTypePicker" position="bottom">
      <van-picker
        :columns="secondaryTypeOptions"
        @confirm="onSecondaryTypeConfirm"
        @cancel="showSecondaryTypePicker = false"
      />
    </van-popup>

    <!-- 隐患内容选择器 -->
    <van-popup v-model:show="showContentPicker" position="bottom">
      <van-picker
        :columns="contentOptions"
        @confirm="onContentConfirm"
        @cancel="showContentPicker = false"
      />
    </van-popup>

    <!-- 隐患级别选择器 -->
    <van-popup v-model:show="showLevelPicker" position="bottom">
      <van-picker
        :columns="levelOptions"
        @confirm="onLevelConfirm"
        @cancel="showLevelPicker = false"
      />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="currentDate"
        :min-date="minDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 选择人员组件 -->
    <PersonSelector
      v-model:show="showRectifierSelector"
      title="选择整改人员"
      type="actionOwner"
      @confirm="onRectifierSelected"
    />

    <PersonSelector
      v-model:show="showReviewerSelector"
      title="选择复核人员"
      type="approver"
      @confirm="onReviewerSelected"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant'
import PersonSelector from '@/components/PersonSelector.vue'
import { riskApi, uploadApi } from '@/api'

const router = useRouter()

// 当前选择的日期
const today = new Date()

// 表单数据
const hazardForm = reactive({
  primaryType: '',
  secondaryType: '',
  content: '',           // 隐患内容文本（可手动输入或选择）
  contentId: '',         // 隐患内容ID（选择时有值，手动输入时为空）
  level: '一般',
  requirements: '',
  inspectionPart: '',
  deadline: today.toISOString().split('T')[0], // 今天的日期
  images: [],            // 图片预览URL数组（用于显示）
  uploadedImages: [],    // 上传后的图片信息数组（提交给后端）
  rectifier: '',
  reviewer: '',
  rectifierId: '',       // 整改人员ID（actionOwnerId）
  reviewerId: ''         // 审批人员ID（approverId）
})

// 选择器显示状态
const showPrimaryTypePicker = ref(false)
const showSecondaryTypePicker = ref(false)
const showLevelPicker = ref(false)
const showDatePicker = ref(false)
const showRectifierSelector = ref(false)
const showReviewerSelector = ref(false)
const showContentPicker = ref(false)


const currentDate = ref([
  today.getFullYear().toString(),
  (today.getMonth() + 1).toString().padStart(2, '0'),
  today.getDate().toString().padStart(2, '0')
])

// 最小日期（今天）
const minDate = new Date()

// 调试：输出初始化的日期信息
console.log('今天日期:', today.toISOString().split('T')[0])
console.log('当前选择日期:', currentDate.value)
console.log('最小日期:', minDate)

// 选项数据
const primaryTypeOptions = ref([])
const secondaryTypeOptions = ref([])
const riskTypeTreeData = ref([]) // 存储完整的树形数据

// 加载一级类型
const loadPrimaryTypes = async () => {
  try {
    const res = await riskApi.getRiskRegisterTypeTreeList()
    riskTypeTreeData.value = res || []
    
    // 只提取一级类型，不包含children
    primaryTypeOptions.value = (res || []).map(item => ({
      text: item.name,
      value: item.id
    }))
    
    console.log(`加载了${primaryTypeOptions.value.length}个一级隐患类型`)
  } catch (error) {
    console.error('获取一级隐患类型失败:', error)
    primaryTypeOptions.value = []
  }
}

// 加载二级类型（从树形数据的children获取）
const loadSecondaryTypes = (primaryTypeId) => {
  if (!primaryTypeId) {
    secondaryTypeOptions.value = []
    return
  }
  
  // 从树形数据中查找对应的一级类型
  const primaryItem = riskTypeTreeData.value.find(item => item.id === primaryTypeId)
  
  if (primaryItem && primaryItem.childrens && primaryItem.childrens.length > 0) {
    secondaryTypeOptions.value = primaryItem.childrens.map(child => ({
      text: child.name,
      value: child.id
    }))
    console.log(`加载了${secondaryTypeOptions.value.length}个二级类型`)
  } else {
    secondaryTypeOptions.value = []
    console.log('该一级类型没有二级类型')
  }
}

const levelOptions = ref([])

// 组件挂载时加载隐患级别
onMounted(() => {
  loadPrimaryTypes()
  loadRiskLevels()
})

// 加载隐患级别列表
const loadRiskLevels = async () => {
  try {
    const res = await riskApi.getRiskLevelList()
    
    levelOptions.value = (res || []).map(item => ({
      text: item.name,
      value: item.id
    }))
    
    console.log(`加载了${levelOptions.value.length}个隐患级别`)
  } catch (error) {
    console.error('获取隐患级别失败:', error)
    levelOptions.value = []
  }
}

// PersonSelector组件会自行加载单位、班组和人员数据，无需传入props

// 添加图片（打开系统相册或相机）
const onAddImage = () => {
  if (hazardForm.images.length >= 4) {
    showToast('最多只能上传4张图片')
    return
  }

  const remain = 4 - hazardForm.images.length

  // 创建文件选择器（支持拍照）
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  // 在多数移动端浏览器上可拉起相机
  // input.capture = 'environment'
  input.multiple = remain > 1

  input.onchange = (e) => {
    const files = Array.from(e.target?.files || [])
    if (!files.length) return
    

    const toAdd = files.slice(0, remain)

    // 立即上传选择的图片
    uploadImages(toAdd)

    // 释放 input
    input.value = ''
  }

  input.click()
}

// 上传图片
const uploadImages = async (files) => {
  if (!files || files.length === 0) return
  
  showLoadingToast({
    message: '正在上传图片...',
    forbidClick: true,
    duration: 0
  })
  
  try {
    // 批量上传图片
    const uploadResult = await uploadApi.uploadBatchImages(files)
    
    // 处理上传结果
    uploadResult.forEach(item => {
      // 保存上传后的图片信息
      hazardForm.uploadedImages.push({
        id: item.id,
        fileName: item.fileName,
        fileOriginalName: item.fileOriginalName,
        fileSize: item.fileSize,
        filePath: item.filePath
      })
      
      // 使用上传后的URL作为预览图
      hazardForm.images.push(item.filePath)
    })
    
    closeToast()
    showToast(`成功上传${uploadResult.length}张图片`)
    console.log(`图片上传成功，当前共${hazardForm.uploadedImages.length}张`)
  } catch (error) {
    closeToast()
    console.error('图片上传失败:', error)
    showToast('图片上传失败，请重试')
  }
}

// 移除图片
const removeImage = (index) => {
  // 同时删除预览URL和上传结果
  hazardForm.images.splice(index, 1)
  hazardForm.uploadedImages.splice(index, 1)
  
  console.log(`删除第${index + 1}张图片，剩余${hazardForm.images.length}张`)
}

// 选择器确认事件
const onPrimaryTypeConfirm = ({ selectedOptions, selectedValues }) => {
  console.log(1111)
  const text = selectedOptions?.[0]?.text || ''
  const value = selectedOptions?.[0]?.value || selectedValues?.[0] || ''
  
  hazardForm.primaryType = text
  
  // 保存一级类型ID
  currentPrimaryValue.value = value
  
  // 重置二级类型和隐患内容
  hazardForm.secondaryType = ''
  hazardForm.content = ''
  hazardForm.contentId = ''
  
  // 从树形数据的children加载二级类型
  loadSecondaryTypes(value)
  
  console.log(`选中一级类型：${text}，ID：${value}`)
  showPrimaryTypePicker.value = false
}

const onSecondaryTypeConfirm = ({ selectedOptions, selectedValues }) => {
  const text = selectedOptions?.[0]?.text || selectedValues?.[0] || ''
  const value = selectedOptions?.[0]?.value || selectedValues?.[0] || ''
  
  hazardForm.secondaryType = text
  currentSecondaryValue.value = value
  
  console.log(`选中二级类型：${text}，ID：${value}`)
  showSecondaryTypePicker.value = false
}

// 点击二级类型输入
const onSecondaryFieldClick = () => {
  if (!hazardForm.primaryType || secondaryTypeOptions.value.length === 0) {
    showToast('请先选择一级类型')
    return
  }
  showSecondaryTypePicker.value = true
}

// 记录当前选择的隐患级别ID
const currentLevelValue = ref(1)

const onLevelConfirm = ({ selectedOptions, selectedValues }) => {
  const text = selectedOptions?.[0]?.text || selectedValues?.[0] || ''
  const value = selectedOptions?.[0]?.value || selectedValues?.[0] || ''
  
  hazardForm.level = text
  currentLevelValue.value = value
  
  console.log(`选中隐患级别：${text}，ID：${value}`)
  showLevelPicker.value = false
}

const onDateConfirm = ({ selectedValues }) => {
  // 确保日期格式为 YYYY-MM-DD
  const [year, month, day] = selectedValues
  hazardForm.deadline = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  showDatePicker.value = false
}

const onRectifierSelected = (person) => {
  hazardForm.rectifier = person?.userName || person?.name || ''
  hazardForm.rectifierId = person?.id || ''
  console.log('选择整改人员:', person)
}

const onReviewerSelected = (person) => {
  hazardForm.reviewer = person?.userName || person?.name || ''
  hazardForm.reviewerId = person?.id || ''
  console.log('选择复核人员:', person)
}


const contentOptions = ref([])
const currentPrimaryValue = ref('') // 记录当前选择的一级类型ID
const currentSecondaryValue = ref('') // 记录当前选择的二级类型ID

// 加载隐患内容列表（根据二级类型ID）
const loadRiskRegisterList = async (secondaryTypeId) => {
  if (!secondaryTypeId) {
    contentOptions.value = []
    return
  }
  
  try {
    const res = await riskApi.getRiskRegisterList({ riskRegisterTypeId: secondaryTypeId })
    
    // 保存完整的数据对象，包括 actionsRequired 和 riskLevel
    contentOptions.value = (res || []).map(item => ({
      text: item.name || item.text,
      value: item.id || item.value,
      actionsRequired: item.actionsRequired || '',  // 整改要求
      riskLevel: item.riskLevel || null            // 隐患级别ID
    }))
    
    console.log(`加载了${contentOptions.value.length}个隐患内容`)
  } catch (error) {
    console.error('获取隐患内容失败:', error)
    contentOptions.value = []
  }
}

// 打开隐患内容选择器
const onOpenContentPicker = async () => {
  if (!hazardForm.secondaryType) {
    showToast('请先选择二级类型')
    return
  }
  
  if (!currentSecondaryValue.value) {
    showToast('请先选择二级类型')
    return
  }
  
  // 加载隐患内容（根据二级类型ID）
  await loadRiskRegisterList(currentSecondaryValue.value)
  
  if (contentOptions.value.length === 0) {
    showToast('当前二级类型暂无可选内容，可直接输入')
    return
  }
  
  showContentPicker.value = true
}

const onContentConfirm = ({ selectedOptions, selectedValues }) => {
  const text = selectedOptions?.[0]?.text || selectedValues?.[0] || ''
  const value = selectedOptions?.[0]?.value || selectedValues?.[0] || ''
  const selectedItem = selectedOptions?.[0]
  
  // 保存选中的隐患内容文本和ID
  hazardForm.content = text
  hazardForm.contentId = value
  
  // 自动填充整改要求
  if (selectedItem?.actionsRequired) {
    hazardForm.requirements = selectedItem.actionsRequired
    console.log('自动填充整改要求:', selectedItem.actionsRequired)
  }
  
  // 自动填充隐患级别
  if (selectedItem?.riskLevel !== null && selectedItem?.riskLevel !== undefined) {
    // 根据 riskLevel ID 查找对应的文本
    const levelOption = levelOptions.value.find(opt => opt.value === selectedItem.riskLevel)
    if (levelOption) {
      hazardForm.level = levelOption.text
      currentLevelValue.value = selectedItem.riskLevel
      console.log('自动填充隐患级别:', levelOption.text, 'ID:', selectedItem.riskLevel)
    } else {
      // 如果找不到对应的级别，直接使用ID
      currentLevelValue.value = selectedItem.riskLevel
      console.log('隐患级别ID未找到对应文本，使用ID:', selectedItem.riskLevel)
    }
  }
  
  console.log(`选中隐患内容：${text}，ID：${value}`)
  showContentPicker.value = false
}

// 监听隐患内容输入框变化
// 注意：如果用户手动修改了内容，需要清空contentId
// 但如果是通过选择器设置的，则保留contentId

// 取消
const onCancel = async () => {
  try {
    await showConfirmDialog({
      title: '确认取消',
      message: '确定要取消上报吗？未保存的数据将丢失。'
    })
    router.back()
  } catch (error) {
    // 用户取消操作
  }
}

// 提交
const onSubmit = async () => {
  await showConfirmDialog({
      title: '确认提交',
      message: '确定要提交隐患上报吗？'
    })
  // 验证必填字段
  if (!hazardForm.primaryType) {
    showToast('请选择隐患类型')
    return
  }
  if (!hazardForm.secondaryType) {
    showToast('请选择二级类型')
    return
  }
  if (!hazardForm.content) {
    showToast('请输入隐患内容')
    return
  }
  if (!hazardForm.requirements) {
    showToast('请输入整改要求')
    return
  }
  if (!hazardForm.inspectionPart) {
    showToast('请输入检查部位')
    return
  }
  if (!hazardForm.rectifier || !hazardForm.rectifierId) {
    showToast('请选择整改人')
    return
  }
  if (!hazardForm.reviewer || !hazardForm.reviewerId) {
    showToast('请选择复核人')
    return
  }

    // 构建提交数据（按照RiskCreateRequest API格式）
    const submitData = {
      riskRegisterTypeId: currentSecondaryValue.value,  // 隐患库类型Id（二级类型ID）
      name: hazardForm.content,                         // 隐患内容
      riskLevel: currentLevelValue.value,               // 隐患级别ID
      actionsRequired: hazardForm.requirements,         // 整改要求
      riskRegisterId: hazardForm.contentId || '',       // 隐患内容Id（选择时有值，手动输入时为空）
      rectificationDeadline: hazardForm.deadline,       // 整改期限
      actionOwnerId: hazardForm.rectifierId,            // 整改人ID
      approverId: hazardForm.reviewerId,                // 审批人ID
      inspectionArea: hazardForm.inspectionPart,        // 检查部位
      riskReportFileIds: hazardForm.uploadedImages.map(img => img.id) // 隐患上报图片ID数组
    }
    
    console.log('映射后的API数据：', submitData)
    
    showLoadingToast({
      message: '提交中...',
      forbidClick: true,
      duration: 0
    })
    
    // 调用API提交数据
    await riskApi.reportHazard(submitData)
    
    closeToast()
    showToast('提交成功！')
    
    // 延迟跳转回首页
    setTimeout(() => {
      router.push('/')
    }, 1500)
}
</script>

<style lang="scss" scoped>



.hazard-report {
  min-height: 100vh;
  background: $background-color;
  padding-bottom: 80px; // 为底部按钮留出空间
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: $text-primary;
  margin: 16px 16px 8px 16px;
}

.form-card {
  background: $white;
  padding: 16px;
}

.form-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .form-label {
    display: block;
    font-size: 12px;
    color: $text-primary;
    margin-bottom: 8px;

    &.required::before {
      content: '*';
      color: $error-color;
      margin-right: 4px;
    }
  }

  .form-tip {
    font-size: 12px;
    color: $error-color;
    margin-top: 4px;
    line-height: 1.4;
  }
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.select-link {
  font-size: 14px;
  color: $primary-color;
}

.image-upload {
  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;

    .image-item {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 6px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-remove {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 20px;
        height: 20px;
        background: $error-color;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $white;
        cursor: pointer;
      }
    }

    .image-add {
      width: 80px;
      height: 80px;
      border: 1px dashed $border-color;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $text-secondary;
      cursor: pointer;
      background: #fafafa;

      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
    }
  }

  .image-count {
    font-size: 12px;
    color: $text-secondary;
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $white;
  padding: 16px;
  border-top: 1px solid $border-color;
  display: flex;
  gap: 12px;

  .cancel-btn {
    flex: 1;
    height: 44px;
    border-radius: 6px;
    font-size: 16px;
    background: #f5f5f5;
    color: $text-primary;
    border: none;
  }

  .submit-btn {
    flex: 1;
    height: 44px;
    border-radius: 6px;
    background-color: $primary-color;
    color: $white;
    font-size: 16px;
  }
}

:deep(.van-cell) {
  padding: 0;
}
</style>

<style lang="scss">
/* 全局样式，用于覆盖Vant组件 */
.van-toast {
  background-color: rgb(0,0,0,0.8) ;
}
</style>
