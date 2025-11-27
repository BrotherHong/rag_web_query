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
  
  return apiRequest(`/departments?${queryParams.toString()}`, {
    method: 'GET',
  })
}

/**
 * 根據 ID 獲取處室資訊
 * @param {number} deptId - 處室 ID
 * @returns {Promise<Object>} 處室詳細資訊
 */
export const getDepartmentById = async (deptId) => {
  return apiRequest(`/departments/${deptId}`, {
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

// 輔助函數：獲取預設顏色
const getDefaultColor = (deptSlug) => {
  const colors = {
    'hr': '#DC2626',
    'acc': '#10B981',
    'ga': '#F59E0B'
  }
  return colors[deptSlug] || '#6B7280'
}

// 輔助函數：獲取預設聯絡資訊
const getDefaultContact = (deptSlug) => {
  const contacts = {
    'hr': {
      phone: '(06) 275-7575',
      extension: '50200',
      email: 'hr@ncku.edu.tw'
    },
    'acc': {
      phone: '(06) 275-7575',
      extension: '50300',
      email: 'acc@ncku.edu.tw'
    },
    'ga': {
      phone: '(06) 275-7575',
      extension: '50400',
      email: 'ga@ncku.edu.tw'
    }
  }
  return contacts[deptSlug] || {
    phone: '(06) 275-7575',
    extension: '50000',
    email: 'info@ncku.edu.tw'
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

/**
 * 獲取常見問題詳情
 * @param {number} faqId - 問題 ID
 * @returns {Promise<Object>} 問題詳情
 */
export const getFaqDetail = async (faqId) => {
  return apiRequest(`${API_CONFIG.ENDPOINTS.FAQ_DETAIL}/${faqId}`, {
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
 * @param {string} sessionId - 會話 ID（暫未使用，保留以便未來擴展）
 * @returns {Promise<Object>} AI 回覆
 */
export const sendChatMessage = async (message, sessionId = null) => {
  return apiRequest('/rag/query', {
    method: 'POST',
    body: JSON.stringify({
      query: message,
      scope: 'department', // 限制在處室範圍
      scope_ids: currentDeptId ? [currentDeptId] : [],
      query_type: 'semantic', // semantic, simple, hybrid
      top_k: 5
    }),
  })
}

/**
 * 獲取聊天歷史記錄
 * @param {string} sessionId - 會話 ID
 * @returns {Promise<Object>} 聊天歷史
 */
export const getChatHistory = async (sessionId) => {
  return apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_HISTORY}/${sessionId}`, {
    method: 'GET',
  })
}

/**
 * 建立新的聊天會話
 * @returns {Promise<Object>} 新會話資訊
 */
export const createNewChat = async () => {
  return apiRequest(API_CONFIG.ENDPOINTS.CHAT_NEW, {
    method: 'POST',
  })
}

/**
 * 獲取 RAG 查詢歷史
 * @param {Object} params - 查詢參數
 * @param {number} params.page - 頁碼
 * @param {number} params.limit - 每頁數量
 * @param {string} params.search - 搜尋關鍵字
 * @returns {Promise<Object>} 查詢歷史列表
 */
export const getQueryHistory = async (params = {}) => {
  const { page = 1, limit = 10, search = '' } = params
  const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
  if (search) queryParams.append('search', search)
  
  return apiRequest(`/rag/history?${queryParams.toString()}`, {
    method: 'GET',
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

/**
 * 獲取系統資訊
 * @returns {Promise<Object>} 系統資訊
 */
export const getSystemInfo = async () => {
  return apiRequest('/public/info', {
    method: 'GET',
  })
}

// ===== 認證相關 API =====
// 注意：查詢介面可能不需要認證，根據實際需求調整

/**
 * 用戶登入（如果需要）
 * @param {string} username - 用戶名
 * @param {string} password - 密碼
 * @returns {Promise<Object>} 登入結果
 */
export const login = async (username, password) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

/**
 * 用戶登出（如果需要）
 * @returns {Promise<Object>} 登出結果
 */
export const logout = async () => {
  return apiRequest('/auth/logout', {
    method: 'POST',
  })
}
