// 今日运势页 - 核心页面，展示每日运势
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserStore, useFortuneStore } from '@/stores';
import { saveFavorite } from '@/services/storageService';
import type { FavoriteAdvice } from '@/types';
import './today.css';

const TodayPage = () => {
  const { baziProfile } = useUserStore();
  const { todayFortune, currentExplanation, explanationLoading, generateTodayFortune, getYiJiExplanation, isLoading } = useFortuneStore();
  
  // 当前日期
  const [currentDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  
  // 加载今日运势
  useEffect(() => {
    if (baziProfile) {
      generateTodayFortune(baziProfile, currentDate);
    }
  }, [baziProfile, currentDate, generateTodayFortune]);
  
  // 点击宜忌项
  const handleItemClick = async (item: string, type: 'yi' | 'ji') => {
    if (!baziProfile || !todayFortune) return;
    
    await getYiJiExplanation(baziProfile, todayFortune, item, type);
  };

  // 收藏建议
  const handleFavorite = (type: 'summary' | 'action' | 'blessing' | 'yi' | 'ji', content: string) => {
    if (!baziProfile || !todayFortune) return;
    
    const favorite: FavoriteAdvice = {
      id: `fav_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      userId: baziProfile.userId,
      dailyFortuneId: todayFortune.id,
      content,
      type,
      createdAt: new Date().toISOString()
    };
    
    saveFavorite(favorite);
    Taro.showToast({ title: '已收藏', icon: 'success' });
  };

  // 重新生成
  const handleRegenerate = async () => {
    if (!baziProfile) return;
    await generateTodayFortune(baziProfile, currentDate);
  };

  // AI 解读
  const handleAIChat = () => {
    Taro.switchTab({ url: '/pages/chat/index' });
  };

  // 设置提醒
  const handleSetReminder = () => {
    Taro.navigateTo({ url: '/pages/reminder/index' });
  };

  // 分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-cyan-400';
    if (score >= 70) return 'text-purple-400';
    return 'text-pink-400';
  };

  if (!baziProfile) {
    return (
      <View className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <Text className="block text-lg text-slate-400 mb-4">请先生成灵频档案</Text>
        <Button onClick={() => Taro.redirectTo({ url: '/pages/onboarding/birth' })}>
          <Text className="text-white">开始生成</Text>
        </Button>
      </View>
    );
  }

  if (!todayFortune) {
    return (
      <View className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <Text className="block text-lg text-slate-400">{isLoading ? '正在生成今日灵频...' : '加载中...'}</Text>
      </View>
    );
  }

  return (
    <View className="today-container min-h-screen bg-slate-900 p-4 pb-12">
      {/* 顶部日期 */}
      <View className="mb-4 flex justify-between items-center">
        <Text className="block text-sm text-slate-400">{currentDate}</Text>
        <Badge className="bg-purple-500 bg-opacity-30 text-purple-300">{todayFortune.moodKeyword}</Badge>
      </View>

      {/* 综合分数 */}
      <Card className="mb-6 bg-gradient-to-br from-gray-800 bg-opacity-50 to-cyan-900 bg-opacity-30 border-cyan-500 border-opacity-30">
        <CardContent className="p-6 flex flex-col items-center">
          <View className="score-ring relative w-24 h-24 flex items-center justify-center">
            <View className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 bg-opacity-20 to-purple-500 bg-opacity-20" />
            <View className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
              <Text className={`block text-3xl font-bold ${getScoreColor(todayFortune.overallScore)}`}>
                {todayFortune.overallScore}
              </Text>
            </View>
          </View>
          <Text className="block text-lg text-slate-300 mt-3">今日灵频指数</Text>
        </CardContent>
      </Card>

      {/* 运势摘要 */}
      <Card className="mb-6 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <View className="flex justify-between items-start mb-2">
            <Text className="block text-sm text-slate-400">运势摘要</Text>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleFavorite('summary', todayFortune.summary)}
            >
              <Text className="text-xs text-cyan-400">收藏</Text>
            </Button>
          </View>
          <Text className="block text-base text-slate-200 leading-relaxed">{todayFortune.summary}</Text>
        </CardContent>
      </Card>

      {/* 今日宜忌 */}
      <Card className="mb-6 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <View className="grid grid-cols-2 gap-4">
            {/* 今日宜 */}
            <View>
              <Text className="block text-sm text-cyan-400 mb-2">今日宜</Text>
              <View className="space-y-2">
                {todayFortune.yi.map((item) => (
                  <Dialog key={item}>
                    <DialogTrigger asChild>
                      <Badge 
                        className="bg-cyan-500 bg-opacity-20 text-cyan-300 border-cyan-400 border-opacity-30 cursor-pointer"
                        onClick={() => handleItemClick(item, 'yi')}
                      >
                        {item}
                      </Badge>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-cyan-500 border-opacity-30">
                      <DialogHeader>
                        <DialogTitle className="text-cyan-400">{item} - 解释</DialogTitle>
                      </DialogHeader>
                      <Text className="block text-sm text-slate-300 leading-relaxed">
                        {explanationLoading ? '正在生成解释...' : currentExplanation || '点击查看解释'}
                      </Text>
                    </DialogContent>
                  </Dialog>
                ))}
              </View>
            </View>
            
            {/* 今日忌 */}
            <View>
              <Text className="block text-sm text-pink-400 mb-2">今日忌</Text>
              <View className="space-y-2">
                {todayFortune.ji.map((item) => (
                  <Dialog key={item}>
                    <DialogTrigger asChild>
                      <Badge 
                        className="bg-pink-500 bg-opacity-20 text-pink-300 border-pink-400 border-opacity-30 cursor-pointer"
                        onClick={() => handleItemClick(item, 'ji')}
                      >
                        {item}
                      </Badge>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-pink-500 border-opacity-30">
                      <DialogHeader>
                        <DialogTitle className="text-pink-400">{item} - 解释</DialogTitle>
                      </DialogHeader>
                      <Text className="block text-sm text-slate-300 leading-relaxed">
                        {explanationLoading ? '正在生成解释...' : currentExplanation || '点击查看解释'}
                      </Text>
                    </DialogContent>
                  </Dialog>
                ))}
              </View>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* 幸运元素 */}
      <Card className="mb-6 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <Text className="block text-sm text-slate-400 mb-3">今日幸运元素</Text>
          <View className="grid grid-cols-3 gap-4">
            <View className="flex flex-col items-center p-3 rounded-xl bg-gray-900 bg-opacity-50">
              <Text className="block text-xs text-slate-500 mb-1">幸运色</Text>
              <Text className="block text-lg text-cyan-400">{todayFortune.luckyColor}</Text>
            </View>
            <View className="flex flex-col items-center p-3 rounded-xl bg-gray-900 bg-opacity-50">
              <Text className="block text-xs text-slate-500 mb-1">幸运数字</Text>
              <Text className="block text-lg text-purple-400">{todayFortune.luckyNumber}</Text>
            </View>
            <View className="flex flex-col items-center p-3 rounded-xl bg-gray-900 bg-opacity-50">
              <Text className="block text-xs text-slate-500 mb-1">幸运方向</Text>
              <Text className="block text-lg text-pink-400">{todayFortune.luckyDirection}</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* 行动建议 */}
      <Card className="mb-6 bg-gradient-to-br from-gray-800 bg-opacity-50 to-purple-900 bg-opacity-30 border-purple-500 border-opacity-30">
        <CardContent className="p-4">
          <View className="flex justify-between items-start mb-2">
            <Text className="block text-sm text-purple-400">今日行动建议</Text>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleFavorite('action', todayFortune.actionSuggestion)}
            >
              <Text className="text-xs text-purple-400">收藏</Text>
            </Button>
          </View>
          <Text className="block text-base text-slate-200 leading-relaxed">{todayFortune.actionSuggestion}</Text>
        </CardContent>
      </Card>

      {/* 赛博祝福语 */}
      <Card className="mb-6 bg-gradient-to-br from-cyan-900 bg-opacity-30 to-purple-900 bg-opacity-30 border-cyan-500 border-opacity-30">
        <CardContent className="p-4">
          <View className="flex justify-between items-start mb-2">
            <Text className="block text-sm text-cyan-400">赛博祝福</Text>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleFavorite('blessing', todayFortune.cyberBlessing)}
            >
              <Text className="text-xs text-cyan-400">收藏</Text>
            </Button>
          </View>
          <Text className="block text-base text-slate-200 leading-relaxed italic">{todayFortune.cyberBlessing}</Text>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <View className="grid grid-cols-2 gap-4 mt-6">
        <Button onClick={handleAIChat} variant="outline" className="h-10 border-cyan-500 border-opacity-30">
          <Text className="text-cyan-400">AI 解读</Text>
        </Button>
        <Button onClick={handleRegenerate} variant="outline" className="h-10 border-purple-500 border-opacity-30">
          <Text className="text-purple-400">重新生成</Text>
        </Button>
      </View>

      {/* 设置提醒 */}
      <Button onClick={handleSetReminder} variant="ghost" className="w-full mt-4">
        <Text className="text-slate-400">设置每日提醒</Text>
      </Button>

      {/* 底部说明 */}
      <View className="mt-6 text-center">
        <Text className="block text-xs text-slate-500">
          以上内容仅供娱乐参考，不构成命运预测
        </Text>
      </View>
    </View>
  );
};

export default TodayPage;