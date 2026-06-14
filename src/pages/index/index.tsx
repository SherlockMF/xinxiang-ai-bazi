// 欢迎页 - 赛博灵频启动入口
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect } from 'react';
import { useUserStore } from '@/stores';
import './index.css';

const IndexPage = () => {
  const { userProfile, baziProfile, loadUserProfile } = useUserStore();

  useEffect(() => {
    // 加载用户档案
    loadUserProfile();
  }, [loadUserProfile]);

  const handleStartScan = () => {
    // 如果已有用户档案，直接跳转到八字档案页
    if (userProfile && baziProfile) {
      Taro.redirectTo({ url: '/pages/profile/bazi' });
    } else {
      // 否则跳转到出生信息页
      Taro.navigateTo({ url: '/pages/onboarding/birth' });
    }
  };

  return (
    <View className="welcome-container min-h-screen bg-slate-900 flex flex-col justify-between items-center p-6">
      {/* 背景渐变网格 */}
      <View className="absolute inset-0 bg-gradient-cyber opacity-20" />
      
      {/* 顶部装饰 */}
      <View className="w-full flex justify-center pt-8">
        <View className="relative">
          {/* 霓虹光晕效果 */}
          <View className="absolute -inset-4 bg-cyan-500 bg-opacity-30 rounded-full blur-xl animate-pulse-slow" />
          {/* 标题 */}
          <Text className="block text-5xl font-bold text-cyan-400 tracking-wider relative z-10">
            赛博灵频
          </Text>
        </View>
      </View>

      {/* 中间 Slogan */}
      <View className="flex flex-col items-center gap-4 mt-20">
        <Text className="block text-xl text-slate-300 text-center tracking-wide">
          在霓虹与命盘之间
        </Text>
        <Text className="block text-xl text-pink-400 text-center tracking-wide">
          接收今日灵频
        </Text>
        
        {/* 装饰线条 */}
        <View className="w-32 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 mt-4" />
      </View>

      {/* 底部按钮和声明 */}
      <View className="w-full flex flex-col gap-6 mt-8 pb-8">
        {/* 启动按钮 */}
        <View
          onClick={handleStartScan}
          className="w-full h-12 flex items-center justify-center bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-lg"
          style={{ cursor: 'pointer' }}
        >
          <Text className="block text-lg font-medium text-white">
            启动灵频扫描
          </Text>
        </View>

        {/* 免责声明 */}
        <Text className="block text-xs text-slate-500 text-center leading-relaxed">
          内容仅供娱乐、情绪陪伴与自我觉察{'\n'}不构成现实决策建议
        </Text>
      </View>
    </View>
  );
};

export default IndexPage;