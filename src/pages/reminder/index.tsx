// 每日心约页 - 管理每日心象提醒偏好（保留独立页，与本心页设置同步）
import { View, Text, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUserStore, useReminderStore } from '@/stores';
import './index.css';

const ReminderPage = () => {
  const { baziProfile, loadUserProfile } = useUserStore();
  const { preference, loadPreference, saveSettings } = useReminderStore();
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('08:30');

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (baziProfile) {
      loadPreference(baziProfile.userId);
    }
  }, [baziProfile, loadPreference]);

  useEffect(() => {
    if (preference) {
      setEnabled(preference.enabled);
      setTime(preference.time || preference.reminderTime || '08:30');
    }
  }, [preference]);

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
    <View className="reminder-container neu-page min-h-screen p-5 pb-8">
      <View className="mb-6 mt-2">
        <Text className="block text-2xl font-bold neu-cyan tracking-[0.15em]">每日心约</Text>
        <Text className="block text-sm neu-muted mt-2 tracking-wide">在你习惯的时间，留一刻给今日心象</Text>
      </View>

      <View className="neu-raised rounded-3xl p-5 mb-6">
        <View className="flex justify-between items-center mb-4">
          <Label className="neu-fg">开启每日心约</Label>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </View>
        {enabled && (
          <View>
            <Label className="neu-muted mb-2">提醒时间</Label>
            <Picker mode="time" value={time} onChange={(e) => setTime(e.detail.value)}>
              <View className="neu-pressed rounded-2xl px-4 py-3 flex items-center justify-between">
                <Text className={time ? 'neu-fg' : 'neu-muted'}>{time || '08:30'}</Text>
                <Text className="neu-muted text-xs">▾</Text>
              </View>
            </Picker>
          </View>
        )}
      </View>

      <View className="neu-pressed-sm rounded-2xl p-4 mb-6">
        <Text className="block text-xs neu-muted leading-relaxed">
          正式提醒能力将在后续版本接入微信 / 抖音订阅消息，当前仅保存本地偏好。
        </Text>
      </View>

      <View
        onClick={() => saveSettings(baziProfile.userId, enabled, time)}
        className="neu-raised neu-press w-full h-12 rounded-2xl flex items-center justify-center"
      >
        <Text className="neu-cyan tracking-wide">保存设置</Text>
      </View>

      <View
        onClick={() => Taro.switchTab({ url: '/pages/me/index' })}
        className="neu-raised-sm w-full h-11 rounded-2xl flex items-center justify-center mt-4"
      >
        <Text className="neu-muted tracking-wide">返回本心</Text>
      </View>
    </View>
  );
};

export default ReminderPage;
