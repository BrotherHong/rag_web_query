// API 配置
export const API_CONFIG = {
  // 後端 API 基礎 URL（請根據實際後端地址修改）
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  
  // API 端點
  ENDPOINTS: {
    // 常見問題相關
    FAQ_LIST: '/faq/list',
    FAQ_DETAIL: '/faq/detail',
    
    // AI 聊天相關
    CHAT_SEND: '/chat/send',
    CHAT_HISTORY: '/chat/history',
    CHAT_NEW: '/chat/new',
    
    // 快速問題
    QUICK_QUESTIONS: '/questions/quick',
    
    // 系統資訊
    SYSTEM_INFO: '/system/info',
  },
  
  // 請求超時設定（毫秒）
  TIMEOUT: 30000,
}

// 應用程式常數
export const APP_CONSTANTS = {
  // 應用名稱
  APP_NAME: '人事室AI助手',
  APP_SUBTITLE: '智能化人事服務，讓管理更高效',
  
  // 成功大學資訊
  UNIVERSITY: {
    NAME: '國立成功大學',
    NAME_EN: 'National Cheng Kung University',
    LOGO_PATH: '/images/ncku_logo.png',
  },
  
  // 聯絡資訊
  CONTACT: {
    PHONE: '(06) 275-7575',
    EXTENSION: '50200',
    EMAIL: 'hr@ncku.edu.tw',
  },
  
  // UI 設定
  UI: {
    // 打字效果延遲（毫秒）
    TYPING_DELAY: 1500,
    // 訊息最大長度
    MAX_MESSAGE_LENGTH: 2000,
  },
}

// 錯誤訊息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '網路連線發生錯誤，請檢查您的網路連線。',
  SERVER_ERROR: '伺服器發生錯誤，請稍後再試。',
  TIMEOUT_ERROR: '請求逾時，請稍後再試。',
  INVALID_REQUEST: '請求格式錯誤，請重新嘗試。',
  UNKNOWN_ERROR: '發生未知錯誤，請稍後再試。',
}

// 成功訊息
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: '訊息已送出',
  CHAT_CREATED: '已建立新對話',
  DATA_LOADED: '資料載入成功',
}
