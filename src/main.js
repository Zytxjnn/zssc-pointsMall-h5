import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { useUserStore } from './stores/user'

// 引入Vant样式
import 'vant/lib/index.css'

// 引入全局样式
import './styles/index.css'
// 引入Vant主题样式
import './styles/vant-theme.css'

import 'tcplayer.js/dist/tcplayer.min.css';

// 开发环境调试工具
import { setupGlobalErrorHandler, debugLog } from './utils/debug'

const app = createApp(App)


// 开发环境配置
if (import.meta.env.DEV) {
  // 设置全局错误处理
  setupGlobalErrorHandler()
  
  // 全局属性，方便在组件中使用
  app.config.globalProperties.$debug = {
    log: debugLog,
    error: console.error,
    warn: console.warn
  }
  
  // 开发环境提示
  debugLog('🚀 开发环境已启动')
  debugLog('💡 按 Ctrl+Shift+D 打开调试面板')
}

const pinia = createPinia()
app.use(pinia)
app.use(router)

// 初始化用户信息
const userStore = useUserStore()
userStore.initUserInfo().then((success) => {
  if (success) {
    console.log('用户信息初始化成功')
  } else {
    console.log('用户未登录')
  }
})

app.mount('#app')
