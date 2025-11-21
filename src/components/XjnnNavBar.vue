<template>
  <div id="xjnn-nav-bar">
    <div class="xjnn-nav-bar-icon">
      <van-icon name="arrow-left" size="18" @click="onBack" />
    </div>
    <div class="title">{{ title }}</div>
  </div>
</template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  defineProps({
    title: {  
      type: String,
      default: ''
    }
  })
  
  const router = useRouter()

const onBack = () => {
  const historyState = typeof window !== 'undefined' ? window.history.state : null
  if (historyState && historyState.back) {
    router.back()
    return
  }
  router.push('/')
}
  </script>
  
<style lang="scss" scoped>
#xjnn-nav-bar {
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-sizing: border-box;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  .xjnn-nav-bar-icon {
    position: absolute;
    left: 16px;
    top: 11px;
  }  
  .title {
    text-align: center;
    line-height: 40px;
  }

}
</style>
