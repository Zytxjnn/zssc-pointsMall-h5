// API使用示例
import { userApi, pointsApi, hazardApi, learningApi, uploadApi } from '@/api'

// 用户相关API使用示例
export const userApiExample = {
  // 登录示例
  async login() {
    try {
      const result = await userApi.login({
        username: 'user123',
        password: 'password123'
      })
      console.log('登录成功:', result)
      return result
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  },

  // 获取用户信息示例
  async getUserInfo() {
    try {
      const userInfo = await userApi.getUserInfo()
      console.log('用户信息:', userInfo)
      return userInfo
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }
}

// 积分相关API使用示例
export const pointsApiExample = {
  // 获取积分记录示例
  async getPointsRecord() {
    try {
      const records = await pointsApi.getPointsRecord({
        page: 1,
        pageSize: 10,
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      })
      console.log('积分记录:', records)
      return records
    } catch (error) {
      console.error('获取积分记录失败:', error)
      throw error
    }
  },

  // 兑换商品示例
  async exchangeProduct() {
    try {
      const result = await pointsApi.exchangeProduct({
        productId: 1,
        quantity: 1
      })
      console.log('兑换成功:', result)
      return result
    } catch (error) {
      console.error('兑换失败:', error)
      throw error
    }
  }
}

// 文件上传示例
export const uploadExample = {
  // 上传图片示例
  async uploadImage(file) {
    try {
      const result = await uploadApi.uploadImage(file)
      console.log('上传成功:', result)
      return result
    } catch (error) {
      console.error('上传失败:', error)
      throw error
    }
  }
}

// 在Vue组件中的使用示例
export const componentExample = {
  // 在setup函数中使用
  setup() {
    const handleLogin = async () => {
      try {
        const result = await userApi.login({
          username: 'user123',
          password: 'password123'
        })
        // 保存token
        localStorage.setItem('token', result.token)
        localStorage.setItem('userInfo', JSON.stringify(result.userInfo))
        // 跳转到首页
        // router.push('/')
      } catch (error) {
        console.error('登录失败:', error)
      }
    }

    const handleGetUserInfo = async () => {
      try {
        const userInfo = await userApi.getUserInfo()
        console.log('用户信息:', userInfo)
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }

    return {
      handleLogin,
      handleGetUserInfo
    }
  }
}








