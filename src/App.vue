<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// 这里可以添加全局逻辑
</script>

<style lang="scss">
// 全局变量
$font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
$text-color: #2c3e50;
$background-color: #f5f5f5;

#app {
  font-family: $font-family;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: $text-color;
  background-color: $background-color;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow-x: hidden;
}

.van-button--primary {
  background: $primary-color !important;
}

.van-dropdown-menu__bar {
  box-shadow: none !important;

}

</style>