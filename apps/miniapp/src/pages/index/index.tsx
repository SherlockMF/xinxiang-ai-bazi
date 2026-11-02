// 欢迎页 - 心象启动入口（固定首页：首次去录入生辰，已有本心则直入今日心象）
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import { getProfiles, migrateLegacyProfileIfNeeded } from '@/services/storageService';
import './index.css';

const IndexPage = () => {
  // 是否已有本心（已填过生辰）
  const [hasProfile, setHasProfile] = useState(false);

  // 每次显示时检查本地是否已有本心（含旧数据迁移）
  useDidShow(() => {
    migrateLegacyProfileIfNeeded();
    setHasProfile(getProfiles().length > 0);
  });

  const handleStartScan = () => {
    if (hasProfile) {
      // 已填过生辰：直接进入今日心象（tabBar 页用 switchTab）
      Taro.switchTab({ url: '/pages/fortune/today' });
    } else {
      // 首次：去录入生辰
      Taro.navigateTo({ url: '/pages/onboarding/birth' });
    }
  };

  return (
    <View className="welcome-container neu-page min-h-screen flex flex-col justify-between items-center p-6">
      {/* 顶部标题：凸起圆盘 + 内嵌文字 */}
      <View className="w-full flex flex-col items-center pt-16 gap-3">
        <View className="neu-raised rounded-3xl px-10 py-6">
          <Text className="block text-5xl font-bold neu-cyan tracking-widest">
            心　象
          </Text>
        </View>
        <Text className="block text-sm neu-muted tracking-[0.4em]">叩问天地 · 静观自心</Text>
      </View>

      {/* 中间 Slogan */}
      <View className="flex flex-col items-center gap-4">
        <Text className="block text-xl neu-fg text-center tracking-widest">
          天地有大美而不言
        </Text>
        <Text className="block text-xl neu-pink text-center tracking-widest">
          且静候今日心象
        </Text>

        {/* 装饰线条：凹陷细槽 */}
        <View className="neu-pressed-sm w-32 h-2 rounded-full mt-4" />
      </View>

      {/* 底部按钮和声明 */}
      <View className="w-full flex flex-col gap-8 pb-10">
        {/* 启动按钮：凸起药丸，按压时下陷 */}
        <View
          onClick={handleStartScan}
          onTap={handleStartScan}
          onTouchEnd={handleStartScan}
          className="neu-raised neu-press w-full h-14 rounded-full flex items-center justify-center"
          style={{ cursor: 'pointer', touchAction: 'manipulation' }}
        >
          <Text className="block text-lg font-medium neu-cyan tracking-[0.3em]">
            {hasProfile ? '进入今日心象' : '叩问今日心象'}
          </Text>
        </View>

        {/* 免责声明 */}
        <Text className="block text-xs neu-muted text-center leading-relaxed tracking-wide">
          所言皆为遣怀清心之趣{'\n'}非关休咎，不作决断之凭
        </Text>
      </View>
    </View>
  );
};

export default IndexPage;
