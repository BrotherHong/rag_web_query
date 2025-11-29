import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getQuickQuestions, sendChatMessage, getWelcomeMessage } from '../services/api'
import { useDepartment } from '../contexts/DepartmentContext'
import { APP_CONSTANTS } from '../config/constants'

function ChatPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { department, deptSlug } = useDepartment()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [quickQuestions, setQuickQuestions] = useState([])

  // 從後端獲取快速問題列表
  useEffect(() => {
    const fetchQuickQuestions = async () => {
      try {
        const response = await getQuickQuestions()
        if (response.success) {
          setQuickQuestions(response.data)
        } else {
          console.error('Failed to fetch quick questions:', response.error)
          setQuickQuestions([])
        }
      } catch (error) {
        console.error('Error fetching quick questions:', error)
        setQuickQuestions([])
      }
    }

    fetchQuickQuestions()
  }, [])

  // 獲取 AI 回覆
  const getAIResponse = async (question) => {
    try {
      const response = await sendChatMessage(question)
      if (response.success) {
        // 後端 RAG API 返回格式：{ query, answer, sources, ... }
        return response.data.answer || response.data.message || '無法取得回覆'
      } else {
        console.error('API Error:', response.error)
        return '抱歉，系統發生錯誤，請稍後再試。'
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      return '抱歉，系統發生錯誤，請稍後再試。'
    }
  }

  // 滾動到最新訊息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 處理從首頁帶來的問題
  useEffect(() => {
    const initializeChat = async () => {
      if (location.state?.question) {
        // 如果有問題，直接發送問題，不顯示歡迎訊息
        const userMessage = {
          id: Date.now(),
          text: location.state.question,
          sender: 'user',
          timestamp: new Date()
        }
        setMessages([userMessage])
        setIsTyping(true)

        try {
          const aiResponseText = await getAIResponse(location.state.question)
          const aiResponse = {
            id: Date.now() + 1,
            text: aiResponseText,
            sender: 'ai',
            timestamp: new Date()
          }
          // 直接設置完整的訊息陣列，而不是使用 prev
          setMessages([userMessage, aiResponse])
        } catch (error) {
          console.error('Error in initializeChat:', error)
          const errorResponse = {
            id: Date.now() + 1,
            text: '抱歉，系統發生錯誤，請稍後再試。',
            sender: 'ai',
            timestamp: new Date()
          }
          // 直接設置完整的訊息陣列，而不是使用 prev
          setMessages([userMessage, errorResponse])
        } finally {
          setIsTyping(false)
        }
      } else {
        // 沒有問題時，從後端獲取初始歡迎訊息
        try {
          const response = await getWelcomeMessage()
          if (response.success) {
            setMessages([{
              id: 1,
              text: response.data.message,
              sender: 'ai',
              timestamp: new Date()
            }])
          }
        } catch (error) {
          console.error('Error fetching welcome message:', error)
          // 使用預設歡迎訊息
          setMessages([{
            id: 1,
            text: '您好！我是人事室 AI 助手 👋\n\n我可以協助您處理各種人事相關問題。請問有什麼我可以幫助您的嗎？',
            sender: 'ai',
            timestamp: new Date()
          }])
        }
      }
    }

    initializeChat()
  }, [])

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // 呼叫後端 API 獲取 AI 回覆
    try {
      const aiResponseText = await getAIResponse(messageText)
      
      const aiResponse = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error in handleSendMessage:', error)
      // 錯誤處理
      const errorResponse = {
        id: Date.now() + 1,
        text: '抱歉，系統發生錯誤，請稍後再試。',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickQuestion = (question) => {
    handleSendMessage(question)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewChat = async () => {
    // 獲取新的歡迎訊息
    try {
      const response = await getWelcomeMessage()
      if (response.success) {
        setMessages([{
          id: Date.now(),
          text: '已開始新對話！\n\n' + response.data.message,
          sender: 'ai',
          timestamp: new Date()
        }])
      } else {
        setMessages([{
          id: Date.now(),
          text: '已開始新對話！有什麼我可以幫助您的嗎？',
          sender: 'ai',
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Error in handleNewChat:', error)
      setMessages([{
        id: Date.now(),
        text: '已開始新對話！有什麼我可以幫助您的嗎？',
        sender: 'ai',
        timestamp: new Date()
      }])
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-white via-red-50 to-white flex overflow-hidden">
      {/* 側邊欄 */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col overflow-hidden shadow-lg`}>
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => navigate(`/${deptSlug}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors mb-4 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>返回首頁</span>
          </button>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-all shadow-md cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>新對話</span>
          </button>
        </div>

        {/* 快速問題 */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">快速問題</h3>
          <div className="space-y-2">
            {quickQuestions.map((item) => (
              <button
                key={item.id || item.question}
                onClick={() => handleQuickQuestion(item.question)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span>{item.question}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 使用說明 */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-xs text-gray-500 space-y-1">
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              24/7 全天候服務
            </p>
            <p className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              安全加密對話
            </p>
          </div>
        </div>
      </div>

      {/* 主聊天區域 */}
      <div className="flex-1 flex flex-col h-full">
        {/* 頂部導航欄 */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200 p-1">
                  <img 
                    src={APP_CONSTANTS.UNIVERSITY.LOGO_PATH}
                    alt={APP_CONSTANTS.UNIVERSITY.NAME}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-gray-800 font-semibold">{department ? department.name + ' AI助手' : APP_CONSTANTS.APP_NAME}</h2>
                  <p className="text-sm text-gray-500">線上服務中</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="匯出對話">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="更多選項">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 訊息區域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex gap-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* 頭像 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
                    : 'bg-white border border-gray-200 p-1'
                }`}>
                  {message.sender === 'user' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <img 
                      src={APP_CONSTANTS.UNIVERSITY.LOGO_PATH}
                      alt={APP_CONSTANTS.UNIVERSITY.NAME}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* 訊息內容 */}
                <div className={`rounded-2xl px-4 py-3 shadow-md ${
                  message.sender === 'user'
                    ? 'bg-red-100 border border-red-200'
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="text-gray-800 whitespace-pre-line">{message.text}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {message.timestamp.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* 正在輸入指示器 */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex gap-3 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center p-1">
                  <img 
                    src={APP_CONSTANTS.UNIVERSITY.LOGO_PATH}
                    alt={APP_CONSTANTS.UNIVERSITY.NAME}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 輸入區域 */}
        <div className="border-t border-gray-200 p-4 bg-white/80 backdrop-blur-sm flex-shrink-0 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="附加檔案">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="輸入您的問題..."
                  rows="1"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-none"
                />
              </div>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all shadow-md cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              按 Enter 發送訊息，Shift + Enter 換行
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
