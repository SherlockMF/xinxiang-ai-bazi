// 今日心象页 - 核心页面
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUserStore, useFortuneStore } from '@/stores';
import { computeMomentPillars } from '@/services/baziService';
import { generateMomentAnalysis } from '@/services/momentService';
import { getTodayDateString } from '@/services/birthUtils';
import { buildDailyVerseFavorite, buildDailyXiangFavorite } from '@/services/favoriteService';
import { recordVisit, getStreakDisplayText, getVisitStats } from '@/services/visitStatsService';
import { appendDailyHistory, getRecentHistory } from '@/services/historyService';
import { RELATION_LABELS } from '@/types';
import './today.css';

const renderMoment = (content: string) => {
  const strip = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1').replace(/\*\*/g, '');
  return content.replace(/\\n/g, '\n').split('\n').map((raw, i) => {
    const line = strip(raw.trim());
    const key = `m_${i}`;
    if (!line) return <View key={key} className="h-2" />;
    if (line.startsWith('## ') || line.startsWith('# ')) {
      return (
        <Text key={key} className="block text-sm font-bold neu-cyan mt-3 mb-1 tracking-wide">
          {line.replace(/^#+\s+/, '')}
        </Text>
      );
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <Text key={key} className="block text-sm neu-fg leading-relaxed pl-3">· {line.replace(/^[-*]\s+/, '')}</Text>
      );
    }
    return <Text key={key} className="block text-sm neu-fg leading-relaxed">{line}</Text>;
  });
};

const fmtMoment = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ` +
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

const truncateText = (text: string, maxLen: number) =>
  text.length <= maxLen ? text : `${text.slice(0, maxLen)}…`;

const TodayPage = () => {
  const { baziProfile, userProfile, profiles, activeId, switchProfile, loadUserProfile } = useUserStore();
  const { todayFortune, currentExplanation, explanationLoading, generateTodayFortune, getYiJiExplanation, isLoading, error, clearTodayFortune, addFavorite } = useFortuneStore();

  const [currentDate] = useState(getTodayDateString);

  const [now, setNow] = useState(() => new Date());
  const [momentLoading, setMomentLoading] = useState(false);
  const [momentContent, setMomentContent] = useState('');
  const [momentSnapTime, setMomentSnapTime] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [retentionHint, setRetentionHint] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (baziProfile && todayFortune) {
      recordVisit(baziProfile.userId, currentDate);
      appendDailyHistory(baziProfile.userId, todayFortune);
      const stats = getVisitStats(baziProfile.userId);
      const streak = getStreakDisplayText(stats);
      const historyLen = getRecentHistory(baziProfile.userId, 7).length;
      setRetentionHint(
        historyLen >= 2
          ? `${streak} · 近七日心象已为你留存`
          : streak
      );
      Taro.eventCenter.trigger('xinxiang:retention-updated');
    }
  }, [baziProfile, todayFortune, currentDate]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleMomentAnalysis = async () => {
    if (!baziProfile || momentLoading) return;
    const snapDate = new Date();
    const snap = computeMomentPillars(snapDate);
    const snapTime = fmtMoment(snapDate);
    setMomentSnapTime(snapTime);
    setMomentLoading(true);
    try {
      const content = await generateMomentAnalysis(baziProfile, snap, snapTime);
      setMomentContent(content);
    } catch {
      setMomentContent(
        `## 此刻气象\n此刻时序为 ${snap.hourPillar}（${snap.hourLabel}），气息如水流过，自有其缓急。\n\n## 此刻心象指引\n且把心放宽，顺此刻之势，不必强求。该缓则缓，该行则行。\n\n此乃一刻之象，所言仅为遣怀清心，非关休咎。`
      );
    } finally {
      setMomentLoading(false);
    }
  };

  useEffect(() => {
    if (baziProfile && userProfile) {
      if (todayFortune && todayFortune.userId !== baziProfile.userId) {
        clearTodayFortune();
        return;
      }
      generateTodayFortune(baziProfile, userProfile, currentDate).catch(() => { /* 本地生成，极少失败 */ });
    }
  }, [baziProfile, userProfile, currentDate, generateTodayFortune, todayFortune, clearTodayFortune]);

  const handleItemClick = async (item: string, type: 'yi' | 'ji') => {
    if (!baziProfile || !userProfile || !todayFortune) return;
    await getYiJiExplanation(baziProfile, userProfile, todayFortune, item, type);
  };

  const handleFavoriteVerse = () => {
    if (!baziProfile || !todayFortune) return;
    const item = buildDailyVerseFavorite(baziProfile.userId, todayFortune);
    const result = addFavorite(item);
    if (result === 'added') {
      Taro.showToast({ title: '偈语已收进签亭', icon: 'success' });
    } else if (result === 'duplicate') {
      Taro.showToast({ title: '已收藏', icon: 'none' });
    }
  };

  const handleFavoriteToday = () => {
    if (!baziProfile || !todayFortune) return;
    const item = buildDailyXiangFavorite(baziProfile.userId, todayFortune);
    const result = addFavorite(item);
    if (result === 'added') {
      Taro.showToast({ title: '已收进签亭', icon: 'success' });
    } else if (result === 'duplicate') {
      Taro.showToast({ title: '已收藏', icon: 'none' });
    }
  };

  const handleRegenerate = async () => {
    if (!baziProfile || !userProfile || isLoading) return;
    await generateTodayFortune(baziProfile, userProfile, currentDate, true);
    Taro.showToast({ title: '已刷新今日心象', icon: 'success' });
  };

  const handleAIChat = () => {
    Taro.switchTab({ url: '/pages/chat/index' });
  };

  const handleShareCard = () => {
    Taro.switchTab({ url: '/pages/share/index' });
  };

  const handleSwitchPerson = () => {
    if (profiles.length <= 1) {
      Taro.navigateTo({ url: '/pages/profiles/index' });
      return;
    }
    const itemList = profiles.map(p => `${p.nickname || '本心'}（${RELATION_LABELS[p.relation || 'other']}）`);
    Taro.showActionSheet({
      itemList,
      success: (res) => {
        const target = profiles[res.tapIndex];
        if (target && target.id !== activeId) {
          clearTodayFortune();
          switchProfile(target.id);
          Taro.showToast({ title: `已切换 · ${target.nickname || '本心'}`, icon: 'none' });
        }
      }
    });
  };

  const handleSetReminder = () => {
    Taro.switchTab({ url: '/pages/me/index' });
  };

  if (!baziProfile || !userProfile) {
    return (
      <View className="neu-page min-h-screen flex flex-col justify-center items-center p-4">
        <Text className="block text-lg neu-muted mb-6 tracking-wide">心象未立，请先填写出生信息，生成你的今日心象。</Text>
        <View className="neu-raised-sm rounded-2xl px-6 py-3" onClick={() => Taro.redirectTo({ url: '/pages/onboarding/birth' })}>
          <Text className="neu-cyan tracking-wider">填写出生信息</Text>
        </View>
      </View>
    );
  }

  if (!todayFortune) {
    return (
      <View className="neu-page min-h-screen flex flex-col justify-center items-center p-4">
        <Text className="block text-lg neu-muted tracking-wide mb-2">
          {isLoading ? '正在生成今日心象…' : error ? '今日心象暂未就绪' : '静候片刻…'}
        </Text>
        {!isLoading && error && (
          <Text className="block text-sm neu-muted text-center px-4 mb-4 leading-relaxed">{error}</Text>
        )}
        {!isLoading && (
          <View
            className="neu-raised-sm rounded-2xl px-6 py-3"
            onClick={() => baziProfile && userProfile && generateTodayFortune(baziProfile, userProfile, currentDate, true)}
          >
            <Text className="neu-cyan tracking-wider">{error ? '重试生成' : '刷新'}</Text>
          </View>
        )}
      </View>
    );
  }

  const xiangName = todayFortune.moodKeyword.includes('日')
    ? todayFortune.moodKeyword
    : `${todayFortune.moodKeyword}日`;
  const subtitle = truncateText(todayFortune.actionSuggestion, 24);

  return (
    <View className="today-container neu-page min-h-screen p-5 pb-12">
      {/* 顶部：日期 + 切换本心 */}
      <View className="mb-4 flex justify-between items-center gap-2">
        <View>
          <Text className="block text-sm neu-muted tracking-wide">{currentDate}</Text>
          {retentionHint ? (
            <Text className="block text-xs neu-purple mt-1 tracking-wide">{retentionHint}</Text>
          ) : null}
        </View>
        <View className="neu-raised-sm rounded-full px-4 py-2 flex items-center gap-1" onClick={handleSwitchPerson}>
          <Text className="text-xs neu-cyan">{userProfile?.nickname || '本心'}</Text>
          <Text className="text-xs neu-muted">▾</Text>
        </View>
      </View>

      <Text className="block text-2xl font-bold neu-cyan tracking-[0.2em] mb-5">今日心象</Text>

      {/* 主卡片：今日之象 + 气息摘要 */}
      <View className="neu-raised rounded-3xl p-6 mb-5">
        <Text className="block text-xs neu-muted tracking-[0.2em] mb-2">今日之象</Text>
        <Text className="block text-2xl font-bold neu-cyan tracking-wide mb-1">{xiangName}</Text>
        <Text className="block text-sm neu-purple mb-4 tracking-wide">{subtitle}</Text>
        <View className="neu-pressed-sm rounded-2xl p-4">
          <Text className="block text-xs neu-muted mb-2 tracking-wide">今日气息摘要</Text>
          <Text className="block text-base neu-fg leading-relaxed">
            {truncateText(todayFortune.summary, 60)}
          </Text>
        </View>
      </View>

      {/* 今日行止 */}
      <View className="neu-raised rounded-3xl p-5 mb-5">
        <Text className="block text-sm neu-muted mb-4 tracking-[0.2em]">今日行止</Text>
        <View className="grid grid-cols-2 gap-5">
          <View>
            <Text className="block text-sm neu-cyan mb-3">宜</Text>
            <View className="flex flex-col gap-2">
              {todayFortune.yi.slice(0, 3).map((item) => (
                <Dialog key={item}>
                  <DialogTrigger asChild>
                    <View
                      className="neu-chip neu-raised-sm rounded-xl px-3 py-2 self-start"
                      onClick={() => handleItemClick(item, 'yi')}
                    >
                      <Text className="text-sm neu-cyan">{item}</Text>
                    </View>
                  </DialogTrigger>
                  <DialogContent className="neu-raised border-0 rounded-3xl" style={{ backgroundColor: 'var(--neu-bg)' }}>
                    <DialogHeader>
                      <DialogTitle className="neu-cyan">{item} · 说明</DialogTitle>
                    </DialogHeader>
                    <Text className="block text-sm neu-fg leading-relaxed">
                      {explanationLoading ? '正在生成说明…' : currentExplanation || '点此查看说明'}
                    </Text>
                  </DialogContent>
                </Dialog>
              ))}
            </View>
          </View>
          <View>
            <Text className="block text-sm neu-pink mb-3">忌</Text>
            <View className="flex flex-col gap-2">
              {todayFortune.ji.slice(0, 3).map((item) => (
                <Dialog key={item}>
                  <DialogTrigger asChild>
                    <View
                      className="neu-chip neu-raised-sm rounded-xl px-3 py-2 self-start"
                      onClick={() => handleItemClick(item, 'ji')}
                    >
                      <Text className="text-sm neu-pink">{item}</Text>
                    </View>
                  </DialogTrigger>
                  <DialogContent className="neu-raised border-0 rounded-3xl" style={{ backgroundColor: 'var(--neu-bg)' }}>
                    <DialogHeader>
                      <DialogTitle className="neu-pink">{item} · 说明</DialogTitle>
                    </DialogHeader>
                    <Text className="block text-sm neu-fg leading-relaxed">
                      {explanationLoading ? '正在生成说明…' : currentExplanation || '点此查看说明'}
                    </Text>
                  </DialogContent>
                </Dialog>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* 今日偈语 */}
      <View className="neu-raised rounded-3xl p-5 mb-6">
        <View className="flex justify-between items-center mb-3">
          <Text className="block text-sm neu-cyan tracking-[0.2em]">今日偈语</Text>
          <View onClick={handleFavoriteVerse} className="neu-raised-sm rounded-full px-3 py-1">
            <Text className="text-xs neu-muted">收录偈语</Text>
          </View>
        </View>
        <Text className="block text-base neu-fg leading-relaxed italic">{todayFortune.cyberBlessing}</Text>
      </View>

      {/* 主操作 */}
      <View className="grid grid-cols-3 gap-3 mb-4">
        <View onClick={handleAIChat} className="neu-raised neu-press rounded-2xl h-12 flex items-center justify-center">
          <Text className="text-sm neu-cyan tracking-wide">问一问</Text>
        </View>
        <View onClick={handleShareCard} className="neu-raised neu-press rounded-2xl h-12 flex items-center justify-center">
          <Text className="text-sm neu-purple tracking-wide">生成签卡</Text>
        </View>
        <View onClick={handleFavoriteToday} className="neu-raised neu-press rounded-2xl h-12 flex items-center justify-center">
          <Text className="text-sm neu-pink tracking-wide">收藏今日</Text>
        </View>
      </View>

      {/* 更多（折叠） */}
      <View className="neu-raised-sm rounded-2xl px-4 py-3 mb-4" onClick={() => setShowMore(!showMore)}>
        <Text className="block text-sm neu-muted text-center tracking-wide">
          {showMore ? '收起更多' : '展开更多 · 此刻心象 / 今日点缀'}
        </Text>
      </View>

      {showMore && (
        <>
          {/* 行止详情 */}
          <View className="neu-raised rounded-3xl p-5 mb-5">
            <Text className="block text-sm neu-purple tracking-[0.2em] mb-3">行止提醒</Text>
            <Text className="block text-base neu-fg leading-relaxed">{todayFortune.actionSuggestion}</Text>
          </View>

          {/* 今日点缀 */}
          <View className="neu-raised rounded-3xl p-5 mb-5">
            <Text className="block text-sm neu-muted mb-4 tracking-[0.2em]">今日点缀</Text>
            <View className="grid grid-cols-3 gap-4">
              <View className="neu-pressed flex flex-col items-center p-3 rounded-2xl">
                <Text className="block text-xs neu-muted mb-1">色</Text>
                <Text className="block text-lg neu-cyan">{todayFortune.luckyColor}</Text>
              </View>
              <View className="neu-pressed flex flex-col items-center p-3 rounded-2xl">
                <Text className="block text-xs neu-muted mb-1">数</Text>
                <Text className="block text-lg neu-purple">{todayFortune.luckyNumber}</Text>
              </View>
              <View className="neu-pressed flex flex-col items-center p-3 rounded-2xl">
                <Text className="block text-xs neu-muted mb-1">向</Text>
                <Text className="block text-lg neu-pink">{todayFortune.luckyDirection}</Text>
              </View>
            </View>
          </View>

          {/* 此刻心象（折叠区内，非首屏） */}
          <View className="neu-raised rounded-3xl p-5 mb-5">
            <View className="flex justify-between items-center mb-4">
              <Text className="block text-sm neu-muted tracking-[0.2em]">此刻</Text>
              <Text className="block text-lg font-mono neu-cyan tracking-wider">{fmtMoment(now).slice(11)}</Text>
            </View>
            {!momentContent && (
              <View
                onClick={handleMomentAnalysis}
                className={`neu-raised neu-press w-full h-12 rounded-2xl flex items-center justify-center ${momentLoading ? 'opacity-60' : ''}`}
              >
                <Text className="neu-cyan tracking-wide">{momentLoading ? '正在感应此刻…' : '感应此刻心象'}</Text>
              </View>
            )}
            {momentContent && (
              <View className="neu-pressed-sm rounded-2xl p-4">
                {momentSnapTime && (
                  <Text className="block text-xs neu-muted mb-2">{momentSnapTime}</Text>
                )}
                <View>{renderMoment(momentContent)}</View>
                <View
                  onClick={handleMomentAnalysis}
                  className={`neu-raised-sm w-full h-10 rounded-2xl flex items-center justify-center mt-3 ${momentLoading ? 'opacity-60' : ''}`}
                >
                  <Text className="text-xs neu-purple">{momentLoading ? '感应中…' : '重新感应'}</Text>
                </View>
              </View>
            )}
          </View>

          <View onClick={handleRegenerate} className="neu-raised-sm rounded-2xl h-11 flex items-center justify-center mb-3">
            <Text className="neu-muted tracking-wide">刷新今日心象</Text>
          </View>
          <View onClick={handleSetReminder} className="w-full py-3 flex items-center justify-center mb-2">
            <Text className="neu-muted tracking-wide">立每日之约</Text>
          </View>
        </>
      )}

      <View className="mt-4 text-center">
        <Text className="block text-xs neu-muted tracking-wide">
          心象之语，遣怀清心，仅供自我观察与情绪陪伴
        </Text>
      </View>
    </View>
  );
};

export default TodayPage;
