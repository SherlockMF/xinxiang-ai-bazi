// AI追问页 - 用户可以追问运势相关问题
import { View, Text } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUserStore, useFortuneStore, useChatStore } from '@/stores';
import './index.css';

const ChatPage = () => {
  const { baziProfile, loadUserProfile } = useUserStore();
  const { todayFortune } = useFortuneStore();
  const { messages, isSending, quickQuestions, loadHistory, sendMessage } = useChatStore();
  
  // 输入框内容（受控）
  const [inputValue, setInputValue] = useState('');

  // 页面进入时从本地恢复档案（防止刷新后状态丢失）
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (baziProfile) {
      loadHistory(baziProfile.userId);
    }
  }, [baziProfile, loadHistory]);

  // 发送消息
  const handleSend = async () => {
    // 防止空内容和发送中重复提交
    if (!baziProfile || isSending) return;
    const content = inputValue.trim();
    if (!content) return;

    // 发送成功后清空输入框
    setInputValue('');
    await sendMessage(baziProfile.userId, content, baziProfile, todayFortune);
  };

  // 点击快捷问题
  const handleQuickQuestion = async (question: string) => {
    if (!baziProfile || isSending) return;
    await sendMessage(baziProfile.userId, question, baziProfile, todayFortune);
  };

  // 输入框变化
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  if (!baziProfile) {
    return (
      <View className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <Text className="block text-lg text-slate-400">请先生成灵频档案</Text>
      </View>
    );
  }

  return (
    <View className="chat-container min-h-screen bg-slate-900 flex flex-col">
      {/* 顶部运势摘要 */}
      {todayFortune && (
        <Card className="m-4 mb-2 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
          <CardContent className="p-3">
            <View className="flex items-center gap-2">
              <Badge className="bg-cyan-500 bg-opacity-30 text-cyan-400">今日</Badge>
              <Text className="block text-sm text-slate-300">分数 {todayFortune.overallScore} | {todayFortune.moodKeyword}</Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* 对话消息列表 */}
      <View className="flex-1 overflow-auto p-4">
        {/* 空状态提示 */}
        {messages.length === 0 && (
          <View className="flex flex-col items-center justify-center h-full">
            <Text className="block text-lg text-slate-400 mb-4">有什么想问的吗？</Text>
            <Text className="block text-sm text-slate-500">基于你的灵频档案和今日运势</Text>
          </View>
        )}

        {/* 消息列表 */}
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            className={`message-item mb-4 ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <Card 
              className={msg.role === 'user' 
                ? 'bg-cyan-500 bg-opacity-20 border-cyan-400 border-opacity-30 ml-8' 
                : 'bg-purple-500 bg-opacity-20 border-purple-400 border-opacity-30 mr-8'
              }
            >
              <CardContent className="p-3">
                <Text className="block text-sm text-slate-300 leading-relaxed">{msg.content}</Text>
              </CardContent>
            </Card>
            <Text className="block text-xs text-slate-500 mt-1">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </Text>
          </View>
        ))}

        {/* 发送中状态 */}
        {isSending && (
          <View className="ai-message mb-4">
            <Card className="bg-purple-500 bg-opacity-20 border-purple-400 border-opacity-30 mr-8">
              <CardContent className="p-3">
                <Text className="block text-sm text-slate-400">正在思考...</Text>
              </CardContent>
            </Card>
          </View>
        )}
      </View>

      {/* 快捷问题 */}
      <View className="px-4 pb-2">
        <View className="flex gap-2 overflow-x-auto">
          {quickQuestions.map((question) => (
            <Badge 
              key={question}
              className="bg-gray-800 bg-opacity-50 text-slate-300 border-gray-600 border-opacity-30 cursor-pointer whitespace-nowrap"
              onClick={() => handleQuickQuestion(question)}
            >
              {question}
            </Badge>
          ))}
        </View>
      </View>

      {/* 输入框 */}
      <View className="p-4 pb-6 border-t border-gray-800">
        <View className="flex gap-2">
          <View className="flex-1 bg-gray-800 bg-opacity-50 rounded-xl px-4 py-2 border border-gray-700">
            <Input
              className="w-full bg-transparent text-slate-100"
              placeholder="输入你的问题..."
              value={inputValue}
              onInput={(e) => handleInputChange(e.detail.value)}
              disabled={isSending}
            />
          </View>
          <Button
            onClick={handleSend}
            disabled={isSending || !inputValue.trim()}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl"
          >
            <Text className="text-white">{isSending ? '发送中' : '发送'}</Text>
          </Button>
        </View>
      </View>

      {/* 底部说明 */}
      <View className="px-4 pb-2 text-center">
        <Text className="block text-xs text-slate-500">
          AI 追问会将你的问题、八字摘要和今日运势发送至服务端用于生成回复
        </Text>
        <Text className="block text-xs text-slate-500 mt-1">
          AI 回复仅供娱乐参考，不构成决策建议
        </Text>
      </View>
    </View>
  );
};

export default ChatPage;