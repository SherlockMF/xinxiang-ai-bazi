// 八字档案页 - 展示四柱、五行能量、性格标签等
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/stores';
import './bazi.css';

const BaziPage = () => {
  const { userProfile, baziProfile, loadUserProfile, isLoading } = useUserStore();

  useEffect(() => {
    // 加载用户档案
    loadUserProfile();
  }, [loadUserProfile]);

  // 如果没有档案，跳转到出生信息页
  useEffect(() => {
    if (!isLoading && !userProfile) {
      Taro.redirectTo({ url: '/pages/onboarding/birth' });
    }
  }, [isLoading, userProfile]);

  const handleViewTodayFortune = () => {
    // 跳转到今日运势页
    Taro.switchTab({ url: '/pages/fortune/today' });
  };

  // 五行能量颜色
  const elementColors: Record<string, string> = {
    wood: '#22c55e',
    fire: '#ef4444',
    earth: '#eab308',
    metal: '#94a3b8',
    water: '#3b82f6'
  };

  if (!baziProfile) {
    return (
      <View className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <Text className="block text-lg text-slate-400">加载中...</Text>
      </View>
    );
  }

  return (
    <View className="bazi-container min-h-screen bg-slate-900 p-4 pb-8">
      {/* 顶部标题 */}
      <View className="mb-6">
        <Text className="block text-2xl font-bold text-cyan-400">你的灵频档案</Text>
        <Text className="block text-sm text-slate-400 mt-2">基于八字算法生成，仅供娱乐参考</Text>
      </View>

      {/* 四柱展示 */}
      <Card className="mb-6 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <Text className="block text-sm text-slate-400 mb-4">四柱命盘</Text>
          <View className="grid grid-cols-4 gap-2">
            {/* 年柱 */}
            <View className="pillar-cell flex flex-col items-center p-3 rounded-xl bg-gray-900 bg-opacity-50">
              <Text className="block text-xs text-slate-500 mb-1">年柱</Text>
              <Text className="block text-lg font-mono text-cyan-400">{baziProfile.yearPillar}</Text>
            </View>
            {/* 月柱 */}
            <View className="pillar-cell flex flex-col items-center p-3 rounded-xl bg-gray-900 bg-opacity-50">
              <Text className="block text-xs text-slate-500 mb-1">月柱</Text>
              <Text className="block text-lg font-mono text-purple-400">{baziProfile.monthPillar}</Text>
            </View>
            {/* 日柱 */}
            <View className="pillar-cell flex flex-col items-center p-3 rounded-xl bg-gray-900 bg-opacity-50 border border-pink-400 border-opacity-30">
              <Text className="block text-xs text-slate-500 mb-1">日柱</Text>
              <Text className="block text-lg font-mono text-pink-400">{baziProfile.dayPillar}</Text>
            </View>
            {/* 时柱 */}
            <View className="pillar-cell flex flex-col items-center p-3 rounded-xl bg-gray-900 bg-opacity-50">
              <Text className="block text-xs text-slate-500 mb-1">时柱</Text>
              <Text className="block text-lg font-mono text-cyan-400">{baziProfile.hourPillar}</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* 日主 */}
      <Card className="mb-6 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <Text className="block text-sm text-slate-400 mb-2">日主（你）</Text>
          <View className="flex items-center gap-4">
            <View className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Text className="block text-3xl font-bold text-white">{baziProfile.dayMaster}</Text>
            </View>
            <View className="flex-1">
              <Text className="block text-lg text-slate-200">日干为 {baziProfile.dayMaster}</Text>
              <Text className="block text-sm text-slate-400 mt-1">代表你在这个命盘中的核心能量</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* 五行能量 */}
      <Card className="mb-6 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <Text className="block text-sm text-slate-400 mb-4">五行能量分布</Text>
          <View className="space-y-3">
            {Object.entries(baziProfile.fiveElements).map(([element, value]) => (
              <View key={element} className="flex items-center gap-3">
                <Text className="block text-sm text-slate-300 w-8">
                  {element === 'wood' ? '木' : 
                   element === 'fire' ? '火' : 
                   element === 'earth' ? '土' : 
                   element === 'metal' ? '金' : '水'}
                </Text>
                <View className="flex-1">
                  <View 
                    className="relative h-3 w-full overflow-hidden rounded-full bg-gray-700"
                  >
                    <View 
                      className="h-full transition-all"
                      style={{ 
                        width: `${value}%`,
                        backgroundColor: elementColors[element]
                      }}
                    />
                  </View>
                </View>
                <Text className="block text-sm text-slate-400 w-10">{value}%</Text>
              </View>
            ))}
          </View>
          
          {/* 喜用五行 */}
          <View className="mt-4 pt-4 border-t border-gray-700">
            <Text className="block text-sm text-slate-400 mb-2">喜用五行</Text>
            <View className="flex gap-2">
              {baziProfile.favorableElements.map((element) => (
                <Badge key={element} className="bg-cyan-500 bg-opacity-30 text-cyan-400 border-cyan-400 border-opacity-30">
                  {element === 'wood' ? '木' : 
                   element === 'fire' ? '火' : 
                   element === 'earth' ? '土' : 
                   element === 'metal' ? '金' : '水'}
                </Badge>
              ))}
            </View>
          </View>
        </CardContent>
      </Card>

      {/* 性格标签 */}
      <Card className="mb-6 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <Text className="block text-sm text-slate-400 mb-3">性格标签</Text>
          <View className="flex flex-wrap gap-2">
            {baziProfile.personalityTags.map((tag) => (
              <Badge key={tag} className="bg-purple-500 bg-opacity-30 text-purple-300 border-purple-400 border-opacity-30">
                {tag}
              </Badge>
            ))}
          </View>
        </CardContent>
      </Card>

      {/* 命盘摘要 */}
      <Card className="mb-6 bg-gradient-to-br from-gray-800 from-opacity-50 to-purple-900 to-opacity-30 border-purple-500 border-opacity-20">
        <CardContent className="p-4">
          <Text className="block text-sm text-slate-400 mb-2">命盘摘要</Text>
          <Text className="block text-base text-slate-200 leading-relaxed">{baziProfile.summary}</Text>
        </CardContent>
      </Card>

      {/* 查看今日运势按钮 */}
      <Button
        onClick={handleViewTodayFortune}
        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl border-0 shadow-lg shadow-cyan-500 shadow-opacity-30"
      >
        <Text className="block text-lg font-medium text-white">查看今日灵频</Text>
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

export default BaziPage;