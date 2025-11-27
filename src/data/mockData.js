// 假資料 - 模擬後端 API 回應
// 在實際對接後端時，這些資料將被後端 API 取代

// 常見問題列表（模擬 GET /api/faq/list 的回應）
export const mockFaqList = [
  {
    id: 1,
    question: '如何查詢我的請假紀錄？',
    description: '查看個人請假歷史及剩餘額度',
    icon: 'question',
    category: 'leave',
  },
  {
    id: 2,
    question: '薪資單何時會發放？',
    description: '了解薪資發放時間及查詢方式',
    icon: 'question',
    category: 'salary',
  },
  {
    id: 3,
    question: '如何申請加班費？',
    description: '加班申請流程及核銷注意事項',
    icon: 'question',
    category: 'overtime',
  },
  {
    id: 4,
    question: '如何更新個人聯絡資訊？',
    description: '修改電話、地址等基本資料',
    icon: 'question',
    category: 'profile',
  },
  {
    id: 5,
    question: '年度考核時間及流程？',
    description: '了解考核評估標準及時程安排',
    icon: 'question',
    category: 'evaluation',
  },
  {
    id: 6,
    question: '忘記員工系統密碼怎麼辦？',
    description: '密碼重設及帳號相關問題',
    icon: 'question',
    category: 'account',
  },
]

// 快速問題列表（模擬 GET /api/questions/quick 的回應）
export const mockQuickQuestions = [
  '如何查詢請假紀錄？',
  '薪資發放時間',
  '如何申請加班費？',
  '忘記密碼怎麼辦？',
  '年度考核流程',
  '更新聯絡資訊',
]

// AI 回覆資料庫（模擬 POST /api/chat/send 的回應）
export const mockAIResponses = {
  '如何查詢我的請假紀錄？': {
    success: true,
    data: {
      message: '您可以透過以下步驟查詢請假紀錄：\n\n1. 登入人事系統\n2. 點擊「個人資料」選單\n3. 選擇「請假管理」\n4. 即可查看完整的請假歷史紀錄及剩餘額度\n\n如需進一步協助，請提供您的員工編號，我會為您查詢詳細資訊。',
      timestamp: new Date().toISOString(),
      messageId: 'msg_001',
    }
  },
  '薪資單何時會發放？': {
    success: true,
    data: {
      message: '薪資發放時間如下：\n\n📅 每月5日發放上個月薪資\n💰 如遇假日則提前至最近的工作日\n📧 薪資單會在發放日前一天以Email寄送\n\n您可以在人事系統的「薪資查詢」區查看歷史薪資明細。',
      timestamp: new Date().toISOString(),
      messageId: 'msg_002',
    }
  },
  '如何申請加班費？': {
    success: true,
    data: {
      message: '加班費申請流程：\n\n1. 事前填寫加班申請單\n2. 經主管核准後執行加班\n3. 加班結束後於系統登記時數\n4. 每月10日前完成申請\n5. 隔月與薪資一併發放\n\n注意：未經核准的加班恕不予計算。',
      timestamp: new Date().toISOString(),
      messageId: 'msg_003',
    }
  },
  '如何更新個人聯絡資訊？': {
    success: true,
    data: {
      message: '更新聯絡資訊步驟：\n\n1. 登入人事系統\n2. 進入「個人資料維護」\n3. 更新電話、地址等資訊\n4. 送出後等待人事室審核\n5. 審核通過後即完成更新\n\n如需緊急更改，請直接聯繫人事室。',
      timestamp: new Date().toISOString(),
      messageId: 'msg_004',
    }
  },
  '年度考核時間及流程？': {
    success: true,
    data: {
      message: '年度考核相關資訊：\n\n📋 考核時間：每年12月\n📝 考核項目：工作表現、專業能力、團隊合作\n⭐ 評等：優等、甲等、乙等、丙等\n🎯 獎懲：影響年終獎金及升遷\n\n詳細評核表將於11月發送至各部門。',
      timestamp: new Date().toISOString(),
      messageId: 'msg_005',
    }
  },
  '忘記員工系統密碼怎麼辦？': {
    success: true,
    data: {
      message: '密碼重設方式：\n\n方法一：自助重設\n1. 點擊登入頁面的「忘記密碼」\n2. 輸入員工編號和註冊Email\n3. 收取驗證碼並重設密碼\n\n方法二：聯繫IT部門\n📞 分機：1234\n📧 Email: it@company.com\n\n建議定期更換密碼以確保帳號安全。',
      timestamp: new Date().toISOString(),
      messageId: 'msg_006',
    }
  },
}

// 預設 AI 回覆（當問題不在資料庫中時）
export const mockDefaultResponse = {
  success: true,
  data: {
    message: '感謝您的詢問。\n\n我已收到您的問題，正在為您查詢相關資訊。這個問題可能需要人工處理，我們會盡快為您提供詳細的答覆。\n\n如有緊急需求，請直接撥打人事室專線：(06) 275-7575 分機 50200。',
    timestamp: new Date().toISOString(),
    messageId: 'msg_default',
  }
}

// 歡迎訊息（模擬 GET /api/system/info 的回應）
export const mockWelcomeMessage = {
  success: true,
  data: {
    message: '您好！我是人事室 AI 助手 👋\n\n我可以協助您處理各種人事相關問題，例如：\n• 請假查詢\n• 薪資問題\n• 加班申請\n• 個人資料更新\n• 考核相關\n\n請問有什麼我可以幫助您的嗎？',
    timestamp: new Date().toISOString(),
    features: [
      '24/7 全天候服務',
      '安全加密對話',
      '即時回應',
    ],
  }
}

// 系統資訊
export const mockSystemInfo = {
  success: true,
  data: {
    appName: '人事室AI助手',
    version: '1.0.0',
    status: 'online',
    lastUpdate: '2025-10-16',
  }
}
