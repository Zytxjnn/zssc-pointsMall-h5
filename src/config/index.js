// 应用配置
// 根据环境变量设置不同的API端口
const isDev = import.meta.env.MODE === 'development'
const API_PORT = '9067'

export const config = {
  // API基础URL
  apiBaseURL: `https://psapi.yiqiantu.com/api`,
  
  // 请求超时时间
  timeout: 10000,
  
  // 分页配置
  pagination: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100]
  },
  
  // 上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword']
  },
  
  // 本地存储键名
  storage: {
    token: 'token',
    userInfo: 'userInfo',
    theme: 'theme',
    language: 'language'
  }
}

export default config
