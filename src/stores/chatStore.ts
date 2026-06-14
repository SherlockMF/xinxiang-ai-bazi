// 对话状态管理 - chatStore
// 管理 AI 对话消息和历史

import { create } from 'zustand';
import type { ChatMessage, BaziProfile, DailyFortune } from '../types';
import { saveChatMessage, getChatHistory, clearChatHistory } from '../services/storageService';
import { llmProvider } from '../services/llmProvider';
import { getQuickQuestions } from '../services/llmPromptUtils';

interface ChatState {
  // 对话消息列表
  messages: ChatMessage[];
  // 快捷问题
  quickQuestions: string[];
  // 发送状态
  isSending: boolean;
  // 错误信息
  error: string | null;
  
  // Actions
  // 加载历史消息
  loadHistory: (userId: string) => void;
  // 发送消息
  sendMessage: (userId: string, content: string, bazi: BaziProfile, fortune: DailyFortune | null) => Promise<void>;
  // 添加消息（不调用 AI）
  addMessage: (message: ChatMessage) => void;
  // 清除历史
  clearHistory: () => void;
  // 设置错误
  setError: (error: string | null) => void;
  // 获取快捷问题
  getQuickQuestions: () => string[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  quickQuestions: getQuickQuestions(),
  isSending: false,
  error: null,
  
  loadHistory: (userId: string) => {
    const history = getChatHistory(userId);
    set({ messages: history });
  },
  
  sendMessage: async (userId: string, content: string, bazi: BaziProfile, fortune: DailyFortune | null) => {
    set({ isSending: true, error: null });
    
    // 创建用户消息
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      userId,
      dailyFortuneId: fortune?.id,
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    };
    
    // 保存用户消息
    saveChatMessage(userMessage);
    set({ messages: [...get().messages, userMessage] });
    
    try {
      // 获取历史消息（不包括刚添加的）
      const history = get().messages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      }));
      
      // 调用 AI
      const aiResponse = await llmProvider.chatWithContext(
        content,
        bazi as unknown as Record<string, unknown>,
        (fortune || {}) as Record<string, unknown>,
        history
      );
      
      // 创建 AI 消息
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        userId,
        dailyFortuneId: fortune?.id,
        role: 'assistant',
        content: aiResponse,
        createdAt: new Date().toISOString()
      };
      
      // 保存 AI 消息
      saveChatMessage(aiMessage);
      set({ messages: [...get().messages, aiMessage], isSending: false });
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'AI 回复失败';
      
      // 创建兜底回复
      const fallbackMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai_fallback`,
        userId,
        dailyFortuneId: fortune?.id,
        role: 'assistant',
        content: `我理解你的问题。基于你的命盘特点，我的建议是：保持觉知，顺应流，不要过度用力。记住，命运不是固定的剧本，你始终拥有选择的空间。这只是情绪陪伴，不是绝对的指导。`,
        createdAt: new Date().toISOString()
      };
      
      saveChatMessage(fallbackMessage);
      set({ 
        messages: [...get().messages, fallbackMessage], 
        isSending: false, 
        error: errorMsg 
      });
    }
  },
  
  addMessage: (message: ChatMessage) => {
    saveChatMessage(message);
    set({ messages: [...get().messages, message] });
  },
  
  clearHistory: () => {
    clearChatHistory();
    set({ messages: [] });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  getQuickQuestions: () => {
    return getQuickQuestions();
  }
}));