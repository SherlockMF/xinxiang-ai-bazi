// 对话状态管理 - chatStore

import { create } from 'zustand';
import type { ChatMessage, BaziProfile, DailyFortune, UserProfile, AskAnswer } from '../types';
import { saveChatMessage, getChatHistory, clearChatHistory } from '../services/storageService';
import {
  buildAskRequest,
  formatAnswerForHistory,
  GENERAL_FALLBACK_ANSWER,
  MAX_ASK_QUESTION_LENGTH,
  sendAskQuestion,
  inferQuestionType
} from '../services/askService';
import { getQuickQuestions } from '../services/llmPromptUtils';

interface ChatState {
  messages: ChatMessage[];
  quickQuestions: string[];
  isSending: boolean;
  error: string | null;

  loadHistory: (userId: string) => void;
  sendMessage: (
    userId: string,
    content: string,
    userProfile: UserProfile,
    bazi: BaziProfile,
    fortune: DailyFortune
  ) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  clearHistory: () => void;
  setError: (error: string | null) => void;
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

  sendMessage: async (userId, content, userProfile, bazi, fortune) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    if (trimmed.length > MAX_ASK_QUESTION_LENGTH) {
      set({ error: `问题不能超过 ${MAX_ASK_QUESTION_LENGTH} 字` });
      return;
    }

    set({ isSending: true, error: null });

    const questionType = inferQuestionType(trimmed);
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      userId,
      dailyFortuneId: fortune.id,
      role: 'user',
      content: trimmed,
      questionType,
      sourceDate: fortune.date,
      createdAt: new Date().toISOString()
    };

    saveChatMessage(userMessage);
    set({ messages: [...get().messages, userMessage] });

    try {
      const history = get().messages
        .filter(m => m.id !== userMessage.id)
        .slice(-6)
        .map(m => ({
          role: m.role,
          content: m.role === 'assistant' && m.answer
            ? formatAnswerForHistory(m.answer)
            : m.content
        }));

      const request = buildAskRequest(userId, trimmed, userProfile, bazi, fortune, history);
      const answer: AskAnswer = await sendAskQuestion(request);

      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        userId,
        dailyFortuneId: fortune.id,
        role: 'assistant',
        content: answer.title,
        answer,
        sourceDate: fortune.date,
        createdAt: new Date().toISOString()
      };

      saveChatMessage(aiMessage);
      set({ messages: [...get().messages, aiMessage], isSending: false });
    } catch {
      const fallback = { ...GENERAL_FALLBACK_ANSWER, source: 'fallback' as const };
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai_fallback`,
        userId,
        dailyFortuneId: fortune.id,
        role: 'assistant',
        content: fallback.title,
        answer: fallback,
        sourceDate: fortune.date,
        createdAt: new Date().toISOString()
      };
      saveChatMessage(aiMessage);
      set({ messages: [...get().messages, aiMessage], isSending: false });
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

  getQuickQuestions: () => getQuickQuestions()
}));
