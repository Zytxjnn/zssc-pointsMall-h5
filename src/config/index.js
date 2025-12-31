// 应用配置
// 根据环境变量设置不同的API端口
const isDev = import.meta.env.MODE === 'development'
const API_PORT = '9067'

// 支持通过环境变量覆盖API地址，确保使用HTTPS协议
const getApiBaseURL = () => {
  // 优先使用环境变量中的API地址
  if (import.meta.env.VITE_API_BASE_URL) {
    const url = import.meta.env.VITE_API_BASE_URL
    // 确保使用HTTPS协议，避免混合内容错误
    return url.startsWith('http://') ? url.replace('http://', 'https://') : url
  }
  // 使用新的API地址，确保使用HTTPS协议
  return `https://psapi.yiqiantu.com/api`
}

export const config = {
  // API基础URL - 使用HTTPS协议避免混合内容错误
  apiBaseURL: getApiBaseURL(),
  
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
