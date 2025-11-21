export default {
  plugins: {
    'postcss-px-to-viewport': {
      unitToConvert: 'px',
      viewportWidth: 375,
      viewportHeight: 667,
      unitPrecision: 5,
      propList: ['*'],
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      selectorBlackList: [],
      minPixelValue: 1,
      mediaQuery: false,
      replace: true,
      exclude: [/node_modules/],
      include: undefined,
      landscape: false,
      landscapeUnit: 'vw',
      landscapeWidth: 568
    }
  }
}

const arr = [{name: '张三', age: 18}, {name: '李四', age: 20}, {name: '王五', age: 22}]
console.log(arr[0].name)