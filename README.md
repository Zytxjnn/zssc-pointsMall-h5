# 云积分超市

基于 Vue3 + Pinia + Vant4 构建的云积分超市移动端应用。

## 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **Pinia** - Vue的状态管理库
- **Vant 4** - 移动端Vue组件库
- **Vue Router 4** - Vue官方路由管理器
- **Vite** - 下一代前端构建工具
- **PostCSS** - CSS后处理器，用于移动端适配

## 功能特性

- 📱 移动端适配（px转vw）
- 🎨 基于Vant4的UI组件
- 🔄 Pinia状态管理
- 🛣️ Vue Router路由管理
- 📦 组件自动导入
- 🎯 TypeScript支持（可选）
- 📏 Prettier代码格式化

## 项目结构

```
src/
├── components/          # 公共组件
│   └── TabBar.vue      # 底部导航栏
├── router/             # 路由配置
│   └── index.js
├── stores/             # Pinia状态管理
│   ├── user.js         # 用户状态
│   └── app.js          # 应用状态
├── styles/             # 全局样式
│   └── index.css
├── views/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── About.vue       # 关于页面
│   └── Profile.vue     # 个人中心
├── App.vue             # 根组件
└── main.js             # 入口文件
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 移动端适配

项目使用 `postcss-px-to-viewport` 进行移动端适配，默认设计稿宽度为375px。

## 状态管理

使用Pinia进行状态管理，包含：

- `useUserStore` - 用户信息管理
- `useAppStore` - 应用全局状态管理

## 组件库

使用Vant4组件库，已配置自动导入，无需手动引入组件。

## 开发规范

- 使用Prettier进行代码格式化
- 遵循Vue3 Composition API规范

## 浏览器支持

- iOS Safari >= 10
- Android Chrome >= 51
- 其他现代移动端浏览器
