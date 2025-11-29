import { API_CONFIG, ERROR_MESSAGES } from '../config/constants'

// 儲存當前處室識別（由 DepartmentContext 設定）
let currentDeptSlug = null
let currentDeptId = null

export const setCurrentDepartment = (deptSlug, deptId = null) => {
  currentDeptSlug = deptSlug
  currentDeptId = deptId
}

export const getCurrentDepartment = () => currentDeptSlug
export const getCurrentDepartmentId = () => currentDeptId

// 通用 API 請求函數
const apiRequest = async (endpoint, options = {}) => {
  try {
    // 構建完整 URL
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // 後端統一返回格式處理
    // 如果後端返回 { success: true, data: ... } 格式
    if (data.success !== undefined) {
      return data
    }
    
    // 如果後端直接返回資料，包裝成統一格式
    return { success: true, data }
  } catch (error) {
    console.error('API Request Error:', error)
    return {
      success: false,
      error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    }
  }
}

// ===== 處室相關 API =====

/**
 * 獲取所有處室列表
 * @param {Object} params - 查詢參數
 * @param {number} params.page - 頁碼
 * @param {number} params.limit - 每頁數量
 * @param {string} params.search - 搜尋關鍵字
 * @returns {Promise<Object>} 處室列表
 */
export const getDepartmentList = async (params = {}) => {
  const { page = 1, limit = 100, search = '' } = params
  const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
  if (search) queryParams.append('search', search)
  
  return apiRequest(`/departments/?${queryParams.toString()}`, {
    method: 'GET',
  })
}

/**
 * 根據 slug 獲取處室資訊
 * @param {string} deptSlug - 處室識別碼 (hr, acc, ga)
 * @returns {Promise<Object>} 處室詳細資訊
 */
export const getDepartmentInfo = async (deptSlug) => {
  try {
    // 使用新的 by-slug 端點直接獲取處室資訊
    const result = await apiRequest(`/departments/by-slug/${deptSlug}`, {
      method: 'GET',
    })
    
    if (result.success && result.data) {
      // 後端已經返回完整資訊，直接使用
      return result
    } else {
      return { success: false, error: result.error || '處室不存在' }
    }
  } catch (error) {
    console.error('Get Department Info Error:', error)
    return { success: false, error: error.message }
  }
}

// ===== FAQ 相關 API =====
// 注意：這些 API 需要根據實際後端接口調整

/**
 * 獲取常見問題列表
 * @returns {Promise<Object>} 常見問題列表
 */
export const getFaqList = async () => {
  // TODO: 根據實際後端 API 調整
  // 可能需要處室過濾：/departments/${currentDeptId}/faq
  return apiRequest(API_CONFIG.ENDPOINTS.FAQ_LIST, {
    method: 'GET',
  })
}

// ===== 快速問題相關 API =====

/**
 * 獲取快速問題列表
 * @returns {Promise<Object>} 快速問題列表
 */
export const getQuickQuestions = async () => {
  // TODO: 根據實際後端 API 調整
  return apiRequest(API_CONFIG.ENDPOINTS.QUICK_QUESTIONS, {
    method: 'GET',
  })
}

// ===== 聊天相關 API (RAG) =====

/**
 * 發送訊息給 AI (RAG 查詢)
 * @param {string} message - 使用者訊息
 * @returns {Promise<Object>} AI 回覆
 */
export const sendChatMessage = async (message) => {
  return apiRequest('/rag/query', {
    method: 'POST',
    body: JSON.stringify({
      query: message,
      scope_ids: currentDeptId ? [currentDeptId] : []
    }),
  })
}

// ===== 系統資訊相關 API =====

/**
 * 獲取歡迎訊息
 * @returns {Promise<Object>} 歡迎訊息
 */
export const getWelcomeMessage = async () => {
  return apiRequest('/public/welcome', {
    method: 'GET',
  })
}
