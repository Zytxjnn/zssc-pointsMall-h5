import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    theme: 'light', // light | dark
    language: 'zh-CN',
    bottomNavActive: 0
  }),

  getters: {
    isDark: (state) => state.theme === 'dark'
  },

  actions: {
    // 设置加载状态
    setLoading(loading) {
      this.loading = loading
    },

    // 切换主题
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },

    // 设置语言
    setLanguage(language) {
      this.language = language
    },

    // 设置底部导航激活状态
    setBottomNavActive(index) {
      this.bottomNavActive = index
    }
  }
})
