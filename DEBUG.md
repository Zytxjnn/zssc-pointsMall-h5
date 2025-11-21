# 🐛 调试指南

## 开发环境调试配置

### 1. 源码映射配置
项目已配置完整的源码映射，支持：
- ✅ JavaScript源码映射
- ✅ CSS源码映射  
- ✅ Vue组件源码映射
- ✅ TypeScript源码映射（如果使用）

### 2. 浏览器调试技巧

#### Chrome DevTools 设置
1. **打开开发者工具**：F12 或 Ctrl+Shift+I
2. **Sources面板**：
   - 在左侧文件树中找到 `webpack://` 或 `vite://` 节点
   - 展开后可以看到完整的源码结构
   - 可以直接在源码中设置断点

3. **Console面板**：
   - 支持直接调用Vue实例方法
   - 支持访问组件数据：`$vm0.$data`
   - 支持调用组件方法：`$vm0.methodName()`

#### 调试快捷键
- **Ctrl+Shift+D**：打开调试面板（开发环境）
- **F12**：打开/关闭开发者工具
- **Ctrl+Shift+C**：选择元素模式

### 3. Vue DevTools
推荐安装Vue DevTools浏览器扩展：
- [Chrome扩展](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Firefox扩展](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### 4. 项目调试工具

#### 调试函数
```javascript
// 在组件中使用
import { debugLog, debugError, debugWarn } from '@/utils/debug'

// 调试日志
debugLog('组件数据:', this.data)

// 错误日志
debugError('API请求失败:', error)

// 警告日志
debugWarn('数据格式异常:', data)
```

#### 全局调试属性
```javascript
// 在组件中访问
this.$debug.log('调试信息')
this.$debug.error('错误信息')
this.$debug.warn('警告信息')
```

### 5. 网络请求调试
```javascript
// 在API请求中使用
import { debugRequest } from '@/utils/debug'

const response = await fetch('/api/data')
debugRequest('/api/data', options, response)
```

### 6. 性能调试
```javascript
// 性能监控
import { debugPerformance } from '@/utils/debug'

const result = debugPerformance('数据处理', () => {
  return processData(largeData)
})
```

### 7. 常见调试场景

#### 组件调试
```javascript
// 在组件mounted中
mounted() {
  debugLog('组件已挂载:', this.$data)
  debugLog('组件props:', this.$props)
}
```

#### 路由调试
```javascript
// 在路由守卫中
router.beforeEach((to, from, next) => {
  debugRoute(to, from)
  next()
})
```

#### 状态管理调试
```javascript
// 在Pinia store中
import { debugLog } from '@/utils/debug'

export const useUserStore = defineStore('user', {
  actions: {
    login(userData) {
      debugLog('用户登录:', userData)
      // ... 登录逻辑
    }
  }
})
```

### 8. 生产环境调试
如果需要调试生产环境：
```bash
# 构建带源码映射的版本
npm run build:debug

# 预览调试版本
npm run preview:debug
```

### 9. 移动端调试

#### Chrome移动端调试
1. 连接手机到电脑
2. 在Chrome地址栏输入：`chrome://inspect`
3. 找到你的设备，点击"inspect"

#### 微信开发者工具
1. 打开微信开发者工具
2. 选择"公众号网页"
3. 输入本地开发地址：`http://localhost:3000`

### 10. 调试最佳实践

1. **使用有意义的日志**：
   ```javascript
   // ❌ 不好的做法
   console.log(data)
   
   // ✅ 好的做法
   debugLog('用户数据加载完成:', { userId: data.id, name: data.name })
   ```

2. **条件调试**：
   ```javascript
   // 只在开发环境输出
   if (import.meta.env.DEV) {
     debugLog('调试信息')
   }
   ```

3. **错误边界**：
   ```javascript
   try {
     // 可能出错的代码
   } catch (error) {
     debugError('操作失败:', error)
     // 错误处理
   }
   ```

4. **性能监控**：
   ```javascript
   // 监控耗时操作
   const result = debugPerformance('数据计算', () => {
     return heavyCalculation()
   })
   ```

## 故障排除

### 源码映射不工作
1. 检查 `vite.config.js` 中的 `sourcemap` 配置
2. 确保浏览器开发者工具中启用了源码映射
3. 清除浏览器缓存重新加载

### Vue DevTools不显示
1. 确保安装了正确的扩展
2. 检查是否在开发环境运行
3. 刷新页面重新加载

### 断点不生效
1. 确保在正确的源码文件中设置断点
2. 检查文件是否被正确映射
3. 尝试在浏览器中直接设置断点
