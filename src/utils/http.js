import axios from 'axios'
import { showToast } from 'vant'
import { config } from '@/config'
import router from '@/router'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const http = axios.create({
  baseURL: config.apiBaseURL, // API基础URL
  timeout: config.timeout, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
http.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    console.log('发送请求:', config)
    
    // 添加token到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    console.log('响应数据:', response)
    
    const { data } = response
    
    // 根据后端返回的数据结构处理
    if (data.code === 200 || data.code === 0) {
      if (Object.prototype.hasOwnProperty.call(data, 'data')) {
        return data.data
      }
      return data
    } else if (data.code === 401) {
      // token过期，清除登录信息并跳转到登录页
      clearAuthAndRedirect('登录已过期，请重新登录')
      return Promise.reject(new Error(data.message || '登录已过期'))
    } else {
      // 其他错误
      // showToast(data.message || '请求失败')
      return Promise.reject(new Error(data.message || '请求失败'))
    }
  },
  error => {
    // 对响应错误做点什么
    console.error('响应错误:', error)
    
    let message = '网络错误，请稍后重试'
    
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          message = data.message || '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          clearAuthAndRedirect(message)
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = data.message || `请求失败 (${status})`
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message = '网络连接失败，请检查网络'
    } else {
      // 其他错误
      message = error.message || '请求失败'
    }
    
    showToast(message)
    return Promise.reject(error)
  }
)

// 封装常用请求方法
export const request = {
  // GET请求
  get(url, params = {}, config = {}) {
    return http.get(url, {
      params,
      ...config
    })
  },

  // POST请求
  post(url, data = {}, config = {}) {
    return http.post(url, data, config)
  },

  // PUT请求
  put(url, data = {}, config = {}) {
    return http.put(url, data, config)
  },

  // DELETE请求
  delete(url, config = {}) {
    return http.delete(url, config)
  },

  // 上传文件
  upload(url, formData, config = {}) {
    return http.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  },

  // 下载文件
  download(url, params = {}, config = {}) {
    return http.get(url, {
      params,
      responseType: 'blob',
      ...config
    })
  }
}

// 清除认证信息并跳转到登录页
function clearAuthAndRedirect(message) {
  // 清除用户状态（这会同时清除本地存储）
  const userStore = useUserStore()
  userStore.logout()
  
  // 显示提示信息
  showToast(message)
  
  // 跳转到登录页（避免重复跳转）
  if (router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
}

// 导出axios实例，供特殊需求使用
export default http
