import { API_CONFIG, ERROR_MESSAGES } from '../config/constants'
import {
  mockFaqList,
  mockQuickQuestions,
  mockAIResponses,
  mockDefaultResponse,
  mockWelcomeMessage,
  mockSystemInfo,
} from '../data/mockData'

// 是否使用假資料模式（開發階段設為 true，對接後端後改為 false）
const USE_MOCK_DATA = true

// 模擬網路延遲
const simulateNetworkDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 通用 API 請求函數（實際對接後端時使用）
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: API_CONFIG.TIMEOUT,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('API Request Error:', error)
    return {
      success: false,
      error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    }
  }
}

// ===== FAQ 相關 API =====

/**
 * 獲取常見問題列表
 * @returns {Promise<Object>} 常見問題列表
 */
export const getFaqList = async () => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay(300)
    return {
      success: true,
      data: mockFaqList,
    }
  }

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
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay(200)
    const faq = mockFaqList.find(f => f.id === faqId)
    return {
      success: true,
      data: faq || null,
    }
  }

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
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay(200)
    return {
      success: true,
      data: mockQuickQuestions,
    }
  }

  return apiRequest(API_CONFIG.ENDPOINTS.QUICK_QUESTIONS, {
    method: 'GET',
  })
}

// ===== 聊天相關 API =====

/**
 * 發送訊息給 AI
 * @param {string} message - 使用者訊息
 * @param {string} sessionId - 會話 ID（可選）
 * @returns {Promise<Object>} AI 回覆
 */
export const sendChatMessage = async (message, sessionId = null) => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay(1500)
    
    // 查找匹配的回覆
    const response = mockAIResponses[message] || mockDefaultResponse
    
    return {
      success: true,
      data: {
        ...response.data,
        sessionId: sessionId || `session_${Date.now()}`,
      }
    }
  }

  return apiRequest(API_CONFIG.ENDPOINTS.CHAT_SEND, {
    method: 'POST',
    body: JSON.stringify({
      message,
      sessionId,
      timestamp: new Date().toISOString(),
    }),
  })
}

/**
 * 獲取聊天歷史記錄
 * @param {string} sessionId - 會話 ID
 * @returns {Promise<Object>} 聊天歷史
 */
export const getChatHistory = async (sessionId) => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay(300)
    return {
      success: true,
      data: {
        sessionId,
        messages: [],
      }
    }
  }

  return apiRequest(`${API_CONFIG.ENDPOINTS.CHAT_HISTORY}/${sessionId}`, {
    method: 'GET',
  })
}

/**
 * 建立新的聊天會話
 * @returns {Promise<Object>} 新會話資訊
 */
export const createNewChat = async () => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay(200)
    return {
      success: true,
      data: {
        sessionId: `session_${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
    }
  }

  return apiRequest(API_CONFIG.ENDPOINTS.CHAT_NEW, {
    method: 'POST',
  })
}

// ===== 系統資訊相關 API =====

/**
 * 獲取歡迎訊息
 * @returns {Promise<Object>} 歡迎訊息
 */
export const getWelcomeMessage = async () => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay(200)
    return mockWelcomeMessage
  }

  return apiRequest(API_CONFIG.ENDPOINTS.SYSTEM_INFO, {
    method: 'GET',
  })
}

/**
 * 獲取系統資訊
 * @returns {Promise<Object>} 系統資訊
 */
export const getSystemInfo = async () => {
  if (USE_MOCK_DATA) {
    await simulateNetworkDelay(100)
    return mockSystemInfo
  }

  return apiRequest(API_CONFIG.ENDPOINTS.SYSTEM_INFO, {
    method: 'GET',
  })
}

// 匯出設定狀態，方便其他模組檢查
export const isUsingMockData = () => USE_MOCK_DATA
