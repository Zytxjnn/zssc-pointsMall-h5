<template>
  <div class="hazard-ledger">
    <!-- 顶部导航栏 -->
    <xjnn-nav-bar title="隐患列表" />

    <!-- 顶部状态标签 -->
    <div class="status-tabs">
      <van-tabs v-model:active="activeTab" shrink animated>
        <van-tab title="全部" name="all" />
        <van-tab title="待整改" name="toRectify" />
        <van-tab title="待复核" name="toReview" />
        <van-tab title="审核通过" name="approved" />
      </van-tabs>
    </div>

    <!-- 处理人筛选 - 只在全部标签页显示 -->
    <div v-if="activeTab === 'all'" class="handler-filters">
      <div class="label">处理人：</div>
      <div class="chips">
        <span class="chip" :class="{active: handler === 'all'}" @click="setHandler('all')">所有人</span>
        <span class="chip" :class="{active: handler === 'mine_rectify'}" @click="setHandler('mine_rectify')">待我整改的
          <i v-if="badgeRectify" class="badge">{{ badgeRectify }}</i>
        </span>
        <span class="chip" :class="{active: handler === 'mine_review'}" @click="setHandler('mine_review')">待我复核
          <i v-if="badgeReview" class="badge">{{ badgeReview }}</i>
        </span>
      </div>
    </div>

    <!-- 隐患卡片列表 -->
    <div v-if="riskList.length > 0" class="list">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="card" v-for="item in riskList" :key="item.id" @click="viewDetail(item)">
          <div class="card-header">
            <div class="level" :class="getLevelClass(item.riskLevel)">{{ item.riskLevelName }}</div>
            <div class="type">
              {{ item.riskRegisterTypeName }}
              <van-icon name="arrow" size="16" style="padding-top: 2px;" />
            </div>
          <div class="status-tag" :class="getStatusClass(item.riskStatus)">{{ item.riskStatusName }}</div>
          </div>
          <div class="row"><span class="label">上报时间：</span>{{ item.reportTime }}</div>
          <div class="row"><span class="label">上报人：</span>{{ item.reporterName }}</div>
          <div class="row"><span class="label">隐患内容：</span>{{ item.riskRegisterName }}</div>
          <div class="row"><span class="label">整改期限：</span>{{ item.rectificationDeadline }}</div>
          <div class="row split"></div>
          <div class="row footer">
            <div>整改人：<span class="name">{{ item.actionOwnerName || '待选' }}</span></div>
            <div>复核人：<span class="name">{{ item.approverName || '待选' }}</span></div>
          </div>
        </div>
      </van-list>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="!loading && riskList.length === 0" class="empty-state">
      <div class="empty-text">暂无隐患数据</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { riskApi } from '@/api'

const router = useRouter()

const activeTab = ref('all')
const handler = ref('all')
const badgeRectify = ref(0)
const badgeReview = ref(0)

// 列表数据
const riskList = ref([])
const loading = ref(false)
const finished = ref(false)
const currentPageIndex = ref(0)
const pageSize = ref(10)

// 状态映射
const statusMap = {
  'all': null,      // 全部
  'toRectify': 0,   // 待整改
  'toReview': 1,    // 待复核
  'approved': 2     // 审核通过
}

