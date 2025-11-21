import { defineStore } from 'pinia'
import { config } from '@/config'
import { userApi } from '@/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      id: null,
      name: '',
      avatar: '',
      phone: '',
      companyName: '',
      crewName: '',
      userId: null
    },
    accessToken: '',
    isLogin: false
  }),

  getters: {
    getUserName: (state) => state.userInfo.name || '未登录',
    getUserAvatar: (state) => state.userInfo.avatar 
  },

  actions: {    // 设置用户信息（登录时使用，包含 token）
    setUserInfo(userInfo) {
      console.log('设置用户信息:', userInfo)
      
      // 检查是否有 token
      if (!userInfo.accessToken) {
        console.warn('警告：没有提供 accessToken')
      }
        
      this.userInfo = {
        id: userInfo.id,
        name: userInfo.name,
        avatar: userInfo.avatar || '',
        phone: userInfo.phone || '',
        companyName: userInfo.companyName || '',
        crewName: userInfo.crewName || '',
        userId: userInfo.userId || userInfo.id
      }
      this.accessToken = userInfo.accessToken || ''

      this.isLogin = true
      localStorage.setItem("token", userInfo.accessToken || '')
      localStorage.setItem("userInfo", JSON.stringify(this.userInfo))
      
      console.log('用户信息已保存到本地存储:', {
        token: userInfo.accessToken ? '已保存' : '无token',
        userInfo: '已保存'
      })
    },

    // 从本地存储恢复用户信息
    restoreUserInfo() {
      try {
        const token = localStorage.getItem("token")
        const userInfoStr = localStorage.getItem("userInfo")
        
        console.log('检查本地存储:', { 
          hasToken: !!token, 
          hasUserInfo: !!userInfoStr,
          tokenLength: token ? token.length : 0
        })
        
        if (token && userInfoStr) {
          const userInfo = JSON.parse(userInfoStr)
          console.log('解析用户信息:', userInfo)
          
          this.userInfo = {
            id: userInfo.id,
            name: userInfo.name || '',
            avatar: userInfo.avatar || '',
            phone: userInfo.phone || '',
            companyName: userInfo.companyName || '',
            crewName: userInfo.crewName || '',
            userId: userInfo.userId || userInfo.id
          }
          this.accessToken = token 
          this.isLogin = true
          console.log('用户信息恢复成功')
          return true
        } else {
          console.log('本地存储中没有有效的用户信息')
        }
      } catch (error) {
        console.error('恢复用户信息失败:', error)
        this.logout()
      }
      return false
    },

    // 初始化用户信息（应用启动时调用）
    async initUserInfo() {
      console.log('开始初始化用户信息...')
      
      // 首先尝试从本地存储恢复
      const restored = this.restoreUserInfo()
      console.log('从本地存储恢复用户信息:', restored)
      
      if (restored) {
        console.log('本地有用户信息，尝试从服务器获取最新信息...')
        // 如果本地有用户信息，尝试从服务器获取最新信息
        try {
          const userInfo = await userApi.getUserInfo()
          console.log('从服务器获取用户信息成功:', userInfo)
          
          // 只更新用户信息，保留原有的 token
          this.updateUserInfoOnly(userInfo)
          return true
        } catch (error) {
          console.error('获取用户信息失败:', error)
          // 如果获取失败，检查是否是401错误（token过期）
          if (error.response && error.response.status === 401) {
            console.log('Token过期，清除本地信息')
            this.logout()
            return false
          }
          // 其他错误，保持本地信息
          console.log('保持本地用户信息')
          return true
        }
      }
      
      console.log('没有本地用户信息')
      return false
    },

    // 登录
    async login(form) {
      const res = await userApi.login(form)
      this.setUserInfo(res)
    },
    // 登出
    logout() {
      this.userInfo = {
        id: null,
        name: '',
        avatar: '',
        phone: '',
        companyName: '',
        crewName: '',
        userId: null
      }
      this.accessToken = ''
      this.isLogin = false
      
      // 清除本地存储
      localStorage.removeItem("token")
      localStorage.removeItem("userInfo")
    },

    // 更新用户信息（不包含 token）
    updateUserInfo(updates) {
      this.userInfo = { ...this.userInfo, ...updates }
      localStorage.setItem("userInfo", JSON.stringify(this.userInfo))
    },

    // 仅更新用户信息，保留 token
    updateUserInfoOnly(userInfo) {
      this.userInfo = {
        id: userInfo.id,
        name: userInfo.name,
        avatar: userInfo.avatar || '',
        phone: userInfo.phone || '',
        companyName: userInfo.companyName || '',
        crewName: userInfo.crewName || '',
        userId: userInfo.userId || userInfo.id
      }
      localStorage.setItem("userInfo", JSON.stringify(this.userInfo))
      console.log('用户信息已更新（保留token）')
    }
  }
})
