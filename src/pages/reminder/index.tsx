// 提醒设置页 - 管理每日运势提醒
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUserStore, useReminderStore } from '@/stores';
import './index.css';

const ReminderPage = () => {
  const { baziProfile, loadUserProfile } = useUserStore();
  const { preference, loadPreference, updateEnabled, updateTime } = useReminderStore();
  
  // 时间选项
  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00',
    '12:00', '18:00', '20:00', '22:00'
  ];

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (baziProfile) {
      loadPreference(baziProfile.userId);
    }
  }, [baziProfile, loadPreference]);

  // 开关变化
  const handleEnabledChange = (enabled: boolean) => {
    if (!baziProfile) return;
    updateEnabled(baziProfile.userId, enabled);
  };

  // 时间选择
  const handleTimeChange = (time: string) => {
    if (!baziProfile) return;
    updateTime(baziProfile.userId, time);
  };

  if (!baziProfile) {
    return (
      <View className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <Text className="block text-lg text-slate-400">请先生成灵频档案</Text>
      </View>
    );
  }

  return (
    <View className="reminder-container min-h-screen bg-slate-900 p-4 pb-8">
      {/* 顶部标题 */}
      <View className="mb-6">
        <Text className="block text-2xl font-bold text-cyan-400">每日提醒</Text>
        <Text className="block text-sm text-slate-400 mt-2">设置每日运势提醒时间</Text>
      </View>

      {/* 开关卡片 */}
      <Card className="mb-6 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <View className="flex justify-between items-center">
            <View className="flex-1">
              <Label className="text-slate-200">开启每日提醒</Label>
              <Text className="block text-xs text-slate-500 mt-1">
                开启后将在设定时间提醒你查看今日灵频
              </Text>
            </View>
            <Switch
              checked={preference?.enabled || false}
              onCheckedChange={(checked) => handleEnabledChange(checked)}
            />
          </View>
        </CardContent>
      </Card>

      {/* 时间选择 */}
      {preference?.enabled && (
        <Card className="mb-6 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
          <CardContent className="p-4">
            <Label className="text-slate-200 mb-3">选择提醒时间</Label>
            <View className="grid grid-cols-3 gap-2 mt-2">
              {timeOptions.map((time) => (
                <View 
                  key={time}
                  className={`time-option rounded-xl px-4 py-3 text-center cursor-pointer ${
                    preference?.reminderTime === time 
                      ? 'bg-cyan-500 bg-opacity-30 border border-cyan-400' 
                      : 'bg-gray-900 bg-opacity-50 border border-gray-700'
                  }`}
                  onClick={() => handleTimeChange(time)}
                >
                  <Text className={preference?.reminderTime === time ? 'text-cyan-400' : 'text-slate-300'}>
                    {time}
                  </Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      )}

      {/* 提醒渠道说明 */}
      <Card className="mb-6 bg-gray-800 bg-opacity-30 border-gray-700">
        <CardContent className="p-4">
          <Text className="block text-sm text-slate-400 mb-2">提醒渠道</Text>
          <Text className="block text-xs text-slate-500">
            MVP版本暂使用应用内提醒，微信订阅消息将在后续版本上线。
          </Text>
          <Text className="block text-xs text-slate-500 mt-2">
            提醒设置仅保存本地，不会发送实际通知。
          </Text>
        </CardContent>
      </Card>

      {/* 当前设置状态 */}
      <View className="mt-6 p-4 rounded-xl bg-cyan-500 bg-opacity-10 border border-cyan-400 border-opacity-30">
        <Text className="block text-sm text-cyan-400">
          {preference?.enabled 
            ? `已开启提醒，时间：${preference.reminderTime}` 
            : '提醒已关闭'}
        </Text>
      </View>

      {/* 返回按钮 */}
      <Button 
        onClick={() => Taro.switchTab({ url: '/pages/fortune/today' })}
        variant="outline"
        className="w-full mt-6 border-cyan-500 border-opacity-30"
      >
        <Text className="text-cyan-400">返回今日运势</Text>
      </Button>

      {/* 底部说明 */}
      <View className="mt-6 text-center">
        <Text className="block text-xs text-slate-500">
          提醒功能仅供娱乐，不影响实际生活
        </Text>
      </View>
    </View>
  );
};

export default ReminderPage;