/**
 * 开发环境调试工具
 */

// 开发环境标识
export const isDev = import.meta.env.DEV

// 调试日志
export const debugLog = (...args) => {
  if (isDev) {
    console.log('[DEBUG]', ...args)
  }
}

// 错误日志
export const debugError = (...args) => {
  if (isDev) {
    console.error('[ERROR]', ...args)
  }
}

// 警告日志
export const debugWarn = (...args) => {
  if (isDev) {
    console.warn('[WARN]', ...args)
  }
}

// 性能监控
export const debugPerformance = (label, fn) => {
  if (isDev) {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    console.log(`[PERF] ${label}: ${end - start}ms`)
    return result
  }
  return fn()
}

// 组件调试信息
export const debugComponent = (componentName, props, state) => {
  if (isDev) {
    console.group(`[COMPONENT] ${componentName}`)
    console.log('Props:', props)
    console.log('State:', state)
    console.groupEnd()
  }
}

// 路由调试
export const debugRoute = (to, from) => {
  if (isDev) {
    console.log('[ROUTE]', {
      from: from?.path || 'unknown',
      to: to?.path || 'unknown',
      params: to?.params,
      query: to?.query
    })
  }
}

// 网络请求调试
export const debugRequest = (url, options, response) => {
  if (isDev) {
    console.group(`[REQUEST] ${url}`)
    console.log('Options:', options)
    console.log('Response:', response)
    console.groupEnd()
  }
}

// 全局错误处理
export const setupGlobalErrorHandler = () => {
  if (isDev) {
    // Vue错误处理
    window.addEventListener('error', (event) => {
      debugError('Global Error:', event.error)
    })

    // Promise错误处理
    window.addEventListener('unhandledrejection', (event) => {
      debugError('Unhandled Promise Rejection:', event.reason)
    })
  }
}

// 开发环境快捷键
export const setupDevShortcuts = () => {
  if (isDev) {
    // Ctrl+Shift+D 打开调试面板
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        console.clear()
        console.log('🐛 调试面板已打开')
        console.log('可用命令:')
        console.log('- debugLog() - 调试日志')
        console.log('- debugError() - 错误日志')
        console.log('- debugWarn() - 警告日志')
        console.log('- debugComponent() - 组件调试')
        console.log('- debugRoute() - 路由调试')
      }
    })
  }
}
