// 珍藏页 - 今日心象、偈语与问心回应
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/stores';
import { getFavoriteItems, removeFavoriteItem, FAVORITE_TYPE_LABELS } from '@/services/favoriteService';
import { truncateText } from '@/services/posterService';
import type { FavoriteItem } from '@/types';
import './index.css';

const FavoritesPage = () => {
  const { baziProfile, loadUserProfile } = useUserStore();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const refresh = () => {
    if (baziProfile) {
      setFavorites(getFavoriteItems(baziProfile.userId));
    }
  };

  useEffect(() => {
    refresh();
  }, [baziProfile]);

  const handleRemove = (favoriteId: string) => {
    if (!baziProfile) return;
    removeFavoriteItem(baziProfile.userId, favoriteId);
    refresh();
    Taro.showToast({ title: '已移除', icon: 'success' });
  };

  if (!baziProfile) {
    return (
      <View className="neu-page min-h-screen flex flex-col justify-center items-center p-4">
        <Text className="block text-lg neu-muted mb-6 tracking-wide">心象未立，请先填写出生信息</Text>
        <View className="neu-raised-sm rounded-2xl px-6 py-3" onClick={() => Taro.redirectTo({ url: '/pages/onboarding/birth' })}>
          <Text className="neu-cyan tracking-wider">填写出生信息</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="favorites-container neu-page min-h-screen p-5 pb-8">
      <View className="mb-6 mt-2">
        <Text className="block text-2xl font-bold neu-cyan tracking-[0.15em]">我的珍藏</Text>
        <Text className="block text-sm neu-muted mt-2 tracking-wide">收藏过的今日心象与问心回应</Text>
      </View>

      {favorites.length === 0 && (
        <View className="flex flex-col items-center justify-center mt-20 px-4">
          <Text className="block text-base neu-fg mb-3 text-center">还没有珍藏的心象。</Text>
          <Text className="block text-sm neu-muted mb-6 text-center leading-relaxed">
            遇到想留下的一句话，可以把它收进签亭。
          </Text>
          <View
            onClick={() => Taro.switchTab({ url: '/pages/share/index' })}
            className="neu-raised neu-press rounded-2xl px-6 py-3"
          >
            <Text className="neu-cyan tracking-wide">去签亭看看</Text>
          </View>
        </View>
      )}

      {favorites.length > 0 && (
        <View className="flex flex-col gap-4">
          {favorites.map((fav) => (
            <View key={fav.id} className="neu-raised rounded-3xl p-5">
              <View className="flex justify-between items-center mb-3">
                <View className="neu-raised-sm rounded-full px-3 py-1">
                  <Text className="text-xs neu-cyan">{FAVORITE_TYPE_LABELS[fav.type]}</Text>
                </View>
                <Text className="block text-xs neu-muted">
                  {fav.sourceDate || new Date(fav.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <Text className="block text-base neu-fg font-medium mb-2">{fav.title}</Text>
              <Text className="block text-sm neu-muted leading-relaxed mb-3">
                {truncateText(fav.content, 120)}
              </Text>

              <View onClick={() => handleRemove(fav.id)} className="self-start">
                <Text className="text-xs neu-muted">移出珍藏</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View className="mt-8 text-center">
        <Text className="block text-xs neu-muted">珍藏内容仅存于本地设备</Text>
        <Text className="block text-xs neu-muted mt-1">内容仅作传统文化与自我观察参考</Text>
      </View>
    </View>
  );
};

export default FavoritesPage;
