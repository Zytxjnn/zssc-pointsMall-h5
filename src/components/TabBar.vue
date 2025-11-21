<template>
  <van-tabbar v-model="active" fixed placeholder>
    <van-tabbar-item to="/">
      <template #icon="{ active: isActive }">
        <img 
          :src="isActive ? homeActiveIcon : homeIcon" 
          alt="首页"
          class="tab-icon"
        />
      </template>
      首页
    </van-tabbar-item>
    <van-tabbar-item to="/profile">
      <template #icon="{ active: isActive }">
        <img 
          :src="isActive ? profileActiveIcon : profileIcon" 
          alt="我的"
          class="tab-icon"
        />
      </template>
      我的
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

// 导入图标图片
import homeIcon from '/images/tabbar/home@2x.png'
import homeActiveIcon from '/images/tabbar/homeActive@2x.png'
import profileIcon from '/images/tabbar/profile@2x.png'
import profileActiveIcon from '/images/tabbar/profileActive@2x.png'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const active = ref(0)

// 根据路由设置激活状态
const setActiveByRoute = () => {
  const path = route.path
  switch (path) {
    case '/':
      active.value = 0
      break
    case '/profile':
      active.value = 1
      break
    default:
      active.value = 0
  }
  appStore.setBottomNavActive(active.value)
}

// 监听路由变化
watch(route, setActiveByRoute, { immediate: true })

// 监听active变化
watch(active, (newActive) => {
  appStore.setBottomNavActive(newActive)
})
</script>

<style lang="scss" scoped>
.tab-icon {
  width: 22px;
  height: 22px;
}
</style>
