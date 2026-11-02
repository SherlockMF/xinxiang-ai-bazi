// 签亭页 - 今日签卡、海报预览、珍藏与分享
import { View, Text, Canvas, Image } from '@tarojs/components';
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro';
import { useEffect, useState, useMemo } from 'react';
import { useUserStore, useFortuneStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { getTodayDateString } from '@/services/birthUtils';
import {
  buildPosterPayload,
  buildSharePath,
  buildShareTitle,
  generatePosterImage,
  POSTER_CANVAS_ID,
  POSTER_HEIGHT,
  POSTER_WIDTH,
  savePosterToAlbum,
  showSavePosterToast,
  truncateText
} from '@/services/posterService';
import {
  buildDailyXiangFavorite,
  buildDailyXiangTitle,
  FAVORITE_TYPE_LABELS,
  getFavoriteItems,
  isFavorited
} from '@/services/favoriteService';
import type { PosterPayload } from '@/types';
import './index.css';

const SharePage = () => {
  const { userProfile, baziProfile, loadUserProfile } = useUserStore();
  const { todayFortune, generateTodayFortune, isLoading, addFavorite, loadFavorites, favorites, clearTodayFortune } = useFortuneStore();

  const [currentDate] = useState(getTodayDateString);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState('');
  const [posterPayload, setPosterPayload] = useState<PosterPayload | null>(null);
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (!baziProfile || !userProfile) return;
    if (todayFortune && todayFortune.userId !== baziProfile.userId) {
      clearTodayFortune();
      setPosterPreviewUrl('');
      setPosterPayload(null);
      setFavorited(false);
      return;
    }
    if (!todayFortune) {
      generateTodayFortune(baziProfile, userProfile, currentDate).catch(() => { /* 本地兜底 */ });
    }
  }, [baziProfile, userProfile, todayFortune, currentDate, generateTodayFortune, clearTodayFortune]);

  useEffect(() => {
    if (baziProfile) {
      loadFavorites(baziProfile.userId);
    }
  }, [baziProfile, loadFavorites]);

  useEffect(() => {
    if (baziProfile && todayFortune && todayFortune.userId === baziProfile.userId) {
      setFavorited(isFavorited(baziProfile.userId, 'daily_xiang', todayFortune.date));
    } else {
      setFavorited(false);
    }
  }, [baziProfile, todayFortune]);

  const recentFavorites = useMemo(() => {
    if (!baziProfile) return [];
    return getFavoriteItems(baziProfile.userId).slice(0, 5);
  }, [baziProfile, favorites]);

  const activeTodayFortune = baziProfile && todayFortune?.userId === baziProfile.userId
    ? todayFortune
    : null;

  useShareAppMessage(() => {
    const payload = activeTodayFortune ? buildPosterPayload(activeTodayFortune) : null;
    return {
      title: payload ? buildShareTitle(payload) : '我今日抽到了一句心象',
      path: buildSharePath(currentDate)
    };
  });

  useShareTimeline(() => {
    const payload = activeTodayFortune ? buildPosterPayload(activeTodayFortune) : null;
    const title = payload
      ? truncateText(payload.verse, 24) || '留一张今日签给自己'
      : '留一张今日签给自己';
    return { title, query: `date=${currentDate}` };
  });

  const handleGeneratePoster = async () => {
    if (!activeTodayFortune || generatingPoster) return;
    setGeneratingPoster(true);
    try {
      const payload = buildPosterPayload(activeTodayFortune);
      setPosterPayload(payload);
      const tempPath = await generatePosterImage(payload);
      setPosterPreviewUrl(tempPath);
    } catch {
      Taro.showToast({ title: '生成失败，请稍后再试', icon: 'none' });
    } finally {
      setGeneratingPoster(false);
    }
  };

  const handleSavePoster = async () => {
    if (!activeTodayFortune) return;
    try {
      let tempPath = posterPreviewUrl;
      if (!tempPath) {
        const payload = buildPosterPayload(activeTodayFortune);
        tempPath = await generatePosterImage(payload);
        setPosterPreviewUrl(tempPath);
        setPosterPayload(payload);
      }
      const result = await savePosterToAlbum(tempPath);
      showSavePosterToast(result);
    } catch {
      Taro.showToast({ title: '保存失败，请稍后再试', icon: 'none' });
    }
  };

  const handleFavoriteToday = () => {
    if (!baziProfile || !activeTodayFortune) return;
    if (favorited) {
      Taro.showToast({ title: '已收藏', icon: 'none' });
      return;
    }
    const item = buildDailyXiangFavorite(baziProfile.userId, activeTodayFortune);
    const result = addFavorite(item);
    if (result === 'added') {
      setFavorited(true);
      Taro.showToast({ title: '已收进签亭', icon: 'success' });
    } else if (result === 'duplicate') {
      setFavorited(true);
      Taro.showToast({ title: '已收藏', icon: 'none' });
    } else {
      Taro.showToast({ title: '收藏失败', icon: 'none' });
    }
  };

  if (!baziProfile || !userProfile) {
    return (
      <View className="neu-page min-h-screen flex flex-col justify-center items-center p-4">
        <Text className="block text-lg neu-muted mb-6 tracking-wide">心象未立，请先填写出生信息</Text>
        <View className="neu-raised-sm rounded-2xl px-6 py-3" onClick={() => Taro.redirectTo({ url: '/pages/onboarding/birth' })}>
          <Text className="neu-cyan tracking-wider">填写出生信息</Text>
        </View>
      </View>
    );
  }

  if (!activeTodayFortune) {
    return (
      <View className="neu-page min-h-screen flex flex-col justify-center items-center p-4">
        <Text className="block text-lg neu-muted mb-2 tracking-wide">
          {isLoading ? '正在生成今日心象…' : '今日签还未生成'}
        </Text>
        {!isLoading && (
          <>
            <Text className="block text-sm neu-muted mb-6 text-center px-4 leading-relaxed">
              先去查看今日心象，再把今天的一句话收进签亭。
            </Text>
            <View className="neu-raised-sm rounded-2xl px-6 py-3" onClick={() => Taro.switchTab({ url: '/pages/fortune/today' })}>
              <Text className="neu-cyan tracking-wider">去看今日心象</Text>
            </View>
          </>
        )}
      </View>
    );
  }

  const payload = posterPayload || buildPosterPayload(activeTodayFortune);
  const cardTitle = buildDailyXiangTitle(activeTodayFortune.moodKeyword);
  const cardSubtitle = truncateText(activeTodayFortune.actionSuggestion, 24);

  return (
    <View className="share-container neu-page min-h-screen p-5 pb-10">
      <View className="mb-5 mt-2">
        <Text className="block text-2xl font-bold neu-cyan tracking-[0.2em]">签亭</Text>
        <Text className="block text-sm neu-muted mt-2 tracking-wide">保存今日提醒 · 分享一句心象</Text>
      </View>

      {/* 今日签卡 */}
      <Text className="block text-sm neu-muted mb-3 tracking-[0.2em]">今日签</Text>
      <View className="neu-raised rounded-3xl p-6 mb-5">
        <Text className="block text-xs neu-muted tracking-[0.15em] mb-4">心象 · 今日签</Text>
        <Text className="block text-2xl font-bold neu-cyan mb-2">{cardTitle}</Text>
        <Text className="block text-sm neu-purple mb-4 leading-relaxed">{cardSubtitle}</Text>
        <View className="neu-pressed rounded-2xl p-4 mb-4">
          <Text className="block text-base neu-fg leading-relaxed italic">{activeTodayFortune.cyberBlessing}</Text>
        </View>
        <View className="flex flex-col gap-2 mb-4">
          <Text className="block text-sm neu-cyan">
            宜：{activeTodayFortune.yi.slice(0, 3).join(' / ')}
          </Text>
          <Text className="block text-sm neu-pink">
            忌：{activeTodayFortune.ji.slice(0, 2).join(' / ')}
          </Text>
        </View>
        <Text className="block text-xs neu-muted text-center">{payload.safetyNote}</Text>
        <Text className="block text-xs neu-muted text-center mt-2">{currentDate}</Text>
      </View>

      {/* 海报预览 */}
      {posterPreviewUrl ? (
        <View className="neu-raised rounded-3xl p-4 mb-5">
          <Text className="block text-sm neu-muted mb-3 tracking-wide">签卡预览</Text>
          <Image
            src={posterPreviewUrl}
            mode="widthFix"
            className="w-full rounded-2xl"
            style={{ width: '100%' }}
          />
          <Text className="block text-xs neu-muted text-center mt-3">
            长按图片可保存 · 内容仅作自我观察参考
          </Text>
        </View>
      ) : null}

      {/* 操作按钮 */}
      <View className="flex flex-col gap-3 mb-8">
        <View
          onClick={handleGeneratePoster}
          className={`neu-raised neu-press w-full h-14 rounded-2xl flex items-center justify-center ${generatingPoster ? 'opacity-60' : ''}`}
        >
          <Text className="neu-cyan tracking-[0.2em]">{generatingPoster ? '生成中…' : '生成签卡'}</Text>
        </View>

        <View onClick={handleSavePoster} className="neu-raised-sm neu-press w-full h-12 rounded-2xl flex items-center justify-center">
          <Text className="neu-purple tracking-wide">保存图片</Text>
        </View>

        <Button
          openType="share"
          className="neu-raised-sm neu-press w-full h-12 rounded-2xl flex items-center justify-center after:border-0"
          style={{ backgroundColor: 'var(--neu-bg)', lineHeight: '3rem' }}
        >
          <Text className="neu-pink tracking-wide">分享这句提醒</Text>
        </Button>

        <View
          onClick={handleFavoriteToday}
          className="neu-raised-sm w-full h-12 rounded-2xl flex items-center justify-center"
        >
          <Text className={favorited ? 'neu-muted tracking-wide' : 'neu-cyan tracking-wide'}>
            {favorited ? '已收藏' : '收藏今日'}
          </Text>
        </View>
      </View>

      {/* 我的珍藏 */}
      <View className="mb-4">
        <View className="flex justify-between items-center mb-3">
          <Text className="block text-sm neu-muted tracking-[0.2em]">我的珍藏</Text>
          <View onClick={() => Taro.navigateTo({ url: '/pages/favorites/index' })}>
            <Text className="text-xs neu-cyan">查看全部 ›</Text>
          </View>
        </View>

        {recentFavorites.length === 0 ? (
          <View className="neu-pressed-sm rounded-2xl p-5">
            <Text className="block text-sm neu-muted leading-relaxed text-center">
              还没有珍藏的心象。{'\n'}遇到想留下的一句话，可以把它收进签亭。
            </Text>
          </View>
        ) : (
          <View className="flex flex-col gap-3">
            {recentFavorites.map((fav) => (
              <View key={fav.id} className="neu-raised-sm rounded-2xl p-4">
                <View className="flex justify-between items-center mb-2">
                  <Text className="text-xs neu-purple">{FAVORITE_TYPE_LABELS[fav.type]}</Text>
                  <Text className="text-xs neu-muted">{fav.sourceDate || ''}</Text>
                </View>
                <Text className="block text-sm neu-fg font-medium mb-1">{fav.title}</Text>
                <Text className="block text-xs neu-muted leading-relaxed line-clamp-2">{truncateText(fav.content, 48)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Canvas
        canvasId={POSTER_CANVAS_ID}
        style={{
          width: `${POSTER_WIDTH}px`,
          height: `${POSTER_HEIGHT}px`,
          position: 'fixed',
          left: '-9999px',
          top: '0'
        }}
      />
    </View>
  );
};

export default SharePage;
