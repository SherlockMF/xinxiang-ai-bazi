// 本心档案页 - 多本心列表：添加 / 切换 / 删除
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/stores';
import { getBaziByUser } from '@/services/storageService';
import { RELATION_LABELS } from '@/types';
import type { BaziProfile } from '@/types';
import './index.css';

const ProfilesPage = () => {
  const { profiles, activeId, loadUserProfile, switchProfile, removeProfile } = useUserStore();
  const [baziMap, setBaziMap] = useState<Record<string, BaziProfile | null>>({});

  const refresh = () => {
    loadUserProfile();
  };

  useEffect(() => {
    refresh();
  }, []);

  useDidShow(() => {
    refresh();
  });

  useEffect(() => {
    const map: Record<string, BaziProfile | null> = {};
    profiles.forEach(p => { map[p.id] = getBaziByUser(p.id); });
    setBaziMap(map);
  }, [profiles]);

  const handleSwitch = (id: string) => {
    if (id === activeId) {
      Taro.switchTab({ url: '/pages/fortune/today' });
      return;
    }
    switchProfile(id);
    Taro.showToast({ title: '已切换本心', icon: 'success' });
    setTimeout(() => Taro.switchTab({ url: '/pages/fortune/today' }), 600);
  };

  const handleDelete = (id: string, name: string) => {
    Taro.showModal({
      title: '删除本心档案',
      content: `将删除「${name}」及其心象盘、今日心象、问心与珍藏，且不可恢复。确定吗？`,
      confirmText: '删除',
      confirmColor: '#a85761',
      success: (res) => {
        if (!res.confirm) return;
        removeProfile(id);
        const left = useUserStore.getState().profiles;
        if (left.length === 0) {
          Taro.redirectTo({ url: '/pages/onboarding/birth' });
        } else {
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className="profiles-container neu-page min-h-screen p-5 pb-8">
      <View className="mb-6 mt-2">
        <Text className="block text-2xl font-bold neu-cyan tracking-[0.15em]">本心档案</Text>
        <Text className="block text-sm neu-muted mt-2 tracking-wide">为家人朋友各建一份心象，随时切换</Text>
      </View>

      <View className="flex flex-col gap-4">
        {profiles.map((p) => {
          const bazi = baziMap[p.id];
          const isActive = p.id === activeId;
          return (
            <View key={p.id} className={`rounded-3xl p-5 ${isActive ? 'neu-pressed' : 'neu-raised'}`}>
              <View className="flex items-center gap-4">
                <View className="neu-raised-sm w-14 h-14 rounded-full flex items-center justify-center shrink-0">
                  <Text className="block text-xl font-bold neu-cyan">{bazi?.dayMaster || '—'}</Text>
                </View>
                <View className="flex-1" onClick={() => handleSwitch(p.id)}>
                  <View className="flex items-center gap-2">
                    <Text className="block text-lg neu-fg">{p.nickname || '本心'}</Text>
                    <View className="neu-raised-sm rounded-full px-2 py-1">
                      <Text className="text-xs neu-purple">{RELATION_LABELS[p.relation || 'other']}</Text>
                    </View>
                    {isActive && (
                      <View className="neu-raised-sm rounded-full px-2 py-1">
                        <Text className="text-xs neu-cyan">当前</Text>
                      </View>
                    )}
                  </View>
                  <Text className="block text-xs neu-muted mt-1 tracking-wide">
                    {p.birthDate} {p.birthTime}
                  </Text>
                </View>
                <View className="shrink-0 px-2 py-2" onClick={() => handleDelete(p.id, p.nickname || '本心')}>
                  <Text className="text-xs neu-pink">删除</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View
        onClick={() => Taro.navigateTo({ url: '/pages/onboarding/birth' })}
        className="neu-raised neu-press w-full h-14 rounded-2xl flex items-center justify-center mt-6"
      >
        <Text className="neu-cyan tracking-[0.2em]">＋ 添加本心</Text>
      </View>

      <View className="mt-6 text-center">
        <Text className="block text-xs neu-muted">各本心的心象盘与记录互相独立，仅存于本地</Text>
      </View>
    </View>
  );
};

export default ProfilesPage;
