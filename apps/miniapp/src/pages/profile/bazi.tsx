// 心象盘页 - 本心气质与五行气息，专业信息默认折叠
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { useUserStore, useAnalysisStore } from '@/stores';
import { getElementLabel, type FiveElementType } from '@/types';
import { AiRevealText } from '@/components/ai-reveal-text';
import { createRevealSchedule } from '@/lib/ai-reveal';
import './bazi.css';

const renderAnalysis = (content: string, animate: boolean) => {
  const stripInline = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1').replace(/\*\*/g, '');
  const lines = content.replace(/\\n/g, '\n').split('\n').map(line => stripInline(line.trim()));
  const schedule = createRevealSchedule(lines.map(line => line.replace(/^#{1,2}\s+/, '').replace(/^[-*]\s+/, '· ')));
  return lines.map((line, index) => {
    const text = <AiRevealText chunks={schedule[index]} animate={animate} />;
    const key = `line_${index}`;
    if (!line) return <View key={key} className="h-2" />;
    if (line.startsWith('## ')) {
      return (
        <Text key={key} className="block text-base font-bold neu-cyan mt-4 mb-1 tracking-wide">
          {text}
        </Text>
      );
    }
    if (line.startsWith('# ')) {
      return (
        <Text key={key} className="block text-lg font-bold neu-cyan mt-4 mb-1 tracking-wide">
          {text}
        </Text>
      );
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <Text key={key} className="block text-sm neu-fg leading-relaxed pl-3">
          {text}
        </Text>
      );
    }
    return (
      <Text key={key} className="block text-sm neu-fg leading-relaxed">
        {text}
      </Text>
    );
  });
};

const BaziPage = () => {
  const { userProfile, baziProfile, loadUserProfile, isLoading } = useUserStore();
  const { report, isLoading: analysisLoading, error: analysisError, loadCachedReport, generateReport } = useAnalysisStore();

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [openedAt] = useState(Date.now);
  const [showBasicInfo, setShowBasicInfo] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (baziProfile) {
      loadCachedReport(baziProfile.userId);
    }
  }, [baziProfile, loadCachedReport]);

  const handleGenerateAnalysis = async () => {
    if (!baziProfile || analysisLoading) return;
    setShowAnalysis(true);
    if (!report) {
      await generateReport(userProfile, baziProfile);
    }
  };

  const handleRegenerateAnalysis = async () => {
    if (!baziProfile || analysisLoading) return;
    await generateReport(userProfile, baziProfile, true);
  };

  useEffect(() => {
    if (!isLoading && !userProfile) {
      Taro.redirectTo({ url: '/pages/onboarding/birth' });
    }
  }, [isLoading, userProfile]);

  const handleViewToday = () => {
    Taro.switchTab({ url: '/pages/fortune/today' });
  };

  const elementColors: Record<string, string> = {
    wood: '#5a8f6a',
    fire: '#b5564e',
    earth: '#b08d4a',
    metal: '#8a8f99',
    water: '#5a7fa8'
  };

  if (!baziProfile) {
    return (
      <View className="neu-page min-h-screen flex flex-col justify-center items-center p-4">
        <Text className="block text-lg neu-muted tracking-wide">生成中…</Text>
      </View>
    );
  }

  return (
    <View className="bazi-container neu-page min-h-screen p-5 pb-8">
      <View className="mb-6 mt-2">
        <Text className="block text-2xl font-bold neu-cyan tracking-[0.15em]">心象盘</Text>
        <Text className="block text-sm neu-muted mt-2 tracking-wide">基于出生信息的自我观察参考</Text>
      </View>

      {userProfile?.unknownTime && (
        <View className="neu-pressed-sm rounded-2xl p-4 mb-6">
          <Text className="block text-sm neu-muted leading-relaxed">
            你暂未填写出生时辰，因此心象盘会以出生日期为主生成，部分个性化内容会相对简化。
          </Text>
        </View>
      )}

      {/* 本心气质 */}
      <View className="neu-raised rounded-3xl p-5 mb-6">
        <Text className="block text-sm neu-muted mb-3 tracking-[0.2em]">本心气质</Text>
        <View className="flex items-center gap-4">
          <View className="neu-raised-sm w-16 h-16 rounded-full flex items-center justify-center">
            <Text className="block text-3xl font-bold neu-cyan">{baziProfile.dayMaster}</Text>
          </View>
          <View className="flex-1">
            <Text className="block text-lg neu-fg">核心气息 · {baziProfile.dayMaster}</Text>
            <Text className="block text-sm neu-muted mt-1">这是你心象盘的核心参照</Text>
          </View>
        </View>
      </View>

      {/* 五行气息 */}
      <View className="neu-raised rounded-3xl p-5 mb-6">
        <Text className="block text-sm neu-muted mb-4 tracking-[0.2em]">五行气息</Text>
        <View className="flex flex-col gap-3">
          {Object.entries(baziProfile.fiveElements).map(([element, value]) => (
            <View key={element} className="flex items-center gap-3">
              <Text className="block text-sm neu-fg w-8">{getElementLabel(element as FiveElementType)}</Text>
              <View className="flex-1">
                <View className="neu-pressed-sm relative h-3 w-full overflow-hidden rounded-full">
                  <View
                    className="h-full transition-all"
                    style={{ width: `${value}%`, backgroundColor: elementColors[element] }}
                  />
                </View>
              </View>
              <Text className="block text-sm neu-muted w-10">{value}%</Text>
            </View>
          ))}
        </View>
        <View className="mt-5 pt-4" style={{ borderTop: '1px solid var(--neu-dark)' }}>
          <Text className="block text-sm neu-muted mb-3">宜多亲近的气息</Text>
          <View className="flex gap-3 flex-wrap">
            {baziProfile.favorableElements.map((element) => (
              <View key={element} className="neu-raised-sm rounded-xl px-3 py-2">
                <Text className="text-sm neu-cyan">{getElementLabel(element)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 心性标签 */}
      <View className="neu-raised rounded-3xl p-5 mb-6">
        <Text className="block text-sm neu-muted mb-4 tracking-[0.2em]">心性标签</Text>
        <View className="flex flex-wrap gap-3">
          {baziProfile.personalityTags.map((tag) => (
            <View key={tag} className="neu-raised-sm rounded-xl px-3 py-2">
              <Text className="text-sm neu-purple">{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 行事倾向 */}
      <View className="neu-raised rounded-3xl p-5 mb-6">
        <Text className="block text-sm neu-muted mb-2 tracking-[0.2em]">行事倾向</Text>
        <Text className="block text-base neu-fg leading-relaxed">{baziProfile.summary}</Text>
      </View>

      {/* 情绪提醒 */}
      <View className="neu-raised rounded-3xl p-5 mb-6">
        <Text className="block text-sm neu-muted mb-2 tracking-[0.2em]">情绪提醒</Text>
        <Text className="block text-sm neu-fg leading-relaxed">
          留意心绪起伏，不必急于定论。今日宜以观察为先，顺其气息而行，给自己留出回味的余地。
        </Text>
      </View>

      {/* 深度心象解读（可选，折叠触发） */}
      <View className="neu-raised rounded-3xl p-5 mb-6">
        <View className="flex justify-between items-center mb-3">
          <Text className="block text-sm neu-cyan tracking-wide">深度心象解读</Text>
          <View className="neu-raised-sm rounded-full px-3 py-1">
            <Text className="text-xs neu-purple">可选</Text>
          </View>
        </View>

        {!showAnalysis && !report && (
          <View>
            <Text className="block text-xs neu-muted leading-relaxed mb-3">
              结合你的心象盘，生成一段更完整的本心画像，帮助你从传统文化视角做自我观察。
            </Text>
            <Text className="block text-xs neu-muted leading-relaxed mb-4 opacity-80">
              注意：会出生辰摘要与心象信息发送至服务端用于 AI 生成，仅作情绪陪伴参考。
            </Text>
            <View
              onClick={handleGenerateAnalysis}
              className="neu-raised neu-press w-full h-12 rounded-2xl flex items-center justify-center"
            >
              <Text className="neu-cyan tracking-wide">生成本心画像</Text>
            </View>
          </View>
        )}

        {(showAnalysis || report) && (
          <View>
            {analysisLoading && (
              <Text className="block text-sm neu-muted py-4">正在生成本心画像，请稍候…</Text>
            )}
            {!analysisLoading && analysisError && !report && (
              <View className="py-3">
                <Text className="block text-sm neu-pink mb-3">生成失败：{analysisError}</Text>
                <View onClick={handleGenerateAnalysis} className="neu-raised-sm w-full h-11 rounded-2xl flex items-center justify-center">
                  <Text className="neu-cyan">重试</Text>
                </View>
              </View>
            )}
            {!analysisLoading && report && (
              <View>
                <View key={report.createdAt} className="mt-1">{renderAnalysis(report.content, Date.parse(report.createdAt) >= openedAt)}</View>
                <View className="mt-4 pt-3" style={{ borderTop: '1px solid var(--neu-dark)' }}>
                  <View onClick={handleRegenerateAnalysis} className="neu-raised-sm w-full h-11 rounded-2xl flex items-center justify-center">
                    <Text className="neu-purple">重新生成</Text>
                  </View>
                  <Text className="block text-xs neu-muted text-center mt-3">
                    仅供传统文化与自我观察参考，不构成现实决策建议
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* 基础盘信息（折叠） */}
      <View className="neu-raised rounded-3xl p-5 mb-6">
        <View onClick={() => setShowBasicInfo(!showBasicInfo)} className="flex justify-between items-center">
          <Text className="block text-sm neu-muted tracking-wide">查看基础盘信息</Text>
          <Text className="text-xs neu-cyan">{showBasicInfo ? '收起 ▴' : '展开 ▾'}</Text>
        </View>
        {showBasicInfo && (
          <View className="mt-4">
            <Text className="block text-xs neu-muted leading-relaxed mb-4">
              以下内容基于出生信息生成，仅作传统文化视角下的自我观察参考。
            </Text>
            <View className="grid grid-cols-4 gap-3">
              {([
                ['年', baziProfile.yearPillar],
                ['月', baziProfile.monthPillar],
                ['日', baziProfile.dayPillar],
                ['时', baziProfile.hourPillar]
              ] as const).map(([label, value]) => (
                <View key={label} className="neu-pressed flex flex-col items-center p-3 rounded-2xl">
                  <Text className="block text-xs neu-muted mb-1">{label}</Text>
                  <Text className="block text-base font-mono neu-fg">{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View onClick={handleViewToday} className="neu-raised neu-press w-full h-14 rounded-2xl flex items-center justify-center">
        <Text className="block text-lg font-medium neu-cyan tracking-[0.2em]">查看今日心象</Text>
      </View>

      <View className="mt-6 text-center">
        <Text className="block text-xs neu-muted">以上所言仅为遣怀清心，非关休咎</Text>
      </View>
    </View>
  );
};

export default BaziPage;
