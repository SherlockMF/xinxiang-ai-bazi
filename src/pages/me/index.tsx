// 本心页 - 个人资料、留存记录、每日心约与隐私设置
import { View, Text, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUserStore, useFortuneStore, useChatStore, useAnalysisStore, useReminderStore } from '@/stores';
import { RELATION_LABELS } from '@/types';
import { getVisitStats, getStreakDisplayText } from '@/services/visitStatsService';
import { getRecentHistory } from '@/services/historyService';
import { getFavoriteItems } from '@/services/favoriteService';
import { getChatHistory } from '@/services/storageService';
import { truncateText } from '@/services/posterService';
import type { DailyXiangHistoryItem } from '@/types';
import './index.css';

const MePage = () => {
  const { baziProfile, userProfile, profiles, clearAll, loadUserProfile } = useUserStore();
  const { clearFavorites, clearTodayFortune } = useFortuneStore();
  const { clearHistory } = useChatStore();
  const { clearReport } = useAnalysisStore();
  const { preference, loadPreference, saveSettings, clearPreference } = useReminderStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:30');
  const [visitStreakText, setVisitStreakText] = useState('');
  const [totalVisitDays, setTotalVisitDays] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [askCount, setAskCount] = useState(0);
  const [historyItems, setHistoryItems] = useState<DailyXiangHistoryItem[]>([]);

  const refreshStats = useCallback(() => {
    if (!baziProfile) return;
    const uid = baziProfile.userId;
    const stats = getVisitStats(uid);
    setVisitStreakText(getStreakDisplayText(stats));
    setTotalVisitDays(stats.totalVisitDays);
    setFavoriteCount(getFavoriteItems(uid).length);
    setAskCount(getChatHistory(uid).filter(m => m.role === 'user').length);
    setHistoryItems(getRecentHistory(uid, 7));
  }, [baziProfile]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (baziProfile) {
      loadPreference(baziProfile.userId);
      refreshStats();
    }
  }, [baziProfile, loadPreference, refreshStats]);

  useEffect(() => {
    if (preference) {
      setReminderEnabled(preference.enabled);
      setReminderTime(preference.time || preference.reminderTime || '08:30');
    }
  }, [preference]);

  useEffect(() => {
    const handler = () => refreshStats();
    Taro.eventCenter.on('xinxiang:retention-updated', handler);
    return () => {
      Taro.eventCenter.off('xinxiang:retention-updated', handler);
    };
  }, [refreshStats]);

  const handleClearData = () => {
    clearAll();
    clearFavorites();
    clearTodayFortune();
    clearHistory();
    clearReport();
    clearPreference();
    setReminderEnabled(false);
    setReminderTime('08:30');
    setShowDeleteConfirm(false);
    Taro.showToast({ title: '本地数据已清除', icon: 'success' });
    setTimeout(() => {
      Taro.redirectTo({ url: '/pages/onboarding/birth' });
    }, 1500);
  };

  const handleSaveReminder = async () => {
    if (!baziProfile) return;
    await saveSettings(baziProfile.userId, reminderEnabled, reminderTime);
  };

  return (
    <View className="me-container neu-page min-h-screen p-5 pb-8">
      <View className="mb-6 mt-2">
        <Text className="block text-2xl font-bold neu-cyan tracking-[0.3em]">本心</Text>
      </View>

      {/* 用户信息 */}
      {baziProfile && userProfile ? (
        <>
          <View className="neu-raised rounded-3xl p-5 mb-5">
            <View className="flex items-center gap-4">
              <View className="neu-raised-sm w-16 h-16 rounded-full flex items-center justify-center shrink-0">
                <Text className="block text-2xl font-bold neu-cyan">{baziProfile.dayMaster}</Text>
              </View>
              <View className="flex-1">
                <View className="flex items-center gap-2">
                  <Text className="block text-lg neu-fg">{userProfile.nickname || '本心'}</Text>
                  <View className="neu-raised-sm rounded-full px-2 py-1">
                    <Text className="text-xs neu-purple">{RELATION_LABELS[userProfile.relation || 'other']}</Text>
                  </View>
                </View>
                <Text className="block text-sm neu-muted mt-2 tracking-wide">
                  出生 {userProfile.birthDate}
                  {userProfile.unknownTime
                    ? ' · 时辰不详'
                    : userProfile.birthTime
                      ? ` ${userProfile.birthTime}`
                      : userProfile.timeBranch
                        ? ` · ${userProfile.timeBranch}`
                        : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* 本心画像摘要 */}
          <View className="neu-raised rounded-3xl p-5 mb-5">
            <Text className="block text-sm neu-muted mb-3 tracking-[0.2em]">本心画像</Text>
            <View className="flex flex-wrap gap-2 mb-3">
              {baziProfile.personalityTags.slice(0, 4).map((tag) => (
                <View key={tag} className="neu-raised-sm rounded-xl px-3 py-1">
                  <Text className="text-xs neu-purple">{tag}</Text>
                </View>
              ))}
            </View>
            <Text className="block text-sm neu-fg leading-relaxed mb-3">
              {truncateText(baziProfile.summary, 80)}
            </Text>
            <View
              className="neu-raised-sm rounded-2xl h-10 flex items-center justify-center"
              onClick={() => Taro.navigateTo({ url: '/pages/profile/bazi' })}
            >
              <Text className="text-sm neu-cyan">查看完整心象盘</Text>
            </View>
          </View>

          {/* 心象记录 */}
          <View className="neu-raised rounded-3xl p-5 mb-5">
            <Text className="block text-sm neu-muted mb-4 tracking-[0.2em]">心象记录</Text>
            <View className="grid grid-cols-2 gap-4">
              <View className="neu-pressed-sm rounded-2xl p-3">
                <Text className="block text-xs neu-muted mb-1">连续观心</Text>
                <Text className="block text-sm neu-cyan">{visitStreakText || '—'}</Text>
              </View>
              <View className="neu-pressed-sm rounded-2xl p-3">
                <Text className="block text-xs neu-muted mb-1">累计观心</Text>
                <Text className="block text-sm neu-fg">{totalVisitDays} 天</Text>
              </View>
              <View
                className="neu-pressed-sm rounded-2xl p-3"
                onClick={() => Taro.switchTab({ url: '/pages/share/index' })}
              >
                <Text className="block text-xs neu-muted mb-1">珍藏心象</Text>
                <Text className="block text-sm neu-purple">{favoriteCount}</Text>
              </View>
              <View
                className="neu-pressed-sm rounded-2xl p-3"
                onClick={() => Taro.switchTab({ url: '/pages/chat/index' })}
              >
                <Text className="block text-xs neu-muted mb-1">问心次数</Text>
                <Text className="block text-sm neu-fg">{askCount}</Text>
              </View>
            </View>
            {favoriteCount === 0 && (
              <Text className="block text-xs neu-muted mt-3 leading-relaxed">
                还没有珍藏的心象。遇到想留下的一句话，可以把它收进签亭。
              </Text>
            )}
            {askCount === 0 && (
              <Text className="block text-xs neu-muted mt-2 leading-relaxed">
                还没有问心记录。当某个问题反复出现时，可以来这里问一问。
              </Text>
            )}
          </View>
        </>
      ) : (
        <View className="neu-raised rounded-3xl p-5 mb-5">
          <Text className="block text-base neu-muted mb-2 leading-relaxed">
            填写出生信息后，这里会生成你的本心画像。
          </Text>
          <View
            className="neu-raised-sm rounded-2xl h-11 flex items-center justify-center mt-3"
            onClick={() => Taro.navigateTo({ url: '/pages/onboarding/birth' })}
          >
            <Text className="neu-cyan tracking-wide">填写出生信息</Text>
          </View>
        </View>
      )}

      {/* 每日心约 */}
      {baziProfile && (
        <View className="neu-raised rounded-3xl p-5 mb-5">
          <Text className="block text-sm neu-muted mb-2 tracking-[0.2em]">每日心约</Text>
          <Text className="block text-xs neu-muted mb-4 leading-relaxed">
            在你习惯的时间，留一刻给今日心象。
          </Text>
          <View className="flex justify-between items-center mb-4">
            <Label className="neu-fg">开启每日心约</Label>
            <Switch
              checked={reminderEnabled}
              onCheckedChange={setReminderEnabled}
            />
          </View>
          {reminderEnabled && (
            <View className="mb-4">
              <Label className="neu-muted mb-2">提醒时间</Label>
              <Picker
                mode="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.detail.value)}
              >
                <View className="neu-pressed rounded-2xl px-4 py-3 flex items-center justify-between">
                  <Text className="neu-fg">{reminderTime}</Text>
                  <Text className="neu-muted text-xs">▾</Text>
                </View>
              </Picker>
            </View>
          )}
          <View
            onClick={handleSaveReminder}
            className="neu-raised-sm rounded-2xl h-11 flex items-center justify-center"
          >
            <Text className="neu-cyan tracking-wide">保存设置</Text>
          </View>
        </View>
      )}

      {/* 近七日心象 */}
      {baziProfile && (
        <View className="neu-raised rounded-3xl p-5 mb-5">
          <Text className="block text-sm neu-muted mb-4 tracking-[0.2em]">近七日心象</Text>
          {historyItems.length === 0 ? (
            <Text className="block text-sm neu-muted leading-relaxed">
              还没有留下心象记录。{'\n'}看过今日心象后，它会自然留在这里。
            </Text>
          ) : (
            <View className="flex flex-col gap-3">
              {historyItems.map((item) => (
                <View key={item.date} className="neu-pressed-sm rounded-2xl p-4">
                  <Text className="block text-xs neu-muted mb-1">{item.date}</Text>
                  <Text className="block text-sm neu-cyan font-medium mb-1">{item.title}</Text>
                  <Text className="block text-xs neu-fg italic leading-relaxed mb-2">
                    {truncateText(item.verse, 40)}
                  </Text>
                  {item.keywords && item.keywords.length > 0 && (
                    <Text className="block text-xs neu-purple">
                      {item.keywords.slice(0, 3).join(' · ')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 快捷入口与隐私 */}
      <View className="neu-raised rounded-3xl p-2 mb-5">
        {profiles.length > 1 && (
          <View
            className="menu-item flex justify-between items-center px-4 py-4"
            onClick={() => Taro.navigateTo({ url: '/pages/profiles/index' })}
          >
            <Text className="block text-base neu-fg">本心档案（{profiles.length}位）</Text>
            <Text className="neu-cyan">›</Text>
          </View>
        )}
        <View
          className="menu-item flex justify-between items-center px-4 py-4"
          onClick={() => Taro.navigateTo({ url: '/pages/onboarding/birth?edit=1' })}
        >
          <Text className="block text-base neu-fg">修改出生信息</Text>
          <Text className="neu-cyan">›</Text>
        </View>
        <View
          className="menu-item flex justify-between items-center px-4 py-4"
          onClick={() => Taro.showModal({
            title: '隐私说明',
            content: '生辰、心象盘、心象记录与珍藏默认仅存于你的本地设备，我们不会主动收集或分享。\n\n使用「问心」时会上传心象摘要与问题；使用「深度心象解读」时会上传出生信息与心象盘摘要。两者均发送至服务端用于 AI 生成回复。\n\n以上所言仅为自我观察与情绪陪伴参考，不构成任何现实决策建议。',
            showCancel: false,
            confirmText: '我知道了'
          })}
        >
          <Text className="block text-base neu-fg">隐私说明</Text>
          <Text className="neu-cyan">›</Text>
        </View>
      </View>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogTrigger className="w-full">
          <View className="neu-raised-sm w-full h-12 rounded-2xl flex items-center justify-center">
            <Text className="neu-pink">清除本地数据</Text>
          </View>
        </AlertDialogTrigger>
        <AlertDialogContent className="neu-raised border-0 rounded-3xl" style={{ backgroundColor: 'var(--neu-bg)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="neu-pink">确认清除数据</AlertDialogTitle>
            <AlertDialogDescription className="neu-muted">
              清除后将删除本机保存的出生信息、今日心象、观心记录、珍藏、问心记录与每日心约，是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-0" style={{ backgroundColor: 'var(--neu-bg)' }}>
              <Text className="neu-muted">取消</Text>
            </AlertDialogCancel>
            <AlertDialogAction style={{ backgroundColor: 'var(--neu-pink)' }} onClick={handleClearData}>
              <Text className="text-white">确认清除</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <View className="mt-4 text-center">
        <Text className="block text-xs neu-muted">心象 · 所言仅为遣怀清心</Text>
        <Text className="block text-xs neu-muted mt-1">不构成任何现实决策建议</Text>
      </View>
    </View>
  );
};

export default MePage;
