<template>
  <div class="about">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="关于我们" left-arrow @click-left="onBack">
      <template #right>
        <van-icon name="home-o" size="18" @click="onGoHome" />
      </template>
    </van-nav-bar>

    <!-- 公司信息 -->
    <div class="company-info">
      <van-cell-group>
        <van-cell title="公司名称" value="移动端H5应用" />
        <van-cell title="版本号" value="v1.0.0" />
        <van-cell title="更新时间" value="2024-01-01" />
        <van-cell title="技术支持" value="Vue3 + Pinia + Vant4" />
      </van-cell-group>
    </div>

    <!-- 功能介绍 -->
    <div class="features">
      <van-cell-group title="主要功能">
        <van-cell title="响应式设计" label="适配各种移动设备" />
        <van-cell title="组件化开发" label="基于Vant4组件库" />
        <van-cell title="状态管理" label="使用Pinia进行状态管理" />
        <van-cell title="路由管理" label="Vue Router 4" />
      </van-cell-group>
    </div>

    <!-- 联系方式 -->
    <div class="contact">
      <van-cell-group title="联系我们">
        <van-cell title="邮箱" value="contact@example.com" is-link />
        <van-cell title="电话" value="400-123-4567" is-link />
        <van-cell title="地址" value="北京市朝阳区" />
      </van-cell-group>
    </div>

    <!-- 底部导航 -->
    <TabBar />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import TabBar from '@/components/TabBar.vue'

const router = useRouter()

const onBack = () => {
  router.back()
}

// 返回主页
const onGoHome = () => {
  router.push('/')
}
</script>

<style scoped>
.about {
  padding-bottom: 50px;
}

.company-info,
.features,
.contact {
  margin: 16px;
}
</style>
