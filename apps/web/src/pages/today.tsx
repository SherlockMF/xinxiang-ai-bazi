import { useState } from 'react';
import { useAppStore } from '../store';
import { Button, Card, EmptyState, Icon, Modal, PageTitle, Prose, useToast } from '../components/ui';
import { buildDailyVerseFavorite } from '../services/favorite-service.ts';
import { explainYiJi } from '../services/fortune-service.ts';
import { computeMomentPillars } from '../services/bazi-service.ts';
import { generateMomentAnalysis } from '../services/moment-service.ts';
import { getVisitStats } from '../services/visit-stats-service.ts';
import { getRecentHistory } from '../services/history-service.ts';

export default function TodayPage() {
  const { profile, bazi, fortune, favorite } = useAppStore();
  const [detail, setDetail] = useState<{ title: string; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const { notify, toast } = useToast();
  if (!profile || !bazi || !fortune) return <EmptyState />;
  const stats = getVisitStats(profile.id);
  const history = getRecentHistory(profile.id, 7);
  const explain = async (item: string, type: 'yi' | 'ji') =>
    setDetail({
      title: `${type === 'yi' ? '宜' : '缓一缓'} · ${item}`,
      text: await explainYiJi(bazi, fortune, item, type, profile)
    });
  const moment = async () => {
    setPending(true);
    const id = profile.id;
    try {
      const now = new Date();
      const text = await generateMomentAnalysis(
        bazi,
        computeMomentPillars(now),
        now.toLocaleString('zh-CN', { hour12: false })
      );
      if (useAppStore.getState().profile?.id === id) setDetail({ title: '此刻心象', text });
    } catch {
      notify('此刻解读暂不可用。先读一读今日心象，晚些再来。');
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="page-enter">
      <PageTitle
        eyebrow="DAILY REFLECTION / 一日一象"
        title="今日心象"
        description={`${profile.nickname || '你'}，愿今天的片刻停留，成为内心的微光。`}
        action={
          <a href="#/chart" className="inline-flex items-center gap-2 text-xs text-jade">
            我的心象盘 <Icon name="arrow" />
          </a>
        }
      />
      <div className="stagger grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <Card className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <span className="text-xs tracking-[.2em] text-muted">{fortune.date.replaceAll('-', ' / ')}</span>
            <span className="seal seal-small">象</span>
          </div>
          <div className="my-9 flex flex-wrap items-center gap-8 sm:gap-10">
            <div className="score-ring flex h-36 w-36 shrink-0 items-center justify-center rounded-full p-1.5 sm:h-40 sm:w-40">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-paper">
                <span className="font-display text-5xl text-jade">{fortune.overallScore}</span>
                <span className="mt-2 text-[.65rem] tracking-[.25em] text-muted">今日心绪</span>
              </div>
            </div>
            <div className="min-w-36 flex-1">
              <p className="mb-3 text-[.65rem] tracking-[.25em] text-muted">今日关键词</p>
              <h2 className="font-display text-3xl tracking-widest text-jade sm:text-4xl">
                {fortune.moodKeyword.replace(/日$/, '')}
              </h2>
              <p className="mt-4 max-w-xs text-sm leading-7 text-muted">{fortune.summary}</p>
            </div>
          </div>
          <div className="inset-panel rounded-2xl px-5 py-4">
            <p className="text-[.65rem] tracking-widest text-jade">给今天的一点建议</p>
            <p className="mt-2 font-display text-base leading-8">{fortune.actionSuggestion}</p>
          </div>
          <p className="mt-5 text-[.6rem] text-muted">分数仅为日签意象，不用于衡量真实运势或个人价值。</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs tracking-widest text-muted">
              <Icon name="leaf" className="text-jade" />
              今日偈语
            </p>
            <span className="mt-6 block font-display text-5xl leading-none text-gold/40">“</span>
            <p className="my-4 font-display text-2xl leading-[1.9] tracking-wider">{fortune.cyberBlessing}</p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-[.65rem] tracking-widest text-muted">一念清明，一日从容</p>
            <Button
              variant="soft"
              aria-label="收藏今日偈语"
              onClick={() => {
                const result = favorite(buildDailyVerseFavorite(profile.id, fortune));
                notify(
                  result === 'added'
                    ? '这句心意，已收进珍藏'
                    : result === 'duplicate'
                      ? '这句心意已在珍藏中'
                      : '未能保存，请检查浏览器存储。'
                );
              }}
            >
              <Icon name="bookmark" />
            </Button>
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="font-display text-2xl text-jade">宜</span>
            <h2 className="text-sm tracking-widest">给自己一点空间</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {fortune.yi.map((item) => (
              <Button
                key={item}
                variant="soft"
                onClick={() => {
                  void explain(item, 'yi');
                }}
              >
                {item}
              </Button>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted">轻触词语，读一读其中的心意。</p>
        </Card>
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <span className="font-display text-2xl text-rose">缓</span>
            <h2 className="text-sm tracking-widest">这些事，不必太用力</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {fortune.ji.map((item) => (
              <Button
                key={item}
                variant="soft"
                onClick={() => {
                  void explain(item, 'ji');
                }}
              >
                {item}
              </Button>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted">温柔的提醒，不是必须遵循的规则。</p>
        </Card>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {[
          ['今日色彩', fortune.luckyColor, '色'],
          ['心意数字', fortune.luckyNumber, '数'],
          ['意象方位', fortune.luckyDirection, '向']
        ].map(([label, value, mark]) => (
          <Card key={label} className="flex items-center gap-5">
            <span className="inset-panel flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-xl text-gold">
              {mark}
            </span>
            <div>
              <p className="text-xs text-muted">{label}</p>
              <p className="mt-2 font-display text-lg">{value}</p>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
        <p className="text-xs text-muted">
          {stats.streakDays > 1 ? `已连续观心 ${stats.streakDays} 天` : '今日相见，愿你心安'} · 留存了{' '}
          {history.length} 则近期心象
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => {
              void moment();
            }}
          >
            {pending ? '静候片刻…' : '此刻解读'}
          </Button>
          <a
            href="#/chat"
            className="button button-primary inline-flex items-center gap-3 rounded-2xl px-5 py-3 text-sm"
          >
            心里有话，去问心 <Icon name="arrow" />
          </a>
        </div>
      </div>
      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)}>
          <Prose text={detail.text} animate={detail.title === '此刻心象'} />
        </Modal>
      )}
      {toast}
    </div>
  );
}
