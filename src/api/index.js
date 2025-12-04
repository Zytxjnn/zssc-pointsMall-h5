import { request } from '@/utils/http'

// 用户相关API
export const userApi = {
  // 用户登录
  login(data) {
    return request.post('/UserAccess/Login', data)
  },
  // 用户注册
  register(data) {
    return request.post('/UserAccess/Register', data)
  },

  // 获取用户信息
  getUserInfo() {
    return request.get('/User/Get')
  },
  // 更新用户信息
  updateUserInfo(data) {
    return request.post('/User/Update', data)
  },
  // 用户退出登录
  logout() {
    return request.post('/auth/logout')
  },
  // 修改密码
  changePassword(data) {
    return request.post('/user/change-password', data)
  },
  // 单位列表
  getCompanyList(params) {
    return request.get('/User/GetCompanyDropDownList', params)
  },
  getCrewList(params) {
    return request.get('/User/GetCrewDropDownList', params)
  },
  // 获取用户当前积分
  getScoreInfo() {
    return request.get('/User/GetScore')
  },
  // 获取积分
  getScore() {
    return request.get('/User/GetScore')
  },
}

export const homeApi = {
  // 获取首页数据
  getScoreList(params) {
    return request.get('/Home/GetScoreList', params)
  },
  // 待整改列表
  getActionList(params) {
    return request.get('/Home/GetActionList', params)
  },
  // 待复核列表
  getApprovalList(params) {
    return request.get('/Home/GetApprovalList', params)
  }
}

// 积分相关API
export const pointsApi = {
  // 获取货柜信息
  getScoreRedeem(params) {
    return request.get('/ScoreRedeem/Get', params)
  },
  // 获取货道商品详情
  getChannelDetail(params) {
    return request.get('/ScoreRedeem/GetChannel', params)
  },
  // 获取积分记录
  getPointsRecord(params) {
    return request.get('/points/record', params)
  },
  // 获取积分收入记录
  getIncomeRecord(params) {
    return request.get('/points/income', params)
  },

  // 获取积分兑换记录
  getExchangeRecord(params) {
    return request.get('/User/GetScoreRedeemList', params)
  },
  // 积分事件列表
  getScoreEventList(params) {
    return request.get('/User/GetScoreEventList', params)
  },
  // 积分兑换商品
  exchangeProduct(data) {
    return request.post('/ScoreRedeem/Redeem', data)
  },

  // 获取积分商品列表
  getProductList(params) {
    return request.get('/points/products', params)
  }
}

// 危险源相关API
export const riskApi = {
  // 获取隐患一级类型
  getRiskRegisterTypeTreeList(params) {
    return request.get('/Risk/RiskRegisterTypeTreeList', params)
  },
  // 获取隐患二级类型
  getRiskLevelList(params) {
    return request.get('/Risk/RiskLevelList', params)
  },
  // 获取隐患内容列表
  getRiskRegisterList(params) {
    return request.get('/Risk/RiskRegisterList', params)
  },
  // 上报危险源
  reportHazard(data) {
    return request.post('/Risk/Add', data)
  },
  // 整改报告
  submitRectification(data) {
    return request.post('/hazard/rectification', data)
  },
  // 审核危险源
  reviewHazard(data) {
    return request.post('/hazard/review', data)
  },
  // 隐患详情
  getRiskDetail(params) {
    return request.get('/Risk/Get', params)
  },
  // 获取隐患列表
  getRiskList(params) {
    return request.get('/Risk/List', params)
  },
  // 获取隐患列表角标数量
  getRiskListCornerMark(params) {
    return request.get('/Risk/GetCornerMark', params)
  },
  doRiskAction(data) {
    return request.post('/Risk/Action', data)
  },
  // 上传整改成果
  doAction(data) {
    return request.post('/Risk/Action', data)
  },
  // 复核整改成果
  doAudit(data) {
    return request.post('/Risk/Audit', data)
  },
  // 获取整改人列表
  getActionOwnerList(params) {
    return request.get('/Risk/GetActionOwnerList', params)
  },
  // 获取复核人列表
  getApproverList(params) {
    return request.get('/Risk/GetApproverList', params)
  }
}

// 培训模块相关API
export const trainingApi = {
  // 获取培训类型树
  getTrainingTypeTreeList(params) {
    return request.get('/Training/TrainingTypeTreeList', params)
  },
  // 获取培训列表
  getTrainingList(params) {
    return request.get('/Training/List', params)
  },
  // 获取培训详情
  getTrainingDetail(id) {
    return request.get('/Training/Get', { id })
  },
  // 提交培训
  submitTraining(data) {
    return request.post('/Training/Submit', data)
  }
}

// 文件上传相关API
export const uploadApi = {
  // 上传图片
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.upload('/FileInfo/PrivateUploadImage', formData)
  },
  uploadBatchImages(files) {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('Files', file)
    })
    return request.upload('/FileInfo/PrivateBatchUploadImage', formData)
  },

  // 上传文档
  uploadDocument(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.upload('/upload/document', formData)
  }
}
// 岗位相关API
export const postApi = {
  // 获取用户列表
  getUserList(data) {
    return request.post('/User/GetUserList', data)
  }
}

// 考试相关API
export const examApi = {
  // 获取考试类型
  getExamTypeList(params) {
    return request.get('/Exam/ExamTypeTreeList', params)
  },
  // 获取考试列表
  getExamList(params) {
    return request.get('/Exam/List', params)
  },
  // 获取考试详情
  getExamDetail(params) {
    return request.get('/Exam/Get', params)
  },
  // 提交考试
  examSubmit(data) {
    return request.post('/Exam/Submit', data)
  }

}

// 导出所有API
export default {
  userApi,
  pointsApi,
  riskApi,
  trainingApi,
  uploadApi,
  postApi,
  examApi
}
