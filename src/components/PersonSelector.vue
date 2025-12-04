<template>
  <van-popup v-model:show="visible" position="bottom" round :style="{ height: '80%' }">
    <div class="person-selector">
      <div class="header">{{ title }}</div>

      <div class="search-row">
        <div class="search-input">
          <van-field
            v-model="keyword"
            placeholder="请输入姓名"
            clearable
            left-icon="search"
          />
        </div>
        <van-button type="primary" size="small" class="search-btn" @click="onSearch">搜索</van-button>
      </div>

      <div class="list">
        <div
          v-for="p in peopleList"
          :key="p.id"
          class="list-item"
          :class="{ active: p.id === selectedId }"
          @click="selectedId = p.id"
        >
          <div class="info">
            <div class="info-header">
              <span class="name">{{ p.userName }}</span>
              <van-icon v-if="p.id === selectedId" name="success" color="#1989fa" />
            </div>
            <div class="meta">
              <span class="dept">{{ p.deptName || '-' }}</span>
              <span class="phone">{{ p.phoneNo || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <van-button class="btn" @click="onCancel">取消</van-button>
        <van-button class="btn" type="primary" @click="onConfirm">确定</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { riskApi } from '@/api'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '选择人员' },
  type: { type: String, default: 'actionOwner', validator: (value) => ['actionOwner', 'approver'].includes(value) }
})

const emit = defineEmits(['update:show', 'confirm', 'cancel'])

const visible = ref(props.show)
watch(() => props.show, v => {
  visible.value = v
  if (v) {
    // 弹窗打开时重置状态并加载数据
    keyword.value = ''
    selectedId.value = null
    loadUserList()
  }
})
watch(visible, v => emit('update:show', v))

const keyword = ref('')
const selectedId = ref(null)
const peopleList = ref([])
const loading = ref(false)

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const params = {}
    if (keyword.value) {
      params.UserName = keyword.value
    }
    
    // 根据 type 调用不同的接口
    const apiMethod = props.type === 'approver' ? riskApi.getApproverList : riskApi.getActionOwnerList
    const res = await apiMethod(params)
    
    // 接口返回格式：{success: true, code: 0, message: "string", data: [...]}
    // 由于 http.js 拦截器会返回 data.data，所以这里 res 应该直接是数组
    // 但为了兼容，同时检查 res 是否为数组或 res.data 是否为数组
    peopleList.value = Array.isArray(res) ? res : (res?.data || [])
    console.log(`加载了${peopleList.value.length}条用户数据`)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    peopleList.value = []
  } finally {
    loading.value = false
  }
}

// 搜索
const onSearch = () => {
  loadUserList()
}


const onCancel = () => {
  visible.value = false
  emit('cancel')
}

const onConfirm = () => {
  const person = peopleList.value.find(p => p.id === selectedId.value)
  if (person) emit('confirm', person)
  visible.value = false
  
}
</script>

<style lang="scss" scoped>

.person-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $white;
}

.header {
  text-align: center;
  padding: 12px 16px;
  font-weight: 600;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;

  .search-input { flex: 1; }
  .search-btn { width: 72px; }
}


.list {
  flex: 1;
  overflow-y: auto;
  background: $white;
}

.list-item {
  display: flex;
  width: 100%;
  align-items: flex-start;
  padding: 14px 16px;
  border-bottom: 1px solid $border-color;

  &.active { 
    background: #f0f7ff; 
    .name {
      color: $primary-color !important;
    }
    .meta {
      .dept {
        color: $primary-color !important;
      }
      .phone {
        color: $primary-color !important;
      }
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;

    .info-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .name {
        font-size: 15px;
        color: $text-primary;
      }

      :deep(.van-icon) {
        flex-shrink: 0;
      }
    }
  }

  .meta {
    display: flex;
    width: 100%;
    justify-content: space-between;
    font-size: 12px;
    color: $text-secondary;

    .dept {
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 12px;
    }

    .phone {
      flex-shrink: 0;
    }
  }
}

.footer {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid $border-color;

  .btn { flex: 1; height: 40px; }
}

:deep(.van-cell) {
  padding: 10px 16px !important;
  background-color: #f5f5f5 !important;
  border-radius: 999px;
}

:deep(.van-popup) {
  padding-top: 10px;
}
</style>