// 处理人映射
const processorMap = {
  'all': 0,           // 所有人
  'mine_rectify': 1,  // 待我整改的
  'mine_review': 2    // 待我复核的
}

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    
    const params = {
      RiskStatus: statusMap[activeTab.value],
      Processor: processorMap[handler.value],
      CurrentPageIndex: currentPageIndex.value,
      PageSize: pageSize.value               
    }
    
    const {list} = await riskApi.getRiskList(params)
    const newData = list || []
    
    if (currentPageIndex.value === 0) {
      riskList.value = newData
    } else {
      riskList.value.push(...newData)
    }
    
    // 判断是否还有更多数据
    if (newData.length < pageSize.value) {
      finished.value = true
    }
  } catch (error) {
    console.error('加载隐患列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 滚动加载
const onLoad = () => {
  currentPageIndex.value++
  loadData()
}

// 重置数据
const resetData = () => {
  currentPageIndex.value = 0
  finished.value = false
  riskList.value = []
}

// 标签页切换
const onTabChange = () => {
  handler.value = 'all'
  resetData()
  loadData()
  loadCornerMark()
}

// 处理人切换
const setHandler = (h) => {
  handler.value = h
  resetData()
  loadData()
  loadCornerMark()
}

// 获取等级样式类
const getLevelClass = (level) => {
  const levelMap = {
    0: 'general',
    1: 'minor', 
    2: 'major'
  }
  return levelMap[level] || 'general'
}

// 获取状态样式类
const getStatusClass = (status) => {
  const statusMap = {
    0: 'toRectify',
    1: 'toReview',
    2: 'approved'
  }
  return statusMap[status] || 'toRectify'
}

// 监听标签页变化
watch(activeTab, onTabChange)

const viewDetail = (item) => {
  // 所有隐患都跳转到同一个详情页面
  router.push(`/hazard-detail/${item.id}`)
}

// 获取角标数量
const loadCornerMark = async () => {
  try {
    const data = await riskApi.getRiskListCornerMark();
    badgeRectify.value = data.rectificationPendingCount || 0
    badgeReview.value = data.approvalPendingCount || 0
  } catch (error) {
    console.error('获取角标数量失败:', error)
  }
}

// 初始化
onMounted(() => {
  loadData()
  loadCornerMark()
})
</script>

<style lang="scss" scoped>

.hazard-ledger {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $background-color;
  overflow: hidden;
}



.status-tabs {
  position: sticky;
  top: 40px;
  z-index: 900;
  background: $white;
  height: 36px;
}

.handler-filters {
  position: sticky;
  top: 76px;
  z-index: 890;
  background: $white; padding: 10px 12px; border-top: 1px solid $border-color;
  display: flex; align-items: center; gap: 8px;
  .label { color: $text-secondary; font-size: 13px; }
  .chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .chip { padding: 4px 10px; background: #f3f4f6; border-radius: 999px; font-size: 12px; color: $text-secondary; position: relative; cursor: pointer; }
  .chip.active { background: #e8f4ff; color: $primary-color; }
  .badge { position: absolute; top: -6px; right: -6px; background: #ee0a24; color: #fff; border-radius: 10px; padding: 0 6px; font-size: 10px; }
}

.list { 
  flex: 1;
  overflow-y: auto;
  padding: 12px; 
  background-color: $white;
}
.card { 
  background: $white; 
  border-radius: 8px; 
  padding: 12px; 
  margin-bottom: 12px; 
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #F9F9FA; 
 
}
.card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.level { 
  padding: 0 4px;
  font-size: 10px; 
  color: #fff; 
  line-height: 18px;
  border-radius: 2px;
}
.level.general { background: #1961AC; }
.level.minor { background: #ED8B19; }
.level.major { background: #B10012; }
.type { 
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1; 
  color: $text-primary; 
  font-size: 16px;
  font-weight: 500;
}
.status-tag {
   padding: 2px 8px; 
   border-radius: 2px; 
   font-size: 12px; 
   background-color: #f3f4f6; 
  }
.status-tag.toRectify { background: #e6f7ff; color: #1890ff; }
.status-tag.toReview { background: #f0f5ff; color: #2f54eb; }
.status-tag.approved { background: #e8f5e9; color: #07c160; }
.row { font-size: 13px; color: $text-primary; margin: 6px 0; }
.row .label { color: $text-secondary; }
.row.split { border-top: 1px dashed $border-color; margin-top: 8px; padding-top: 8px; }
.row.footer { display: flex; justify-content: space-between; }
.name { color: $text-secondary; }

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

:deep(.van-tab--shrink ) {
  flex: 1;
}
</style>


