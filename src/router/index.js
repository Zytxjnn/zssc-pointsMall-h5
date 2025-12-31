import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: {
      title: '注册'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      title: '个人中心'
    }
  },
  // 暂时隐藏设置页面
  // {
  //   path: '/settings',
  //   name: 'Settings',
  //   component: () => import('@/views/Settings.vue'),
  //   meta: {
  //     title: '设置'
  //   }
  // },
  {
    path: '/exchange-record',
    name: 'ExchangeRecord',
    component: () => import('@/views/ExchangeRecord.vue'),
    meta: {
      title: '兑换记录'
    }
  },
  {
    path: '/income-record',
    name: 'IncomeRecord',
    component: () => import('@/views/IncomeRecord.vue'),
    meta: {
      title: '积分收入记录'
    }
  },
  {
    path: '/points-exchange',
    name: 'PointsExchange',
    component: () => import('@/views/PointsExchange.vue'),
    meta: {
      title: '积分兑换'
    }
  },
  // 备用货柜/兑换（供应商切换）
  {
    path: '/weimi-points-exchange',
    name: 'WeimiPointsExchange',
    component: () => import('@/views/WeimiPointsExchange.vue'),
    meta: {
      title: '积分兑换'
    }
  },
  {
    path: '/weimi-product-detail/:id',
    name: 'WeimiProductDetail',
    component: () => import('@/views/WeimiProductDetail.vue'),
    meta: {
      title: '商品详情'
    }
  },
  {
    path: '/weimi-exchange-result',
    name: 'WeimiExchangeResult',
    component: () => import('@/views/WeimiExchangeResult.vue'),
    meta: {
      title: '兑换结果'
    }
  },
  {
    path: '/product-detail/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: {
      title: '商品详情'
    }
  },
  {
    path: '/exchange-result',
    name: 'ExchangeResult',
    component: () => import('@/views/ExchangeResult.vue'),
    meta: {
      title: '兑换结果'
    }
  },
  {
    path: '/learning-platform',
    name: 'LearningPlatform',
    component: () => import('@/views/LearningPlatform.vue'),
    meta: {
      title: '学习平台'
    }
  },
  {
    path: '/training-detail/:id',
    name: 'TrainingDetail',
    component: () => import('@/views/TrainingDetail.vue'),
    meta: {
      title: '培训内容'
    }
  },
  {
    path: '/training-detail-wx/:id',
    name: 'TrainingDetailWx',
    component: () => import('@/views/TrainingDetailWx.vue'),
    meta: {
      title: '培训内容'
    }
  },
  {
    path: '/online-learning/:id',
    name: 'OnlineLearning',
    component: () => import('@/views/OnlineLearning.vue'),
    meta: {
      title: '在线学习'
    }
  },
  {
    path: '/quiz-center',
    name: 'QuizCenter',
    component: () => import('@/views/QuizCenter.vue'),
    meta: {
      title: '答题中心'
    }
  },
  {
    path: '/quiz-detail/:id',
    name: 'QuizDetail',
    component: () => import('@/views/QuizDetail.vue'),
    meta: {
      title: '试卷内容'
    }
  },
  {
    path: '/quiz-result/:id',
    name: 'QuizResult',
    component: () => import('@/views/QuizResult.vue'),
    meta: {
      title: '考试结果'
    }
  },
  {
    path: '/hazard-report',
    name: 'HazardReport',
    component: () => import('@/views/HazardReport.vue'),
    meta: {
      title: '隐患上报'
    }
  },
  {
    path: '/hazard-ledger',
    name: 'HazardLedger',
    component: () => import('@/views/HazardLedger.vue'),
    meta: {
      title: '隐患列表'
    }
  },
  {
    path: '/hazard-detail/:id',
    name: 'HazardDetail',
    component: () => import('@/views/HazardDetail.vue'),
    meta: {
      title: '隐患详情'
    }
  },
  {
    path: '/rectification-report/:id',
    name: 'RectificationReport',
    component: () => import('@/views/RectificationReport.vue'),
    meta: {
      title: '上报成果'
    }
  },
  {
    path: '/hazard-review-detail/:id',
    name: 'HazardReviewDetail',
    component: () => import('@/views/HazardReviewDetail.vue'),
    meta: {
      title: '隐患详情（待复核）'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: {
      title: '关于我们'
    }
  },
  {
    path: '/user-agreement',
    name: 'UserAgreement',
    component: () => import('@/views/UserAgreement.vue'),
    meta: {
      title: '用户服务协议'
    }
  },
  {
    path: '/privacy-policy',
    name: 'PrivacyPolicy',
    component: () => import('@/views/PrivacyPolicy.vue'),
    meta: {
      title: '隐私政策'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查登录状态（除了登录和注册页面）
  const isLoginPage = to.path === '/login' || to.path === '/register'
  
  const userStore = useUserStore()

  // 允许匿名访问的页面
  const allowAnonymous = to.name === 'TrainingDetailWx' || to.name === 'UserAgreement' || to.name === 'PrivacyPolicy'

  if (!isLoginPage && !allowAnonymous && !userStore.isLogin) {
    // 检查本地存储中是否有token
    const token = localStorage.getItem('token')
    if (!token) {
      // 没有token，跳转到登录页
      if (to.path === '/points-exchange') {
        next({
          path: '/login',
          query: {
            returnUrl: to.fullPath
          }
        })
      } else {
        next('/login')
      }
      return
    }
  }
  
  next()
})

export default router
