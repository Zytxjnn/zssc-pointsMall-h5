<template>
  <div class="exchange-result">
    <xjnn-nav-bar title="兑换结果" />

    <div class="content-area">
      <div v-if="exchangeStatus === 'loading'" class="loading-state">
        <div class="loading-spinner">
          <van-loading type="spinner" size="24" color="#1989fa" />
        </div>
        <div class="loading-text">货柜出货中,请稍后...</div>
        <div class="tip">出货中，请不要离开</div>
      </div>

      <div v-else-if="exchangeStatus === 'success'" class="success-state">
        <van-image src="/images/exchangeResult/success.png" width="100" height="100" />
        <div class="success-text">兑换成功!</div>
        <div class="success-tip">请在货柜下方取走物品</div>
        <van-button type="primary" class="action-btn" @click="onContinueExchange">
          继续兑换
        </van-button>
      </div>

      <div v-else-if="exchangeStatus === 'failed'" class="failed-state">
        <van-image src="/images/exchangeResult/failed.png" width="100" height="100" />
        <div class="failed-text">兑换失败!</div>
        <div class="failed-reason" v-if="exchangeResult.message">
          {{ exchangeResult.message }}
        </div>
        <van-button type="primary" class="action-btn" @click="onRetryExchange">
          重新尝试
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { weimiPointsApi } from '@/api'

const router = useRouter()
const route = useRoute()

const exchangeStatus = ref('loading')
const exchangeResult = ref({
  message: ''
})
let timer = null
let attempt = 0
const maxAttempts = 100
const flowNo = route.query.flowNo || ''
const codeParam = route.query.code || flowNo

const pollStatus = async () => {
  attempt += 1
  try {
    const res = await weimiPointsApi.getRedeemStatus({ code: codeParam })
    const status = res?.status ?? res?.Status ?? res
    if (status === 1) {
      exchangeStatus.value = 'success'
      clearTimer()
      return
    }
    if (status === 0) {
      exchangeStatus.value = 'failed'
      exchangeResult.value = { message: '流水号不存在' }
      clearTimer()
      return
    }
    if (status === 3) {
      exchangeStatus.value = 'failed'
      exchangeResult.value = { message: res?.message || res?.Message || '兑换失败' }
      clearTimer()
      return
    }
    // status === 2 继续轮询
    if (attempt >= maxAttempts) {
      exchangeStatus.value = 'failed'
      exchangeResult.value = { message: '兑换状态未知，请稍后在记录中查看' }
      clearTimer()
    }
  } catch (error) {
    exchangeStatus.value = 'failed'
    exchangeResult.value = { message: error.message || '兑换失败' }
    clearTimer()
  }
}

const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  if (!flowNo) {
    exchangeStatus.value = 'failed'
    exchangeResult.value = { message: '缺少流水号，无法查询结果' }
    return
  }
  timer = setInterval(pollStatus, 1000)
  pollStatus()
})

onBeforeUnmount(() => {
  clearTimer()
})

const onContinueExchange = () => {
  router.back()
}

const onRetryExchange = () => {
  router.back()
}
</script>

<style lang="scss" scoped>
.exchange-result {
  min-height: 100vh;
  background: $white;
}

.content-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  padding: 40px 20px;
}

.loading-state {
  text-align: center;

  .loading-text {
    font-size: 16px;
    margin-bottom: 10px;
  }

  .tip {
    font-size: 12px;
    color: $text-secondary;
  }

  .loading-spinner {
    display: flex;
    justify-content: center;
  }
}

.success-state {
  text-align: center;
  width: 100%;
  max-width: 500px;

  .success-text {
    font-weight: bold;
    margin-bottom: 16px;
  }

  .success-tip {
    font-size: 14px;
    color: #9195A2;
    margin-bottom: 26px;
  }
}

.failed-state {
  text-align: center;
  width: 100%;
  max-width: 500px;

  .failed-text {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
    margin-top: 16px;
  }

  .failed-reason {
    font-size: 14px;
    color: $text-secondary;
    margin-bottom: 24px;
    padding: 12px 16px;
    background: #fff3f3;
    border-radius: 8px;
  }
}

.action-btn {
  display: inline-flex;
  height: 36px;
  padding: 9px 16px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  border-radius: 26px;
  background-color:  #ECF2FE !important;
  border-color: #ECF2FE !important;
  color: $primary-color;
}

::deep(.van-nav-bar__title) {
  color: $text-primary;
  font-weight: 500;
}

::deep(.van-nav-bar__arrow) {
  color: $text-primary;
}

::deep(.van-loading) {
  .van-loading__spinner {
    color: $primary-color;
  }
}
</style>

