// 问心页 - 结构化心象回应展示
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useUserStore, useFortuneStore, useChatStore } from '@/stores';
import { getTodayDateString } from '@/services/birthUtils';
import { MAX_ASK_QUESTION_LENGTH } from '@/services/askService';
import { buildAskAnswerFavorite, isFavorited } from '@/services/favoriteService';
import type { AskAnswer, ChatMessage } from '@/types';
import './index.css';

const AskAnswerCard = ({
  answer,
  messageId,
  userId,
  sourceDate,
  onFavorited
}: {
  answer: AskAnswer;
  messageId: string;
  userId: string;
  sourceDate: string;
  onFavorited?: () => void;
}) => {
  const { addFavorite } = useFortuneStore();
  const [favorited, setFavorited] = useState(
    () => isFavorited(userId, 'ask_answer', sourceDate, answer.title)
  );

  const handleFavorite = () => {
    if (favorited) {
      Taro.showToast({ title: '已收藏', icon: 'none' });
      return;
    }
    const item = buildAskAnswerFavorite(userId, answer, sourceDate, messageId);
    const result = addFavorite(item);
    if (result === 'added' || result === 'duplicate') {
      setFavorited(true);
      onFavorited?.();
      Taro.showToast({ title: result === 'added' ? '已收进签亭' : '已收藏', icon: 'success' });
    }
  };

  return (
    <View className="mr-2">
      <Text className="block text-base font-medium neu-cyan mb-3 tracking-wide">{answer.title}</Text>

    <View className="mb-3">
      <Text className="block text-xs neu-muted mb-1">此刻之象</Text>
      <Text className="block text-sm neu-fg leading-relaxed">{answer.observation}</Text>
    </View>

    <View className="mb-3">
      <Text className="block text-xs neu-muted mb-1">内在状态</Text>
      <Text className="block text-sm neu-fg leading-relaxed">{answer.innerState}</Text>
    </View>

    <View className="mb-3">
      <Text className="block text-xs neu-muted mb-2">今日可做</Text>
      {answer.suggestions.map((item) => (
        <Text key={item} className="block text-sm neu-purple leading-relaxed pl-2 mb-1">
          · {item}
        </Text>
      ))}
    </View>

    <View className="neu-pressed-sm rounded-xl p-3 mb-2">
      <Text className="block text-xs neu-muted mb-1">一句提醒</Text>
      <Text className="block text-sm neu-fg italic leading-relaxed">{answer.closingVerse}</Text>
    </View>

    <Text className="block text-xs neu-muted leading-relaxed mt-2">{answer.safetyNote}</Text>

      <View onClick={handleFavorite} className="mt-3 self-start">
        <Text className="text-xs neu-purple">{favorited ? '已收藏' : '收进签亭'}</Text>
      </View>
    </View>
  );
};

