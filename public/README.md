# 静态文件目录

这个目录用于存放项目的静态文件，包括图片、图标、字体等资源。

## 目录结构

- `images/` - 存放图片文件（jpg, png, gif, svg等）
- `icons/` - 存放图标文件
- `assets/` - 存放其他静态资源文件

## 使用方法

在 Vue 组件中引用这些文件时，可以直接使用相对路径：

```vue
<template>
  <img src="/images/avatar.jpg" alt="头像" />
</template>
```

或者在 CSS 中：

```css
.background {
  background-image: url('/images/background.jpg');
}
```

## 注意事项

- 放在 `public` 目录下的文件会被直接复制到构建输出目录
- 文件路径以 `/` 开头表示从网站根目录开始
- 建议使用有意义的文件名和目录结构来组织文件







