import { useState } from 'react';
import { useAppStore } from '../store';
import { Button, Card, EmptyState, Icon, Notice, PageTitle, Prose } from '../components/ui';
import { getCachedAnalysis, generateBaziAnalysis } from '../services/analysis-service.ts';
import { ELEMENT_LABELS, type FiveElementType } from '../types/index.ts';

const elementColors: Record<FiveElementType, string> = {
  wood: '#668571',
  fire: '#a9655b',
  earth: '#aa9066',
  metal: '#99988a',
  water: '#68868b'
};
export default function ChartPage() {
  const { profile, bazi } = useAppStore();
  const [report, setReport] = useState(() => (profile ? getCachedAnalysis(profile.id) : null));
  const [pending, setPending] = useState(false);
  const [openedAt] = useState(Date.now);
  const [error, setError] = useState('');
  if (!profile || !bazi) return <EmptyState />;
  const analyze = async () => {
    setPending(true);
    setError('');
    try {
      const result = await generateBaziAnalysis(profile, bazi);
      const active = useAppStore.getState().profile;
      if (active?.id === profile.id && active.updatedAt === profile.updatedAt) setReport(result);
    } catch {
      setError('深度解读暂不可用，请确认 AI 服务已配置，或稍后重试。');
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="page-enter">
      <PageTitle
        eyebrow="YOUR INNER LANDSCAPE / 观照自己"
        title="我的心象盘"
        description="以传统文化为镜，看见自己的不同侧面。"
        action={
          <a href="#/birth?edit=1" className="text-sm text-jade">
            编辑出生信息 →
          </a>
        }
      />
      <div className="grid items-start gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <div className="flex items-start gap-6">
            <span className="inset-panel flex h-20 w-20 shrink-0 items-center justify-center rounded-full font-display text-4xl text-jade">
              {bazi.dayMaster}
            </span>
            <div>
              <p className="mb-2 text-xs tracking-widest text-muted">{profile.nickname || '你'}的日主意象</p>
              <h2 className="font-display text-2xl leading-9">一份独属于你的底色</h2>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            {bazi.personalityTags.map((tag) => (
              <span key={tag} className="rounded-full bg-jade/8 px-4 py-2 text-xs text-jade">
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm leading-8 text-muted">{bazi.summary}</p>
          <p className="mt-5 text-xs leading-7 text-muted">
            这些词语是观察的起点，不是性格定论。你始终可以长成不同的样子。
          </p>
        </Card>
        <Card>
          <h2 className="font-display text-xl tracking-widest">五行意象</h2>
          <p className="mb-6 mt-3 text-xs text-muted">传统元素的相对分布</p>
          <div className="space-y-5">
            {Object.entries(bazi.fiveElements).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <span
                  className="font-display text-lg"
                  style={{ color: elementColors[key as FiveElementType] }}
                >
                  {ELEMENT_LABELS[key as FiveElementType]}
                </span>
                <div
                  className="inset-panel h-2.5 flex-1 overflow-hidden rounded-full"
                  role="meter"
                  aria-label={`${ELEMENT_LABELS[key as FiveElementType]}元素`}
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${value}%`, backgroundColor: elementColors[key as FiveElementType] }}
                  />
                </div>
                <span className="w-10 text-right text-xs text-muted">{value}%</span>
              </div>
            ))}
          </div>
          <p className="mt-7 text-xs text-muted">
            相宜意象：{bazi.favorableElements.map((e) => ELEMENT_LABELS[e]).join(' · ')}
          </p>
        </Card>
      </div>
      <Card className="mt-6">
        <details>
          <summary className="font-display text-lg tracking-widest">
            四柱参考{' '}
            <span className="ml-2 font-sans text-xs tracking-normal text-muted">展开查看传统信息</span>
          </summary>
          <div className="mt-7 grid grid-cols-4 gap-3">
            {[
              ['年柱', bazi.yearPillar],
              ['月柱', bazi.monthPillar],
              ['日柱', bazi.dayPillar],
              ['时柱', profile.unknownTime ? '未定' : bazi.hourPillar]
            ].map(([label, value]) => (
              <div key={label} className="inset-panel rounded-2xl py-5 text-center">
                <p className="text-xs text-muted">{label}</p>
                <p className="mt-4 font-display text-xl tracking-widest text-jade sm:text-3xl">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-7 text-muted">
            排盘使用近似节气规则，暂不支持农历转换与真太阳时。
            {profile.unknownTime ? '时辰未知，其他意象以正午作为参考计算。' : ''}仅作文化体验参考。
          </p>
        </details>
      </Card>
      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="mb-3 text-xs tracking-widest text-muted">再向内，走一步</p>
            <h2 className="font-display text-xl tracking-widest">心象深度解读</h2>
          </div>
          {!report && (
            <Button
              onClick={() => {
                void analyze();
              }}
              disabled={pending}
            >
              {pending ? '正在细读…' : '生成 AI 解读'}
              <Icon name="leaf" />
            </Button>
          )}
        </div>
        {report ? (
          <div className="mt-6">
            <Prose key={report.createdAt} text={report.content} animate={Date.parse(report.createdAt) >= openedAt} />
            <p className="mt-6 text-xs text-muted">
              AI 生成 · {new Date(report.createdAt).toLocaleDateString('zh-CN')} · 仅作自我观察参考
            </p>
          </div>
        ) : (
          <p className="mt-5 text-xs leading-7 text-muted">
            主动生成时，出生信息与心象盘将发送给所配置的 AI
            服务。内容以自我观察为主，可能存在偏差，不作为现实决策依据。
          </p>
        )}
        {error && (
          <div className="mt-5">
            <Notice error>{error}</Notice>
          </div>
        )}
      </Card>
    </div>
  );
}
