import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true,
    }),
    Components({
      resolvers: [VantResolver()],
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    // 开发服务器配置
    cors: true,
    // 启用源码映射
    sourcemapIgnoreList: false,
    // 强制预构建依赖
    force: true,
  },
  // 开发环境配置
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
  // CSS配置
  css: {
    devSourcemap: true, // 启用CSS源码映射
    preprocessorOptions: {
      scss: {
        // 确保SCSS源码映射
        sourceMap: true,
        // 自动导入变量文件
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 生产环境也生成源码映射，方便调试
    sourcemap: mode === 'development' ? true : 'hidden',
    // 开发环境不压缩代码
    minify: mode === 'production' ? 'esbuild' : false,
    // CSS压缩配置
    cssMinify: mode === 'production',
    rollupOptions: {
      output: {
        chunkFileNames: mode === 'development' ? 'js/[name].js' : 'js/[name]-[hash].js',
        entryFileNames: mode === 'development' ? 'js/[name].js' : 'js/[name]-[hash].js',
        assetFileNames: mode === 'development' ? '[ext]/[name].[ext]' : '[ext]/[name]-[hash].[ext]',
        // 保持源码结构
        manualChunks: undefined,
      },
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'vant'],
  },
}))