const ChatPage = () => {
  const { baziProfile, userProfile, loadUserProfile } = useUserStore();
  const { todayFortune, generateTodayFortune, isLoading: fortuneLoading, clearTodayFortune } = useFortuneStore();
  const { messages, isSending, quickQuestions, loadHistory, sendMessage, error } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const [currentDate] = useState(getTodayDateString);
  const activeTodayFortune = baziProfile && todayFortune?.userId === baziProfile.userId
    ? todayFortune
    : null;

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (!baziProfile || !userProfile) return;
    if (todayFortune && todayFortune.userId !== baziProfile.userId) {
      clearTodayFortune();
      return;
    }
    if (!todayFortune) {
      generateTodayFortune(baziProfile, userProfile, currentDate).catch(() => { /* 本地兜底 */ });
    }
  }, [baziProfile, userProfile, todayFortune, currentDate, generateTodayFortune, clearTodayFortune]);

  useEffect(() => {
    if (baziProfile) {
      loadHistory(baziProfile.userId);
    }
  }, [baziProfile, loadHistory]);

  const handleInput = (value: string) => {
    if (value.length > MAX_ASK_QUESTION_LENGTH) {
      Taro.showToast({ title: `最多 ${MAX_ASK_QUESTION_LENGTH} 字`, icon: 'none' });
      setInputValue(value.slice(0, MAX_ASK_QUESTION_LENGTH));
      return;
    }
    setInputValue(value);
  };

  const handleSend = async () => {
    if (!baziProfile || !userProfile || isSending) return;
    if (!activeTodayFortune) {
      Taro.showToast({ title: '请先生成今日心象', icon: 'none' });
      clearTodayFortune();
      return;
    }
    const content = inputValue.trim();
    if (!content) {
      Taro.showToast({ title: '请先输入问题', icon: 'none' });
      return;
    }
    setInputValue('');
    await sendMessage(baziProfile.userId, content, userProfile, baziProfile, activeTodayFortune);
  };

  const handleQuickQuestion = async (question: string) => {
    if (!baziProfile || !userProfile || isSending) return;
    if (!activeTodayFortune) {
      Taro.showToast({ title: '请先生成今日心象', icon: 'none' });
      clearTodayFortune();
      return;
    }
    await sendMessage(baziProfile.userId, question, userProfile, baziProfile, activeTodayFortune);
  };

  const renderMessage = (msg: ChatMessage) => {
    if (msg.role === 'user') {
      return (
        <Text className="block text-sm leading-relaxed neu-cyan">{msg.content}</Text>
      );
    }
    if (msg.answer) {
      return (
        <AskAnswerCard
          answer={msg.answer}
          messageId={msg.id}
          userId={baziProfile!.userId}
          sourceDate={msg.sourceDate || currentDate}
        />
      );
    }
    return (
      <Text className="block text-sm leading-relaxed neu-fg">{msg.content}</Text>
    );
  };

  if (!baziProfile || !userProfile) {
    return (
      <View className="neu-page min-h-screen flex flex-col justify-center items-center p-4">
        <Text className="block text-lg neu-muted mb-6 tracking-wide">心象未立，请先填写出生信息</Text>
        <View className="neu-raised-sm rounded-2xl px-6 py-3" onClick={() => Taro.redirectTo({ url: '/pages/onboarding/birth' })}>
          <Text className="neu-cyan tracking-wider">填写出生信息</Text>
        </View>
      </View>
    );
  }

  if (!activeTodayFortune) {
    return (
      <View className="neu-page min-h-screen flex flex-col justify-center items-center p-4">
        <Text className="block text-lg neu-muted mb-2 tracking-wide">
          {fortuneLoading ? '正在生成今日心象…' : '请先生成今日心象'}
        </Text>
        {!fortuneLoading && (
          <>
            <Text className="block text-sm neu-muted mb-6 text-center px-4 leading-relaxed">
              先生成今日心象，再叩问此刻。
            </Text>
            <View className="neu-raised-sm rounded-2xl px-6 py-3" onClick={() => Taro.switchTab({ url: '/pages/fortune/today' })}>
              <Text className="neu-cyan tracking-wider">查看今日心象</Text>
            </View>
          </>
        )}
      </View>
    );
  }

  return (
    <View className="chat-container neu-page min-h-screen flex flex-col">
      <View className="neu-raised rounded-3xl m-4 mb-2 p-3">
        <View className="flex items-center gap-3">
          <View className="neu-raised-sm rounded-full px-3 py-1">
            <Text className="text-xs neu-cyan">今日心象</Text>
          </View>
          <Text className="block text-sm neu-fg">{activeTodayFortune.moodKeyword} · 气数 {activeTodayFortune.overallScore}</Text>
        </View>
      </View>

      <View className="flex-1 overflow-auto p-4">
        {messages.length === 0 && (
          <View className="flex flex-col items-center justify-center h-full px-4">
            <Text className="block text-lg neu-fg mb-3 tracking-wide">心有所惑，但问无妨</Text>
            <Text className="block text-sm neu-muted text-center leading-relaxed">
              结合你的心象盘与今日心象，给你一段自我观察回应
            </Text>
            <Text className="block text-sm neu-muted text-center mt-4 leading-relaxed">
              还没有问心记录。{'\n'}当某个问题反复出现时，可以来这里问一问。
            </Text>
          </View>
        )}

        {messages.map((msg) => (
          <View key={msg.id} className={`message-item mb-4 ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
            {msg.role === 'assistant' && (
              <Text className="block text-xs neu-cyan mb-1 ml-1 tracking-wide">心象回应</Text>
            )}
            <View className={`neu-raised-sm rounded-2xl p-3 ${msg.role === 'user' ? 'ml-8' : 'mr-2'}`}>
              {renderMessage(msg)}
            </View>
            <Text className="block text-xs neu-muted mt-1">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </Text>
          </View>
        ))}

        {isSending && (
          <View className="ai-message mb-4">
            <Text className="block text-xs neu-cyan mb-1 ml-1 tracking-wide">心象回应</Text>
            <View className="neu-raised-sm rounded-2xl p-3 mr-8">
              <Text className="block text-sm neu-muted">正在静思…</Text>
            </View>
          </View>
        )}
      </View>

      {error && (
        <View className="px-4 pb-2">
          <Text className="block text-xs neu-pink text-center">{error}</Text>
        </View>
      )}

      <View className="px-4 pb-2">
        <View className="flex flex-col gap-2">
          {quickQuestions.map((question) => (
            <View
              key={question}
              className="neu-raised-sm rounded-2xl px-4 py-3"
              onClick={() => handleQuickQuestion(question)}
            >
              <Text className="text-sm neu-fg leading-relaxed">{question}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="p-4 pb-2">
        <View className="flex gap-3 items-center">
          <View className="flex-1 neu-pressed rounded-2xl px-4 py-2">
            <Input
              className="w-full bg-transparent neu-fg"
              placeholderStyle="color: #aaa39597"
              placeholder="写下你此刻想问的事，例如：今天适合主动沟通吗？"
              value={inputValue}
              maxlength={MAX_ASK_QUESTION_LENGTH}
              onInput={(e) => handleInput(e.detail.value)}
              disabled={isSending}
            />
          </View>
          <View
            onClick={handleSend}
            className={`neu-raised neu-press rounded-2xl h-11 px-4 flex items-center justify-center ${(isSending || !inputValue.trim()) ? 'opacity-50' : ''}`}
          >
            <Text className="neu-cyan text-sm">{isSending ? '静思中' : '叩问此刻'}</Text>
          </View>
        </View>
        <Text className="block text-xs neu-muted text-right mt-1">
          {inputValue.length}/{MAX_ASK_QUESTION_LENGTH}
        </Text>
      </View>

      <View className="px-4 pb-4 text-center">
        <Text className="block text-xs neu-muted">
          问心会将你的问题、心象摘要与今日心象发送至服务端用于生成回复
        </Text>
        <Text className="block text-xs neu-muted mt-1">
          内容仅作传统文化与自我观察参考，不构成现实决策建议
        </Text>
      </View>
    </View>
  );
};

export default ChatPage;
