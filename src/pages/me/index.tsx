// 我的页面 - 用户中心，各种入口
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUserStore, useFortuneStore, useChatStore } from '@/stores';
import { clearAllData } from '@/services/storageService';
import './index.css';

const MePage = () => {
  const { baziProfile, clearAll, loadUserProfile } = useUserStore();
  const { clearFavorites } = useFortuneStore();
  const { clearHistory } = useChatStore();
  
  // 删除确认弹窗
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // 导航到各页面
  const navigateTo = (url: string) => {
    if (url.includes('bazi')) {
      Taro.navigateTo({ url: '/pages/profile/bazi' });
    } else {
      Taro.navigateTo({ url });
    }
  };

  // 清除所有数据
  const handleClearData = () => {
    clearAll();
    clearFavorites();
    clearHistory();
    clearAllData();
    setShowDeleteConfirm(false);
    Taro.showToast({ title: '数据已清除', icon: 'success' });
    // 跳转到欢迎页
    setTimeout(() => {
      Taro.redirectTo({ url: '/pages/index/index' });
    }, 1500);
  };

  return (
    <View className="me-container min-h-screen bg-slate-900 p-4 pb-8">
      {/* 顶部标题 */}
      <View className="mb-6">
        <Text className="block text-2xl font-bold text-cyan-400">我的</Text>
      </View>

      {/* 用户信息卡片 */}
      {baziProfile && (
        <Card className="mb-6 bg-gradient-to-br from-gray-800 bg-opacity-50 to-cyan-900 bg-opacity-30 border-cyan-500 border-opacity-20">
          <CardContent className="p-4">
            <View className="flex items-center gap-4">
              {/* 头像/日主 */}
              <View className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <Text className="block text-xl font-bold text-white">{baziProfile.dayMaster}</Text>
              </View>
              <View className="flex-1">
                <Text className="block text-lg text-slate-200">日主 {baziProfile.dayMaster}</Text>
                <Text className="block text-sm text-slate-400 mt-1">
                  {baziProfile.yearPillar} · {baziProfile.monthPillar} · {baziProfile.dayPillar} · {baziProfile.hourPillar}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      )}

      {/* 功能入口列表 */}
      <Card className="mb-6 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-0">
          {/* 八字档案 */}
          <View 
            className="menu-item flex justify-between items-center p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => navigateTo('/pages/profile/bazi')}
          >
            <Text className="block text-base text-slate-200">我的八字档案</Text>
            <Text className="text-cyan-400">→</Text>
          </View>
          
          {/* 收藏 */}
          <View 
            className="menu-item flex justify-between items-center p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => Taro.switchTab({ url: '/pages/favorites/index' })}
          >
            <Text className="block text-base text-slate-200">我的收藏</Text>
            <Text className="text-cyan-400">→</Text>
          </View>
          
          {/* 提醒设置 */}
          <View 
            className="menu-item flex justify-between items-center p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => navigateTo('/pages/reminder/index')}
          >
            <Text className="block text-base text-slate-200">提醒设置</Text>
            <Text className="text-cyan-400">→</Text>
          </View>
          
          {/* 隐私说明 */}
          <View 
            className="menu-item flex justify-between items-center p-4 border-b border-gray-700 cursor-pointer"
            onClick={() => Taro.showModal({
              title: '隐私说明',
              content: '本产品所有数据仅存储在你的本地设备中，我们不会收集、上传或分享你的任何个人信息。八字档案和运势内容仅供娱乐参考，不构成任何现实决策建议。',
              showCancel: false,
              confirmText: '我知道了'
            })}
          >
            <Text className="block text-base text-slate-200">隐私说明</Text>
            <Text className="text-cyan-400">→</Text>
          </View>
        </CardContent>
      </Card>

      {/* 清除数据 */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogTrigger className="w-full">
          <Button variant="outline" className="w-full border-red-500 border-opacity-30">
            <Text className="text-red-400">清除本地数据</Text>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-gray-800 border-red-500 border-opacity-30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">确认清除数据</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              此操作将清除所有本地数据，包括：
              {'\n'}• 用户档案和八字档案
              {'\n'}• 运势记录和收藏
              {'\n'}• 对话历史和提醒设置
              {'\n'}{'\n'}清除后需要重新输入出生信息。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600">
              <Text className="text-slate-400">取消</Text>
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500"
              onClick={handleClearData}
            >
              <Text className="text-white">确认清除</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 底部说明 */}
      <View className="mt-8 text-center">
        <Text className="block text-xs text-slate-500">
          赛博灵频 · 仅供娱乐参考
        </Text>
        <Text className="block text-xs text-slate-500 mt-1">
          不构成任何现实决策建议
        </Text>
      </View>
    </View>
  );
};

export default MePage;