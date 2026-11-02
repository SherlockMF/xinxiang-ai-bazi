import { useState } from 'react';
import { useAppStore } from '../store';
import { Button, Card, EmptyState, Icon, Modal, PageTitle, useToast } from '../components/ui';
import { buildDailyXiangFavorite } from '../services/favorite-service.ts';
import { downloadPoster, publicShareUrl } from '../services/poster-service.ts';

export default function SharePage() {
  const { profile, fortune, favorites, favorite } = useAppStore();
  const [busy, setBusy] = useState(false);
  const [copyText, setCopyText] = useState('');
  const { notify, toast } = useToast();
  if (!profile || !fortune) return <EmptyState title="你的第一签，正在等你" />;
  const saved = favorites.some((f) => f.type === 'daily_xiang' && f.sourceDate === fortune.date);
  const download = async () => {
    setBusy(true);
    try {
      await downloadPoster(fortune);
      notify('海报已生成，已发起 PNG 下载');
    } catch (error) {
      notify(error instanceof Error ? error.message : '海报生成失败，请重试。');
    } finally {
      setBusy(false);
    }
  };
  const share = async () => {
    const url = publicShareUrl();
    const text = `今日心象 · ${fortune.moodKeyword}\n${fortune.cyberBlessing}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: '心象 · 今日签', text, url });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        notify('签文与链接已复制');
      } else setCopyText(`${text}\n${url}`);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setCopyText(`${text}\n${url}`);
    }
  };
  return (
    <div className="page-enter">
      <PageTitle
        eyebrow="A MOMENT TO KEEP / 留住片刻"
        title="签亭"
        description="把一日的心意，收成一张签。留给自己，也赠予有缘人。"
        action={
          <a href="#/favorites" className="flex items-center gap-2 text-sm text-jade">
            我的珍藏 <span className="inset-panel rounded-full px-2 py-1 text-xs">{favorites.length}</span>
            <Icon name="arrow" />
          </a>
        }
      />
      <div className="grid items-center gap-10 xl:grid-cols-[1.1fr_1fr]">
        <div className="flex justify-center py-4">
          <article className="poster relative flex min-h-[35rem] w-full max-w-sm flex-col items-center px-9 py-10 text-center sm:px-12">
            <p className="text-[.65rem] tracking-[.4em] text-muted">心象 · 今日签</p>
            <p className="mt-3 text-[.6rem] tracking-[.2em] text-muted">
              {fortune.date.replaceAll('-', ' / ')}
            </p>
            <div className="my-8 flex h-28 w-28 items-center justify-center rounded-full border border-jade/30">
              <h2 className="font-display text-2xl tracking-widest text-jade">
                {fortune.moodKeyword.replace(/日$/, '')}
              </h2>
            </div>
            <p className="font-display text-2xl leading-[1.9] tracking-widest">{fortune.cyberBlessing}</p>
            <p className="mt-7 text-xs leading-7 text-muted">{fortune.actionSuggestion}</p>
            <div className="mt-7 space-y-3 text-xs">
              <p className="text-jade">宜　{fortune.yi.slice(0, 2).join(' · ')}</p>
              <p className="text-rose">缓　{fortune.ji.slice(0, 2).join(' · ')}</p>
            </div>
            <div className="mt-auto pt-8">
              <span className="seal seal-small">心</span>
              <p className="mt-4 text-[.55rem] text-muted">所言仅为遣怀清心，非关休咎。</p>
            </div>
          </article>
        </div>
        <div className="space-y-7">
          <div>
            <p className="mb-4 text-xs tracking-widest text-gold">把温柔，留得久一点</p>
            <h2 className="font-display text-3xl leading-relaxed tracking-widest">
              这一签，
              <br />
              是今天送给你的信。
            </h2>
            <p className="mt-5 max-w-md text-sm leading-8 text-muted">
              不必急着寻找答案。也许只是某一句话，刚好替此刻的你，说出了心声。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={busy}
              onClick={() => {
                void download();
              }}
            >
              <Icon name="download" />
              {busy ? '正在制签…' : '下载签卡'}
            </Button>
            <Button
              variant="soft"
              onClick={() => {
                const result = favorite(buildDailyXiangFavorite(profile.id, fortune));
                notify(
                  result === 'added'
                    ? '今日心象已珍藏'
                    : result === 'duplicate'
                      ? '今日心象已在珍藏中'
                      : '收藏失败，请检查本地存储。'
                );
              }}
            >
              <Icon name={saved ? 'check' : 'bookmark'} />
              {saved ? '已珍藏' : '珍藏此签'}
            </Button>
            <Button
              variant="soft"
              onClick={() => {
                void share();
              }}
            >
              <Icon name="share" />
              分享
            </Button>
          </div>
          <p className="text-xs leading-7 text-muted">
            下载为清晰 PNG 图片。分享仅包含签文与网站入口，
            <br className="hidden sm:block" />
            不包含你的姓名、出生信息或个人档案。
          </p>
          <Card>
            <p className="text-xs tracking-widest text-muted">签亭小记</p>
            <p className="mt-4 font-display text-lg leading-8">
              日签日日不同，
              <br />
              愿你日日，都能与自己好好相处。
            </p>
            <a href="#/favorites" className="mt-5 inline-flex items-center gap-3 text-xs text-jade">
              翻开我的珍藏 <Icon name="arrow" />
            </a>
          </Card>
        </div>
      </div>
      {copyText && (
        <Modal title="复制这份心意" onClose={() => setCopyText('')}>
          <p className="mb-4 text-sm text-muted">当前浏览器无法自动分享，请选中并复制以下内容。</p>
          <textarea
            aria-label="分享内容"
            className="field min-h-36"
            readOnly
            value={copyText}
            onFocus={(e) => e.target.select()}
          />
        </Modal>
      )}
      {toast}
    </div>
  );
}
