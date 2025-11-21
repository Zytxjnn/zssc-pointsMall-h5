# Axios 封装使用说明

## 文件结构

```
src/
├── utils/
│   ├── http.js          # axios封装主文件
│   └── api-example.js   # 使用示例
├── api/
│   └── index.js         # API接口定义
└── config/
    └── index.js         # 配置文件
```

## 主要功能

### 1. 请求拦截器
- 自动添加token到请求头
- 添加时间戳防止缓存
- 请求日志记录

### 2. 响应拦截器
- 统一处理响应数据
- 自动处理错误状态码
- 自动清除过期的token
- 统一的错误提示

### 3. 常用请求方法
- `get(url, params, config)` - GET请求
- `post(url, data, config)` - POST请求
- `put(url, data, config)` - PUT请求
- `delete(url, config)` - DELETE请求
- `upload(url, formData, config)` - 文件上传
- `download(url, params, config)` - 文件下载

## 使用方法

### 1. 基本使用

```javascript
import { request } from '@/utils/http'

// GET请求
const getUserInfo = async () => {
  try {
    const result = await request.get('/user/info')
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}

// POST请求
const login = async (data) => {
  try {
    const result = await request.post('/auth/login', data)
    console.log(result)
  } catch (error) {
    console.error(error)
  }
}
```

### 2. 使用API模块

```javascript
import { userApi, pointsApi } from '@/api'

// 用户登录
const result = await userApi.login({
  username: 'user123',
  password: 'password123'
})

// 获取积分记录
const records = await pointsApi.getPointsRecord({
  page: 1,
  pageSize: 10
})
```

### 3. 在Vue组件中使用

```vue
<script setup>
import { ref } from 'vue'
import { userApi } from '@/api'

const userInfo = ref(null)

const getUserInfo = async () => {
  try {
    userInfo.value = await userApi.getUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 组件挂载时获取用户信息
getUserInfo()
</script>
```

### 4. 文件上传

```javascript
import { uploadApi } from '@/api'

const uploadFile = async (file) => {
  try {
    const result = await uploadApi.uploadImage(file)
    console.log('上传成功:', result)
  } catch (error) {
    console.error('上传失败:', error)
  }
}
```

## 配置说明

### 环境配置
在 `src/config/index.js` 中可以配置：
- API基础URL
- 请求超时时间
- 分页配置
- 上传配置
- 本地存储键名

### 错误处理
- 自动显示错误提示
- 401错误自动清除token
- 网络错误友好提示

## 注意事项

1. **Token管理**: 系统会自动从localStorage读取token并添加到请求头
2. **错误处理**: 所有API错误都会自动显示toast提示
3. **响应格式**: 期望后端返回格式为 `{code: 200, data: {...}, message: '...'}`
4. **文件上传**: 使用FormData格式上传文件
5. **缓存控制**: GET请求自动添加时间戳防止缓存

## 扩展

如需添加新的API接口，请在 `src/api/index.js` 中添加对应的函数，遵循现有的命名和结构规范。








