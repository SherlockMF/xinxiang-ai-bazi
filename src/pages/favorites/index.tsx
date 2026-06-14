// 收藏页 - 展示用户收藏的建议和祝福
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/stores';
import { getFavorites, removeFavorite } from '@/services/storageService';
import type { FavoriteAdvice } from '@/types';
import './index.css';

const FavoritesPage = () => {
  const { baziProfile, loadUserProfile } = useUserStore();
  const [favorites, setFavorites] = useState<FavoriteAdvice[]>([]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (baziProfile) {
      const favs = getFavorites(baziProfile.userId);
      setFavorites(favs);
    }
  }, [baziProfile]);

  // 移除收藏
  const handleRemove = (favoriteId: string) => {
    if (!baziProfile) return;
    removeFavorite(baziProfile.userId, favoriteId);
    const favs = getFavorites(baziProfile.userId);
    setFavorites(favs);
    Taro.showToast({ title: '已移除', icon: 'success' });
  };

  // 类型标签颜色
  const typeColors: Record<string, string> = {
    summary: 'bg-cyan-500 bg-opacity-30 text-cyan-400 border-cyan-400 border-opacity-30',
    action: 'bg-purple-500 bg-opacity-30 text-purple-400 border-purple-400 border-opacity-30',
    blessing: 'bg-pink-500 bg-opacity-30 text-pink-400 border-pink-400 border-opacity-30',
    yi: 'bg-cyan-500 bg-opacity-30 text-cyan-300 border-cyan-400 border-opacity-30',
    ji: 'bg-pink-500 bg-opacity-30 text-pink-300 border-pink-400 border-opacity-30'
  };

  // 类型名称
  const typeNames: Record<string, string> = {
    summary: '运势',
    action: '建议',
    blessing: '祝福',
    yi: '宜',
    ji: '忌'
  };

  if (!baziProfile) {
    return (
      <View className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <Text className="block text-lg text-slate-400">请先生成灵频档案</Text>
      </View>
    );
  }

  return (
    <View className="favorites-container min-h-screen bg-slate-900 p-4 pb-8">
      {/* 顶部标题 */}
      <View className="mb-6">
        <Text className="block text-2xl font-bold text-cyan-400">我的收藏</Text>
        <Text className="block text-sm text-slate-400 mt-2">收藏的建议与祝福</Text>
      </View>

      {/* 空状态 */}
      {favorites.length === 0 && (
        <View className="flex flex-col items-center justify-center mt-20">
          <Text className="block text-lg text-slate-400 mb-4">暂无收藏</Text>
          <Text className="block text-sm text-slate-500">在今日运势页收藏喜欢的建议</Text>
          <Button 
            onClick={() => Taro.switchTab({ url: '/pages/fortune/today' })}
            className="mt-4 bg-gradient-to-r from-cyan-500 to-purple-500"
          >
            <Text className="text-white">查看今日运势</Text>
          </Button>
        </View>
      )}

      {/* 收藏列表 */}
      {favorites.length > 0 && (
        <View className="space-y-4">
          {favorites.map((fav) => (
            <Card key={fav.id} className="bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
              <CardContent className="p-4">
                {/* 顶部：类型和日期 */}
                <View className="flex justify-between items-center mb-3">
                  <Badge className={typeColors[fav.type] || typeColors.summary}>
                    {typeNames[fav.type] || fav.type}
                  </Badge>
                  <Text className="block text-xs text-slate-500">
                    {new Date(fav.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                {/* 内容 */}
                <Text className="block text-base text-slate-200 leading-relaxed mb-3">
                  {fav.content}
                </Text>
                
                {/* 移除按钮 */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemove(fav.id)}
                  className="text-slate-400"
                >
                  <Text className="text-xs text-slate-400">移除收藏</Text>
                </Button>
              </CardContent>
            </Card>
          ))}
        </View>
      )}

      {/* 底部说明 */}
      <View className="mt-6 text-center">
        <Text className="block text-xs text-slate-500">
          收藏内容仅存储在本地设备
        </Text>
      </View>
    </View>
  );
};

export default FavoritesPage;