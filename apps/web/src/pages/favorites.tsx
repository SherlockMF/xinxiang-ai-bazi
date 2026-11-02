import { useState } from 'react';
import { useAppStore } from '../store';
import { Button, Card, EmptyState, Icon, Modal, PageTitle, useToast } from '../components/ui';
import { FAVORITE_TYPE_LABELS } from '../services/favorite-service.ts';
import type { FavoriteItem, FavoriteItemType } from '../types/index.ts';

export default function FavoritesPage() {
  const { profile, favorites, unfavorite } = useAppStore();
  const [filter, setFilter] = useState<FavoriteItemType | 'all'>('all');
  const [removing, setRemoving] = useState<FavoriteItem | null>(null);
  const { notify, toast } = useToast();
  if (!profile) return <EmptyState />;
  const items = favorites.filter((item) => filter === 'all' || item.type === filter);
  return (
    <div className="page-enter">
      <PageTitle
        eyebrow="LITTLE THINGS THAT STAY / 珍藏心意"
        title="我的珍藏"
        description="那些曾经照亮你的字句，就安放在这里。"
      />
      <div aria-label="珍藏类型" className="mb-8 flex flex-wrap gap-3">
        {[['all', '全部'], ...Object.entries(FAVORITE_TYPE_LABELS)].map(([value, label]) => (
          <Button
            key={value}
            variant={filter === value ? 'primary' : 'soft'}
            aria-pressed={filter === value}
            onClick={() => setFilter(value as typeof filter)}
          >
            {label}
          </Button>
        ))}
      </div>
      {items.length ? (
        <div className="grid items-start gap-6 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[.65rem] tracking-widest text-jade">
                  {FAVORITE_TYPE_LABELS[item.type]}
                </span>
                <time className="text-[.65rem] text-muted">{item.sourceDate}</time>
              </div>
              <h2 className="font-display text-xl leading-8">{item.title}</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-muted">{item.content}</p>
              <div className="mt-5 flex justify-end">
                <Button
                  variant="ghost"
                  aria-label={`移除珍藏：${item.title}`}
                  onClick={() => setRemoving(item)}
                >
                  <Icon name="trash" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex min-h-72 flex-col items-center justify-center text-center">
          <Icon name="bookmark" className="mb-6 h-8 w-8 text-gold" />
          <h2 className="font-display text-xl">这里，等一份触动</h2>
          <p className="my-5 text-sm text-muted">读到喜欢的日签或回应，轻点「珍藏」。</p>
          <a href="#/today" className="text-sm text-jade">
            去看看今日心象 →
          </a>
        </Card>
      )}
      {removing && (
        <Modal title="移除这份珍藏？" onClose={() => setRemoving(null)}>
          <p className="text-sm leading-8">「{removing.title}」将从当前档案的珍藏中移除。</p>
          <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
            <Button variant="soft" onClick={() => setRemoving(null)}>
              保留
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                try {
                  unfavorite(removing.id);
                  setRemoving(null);
                  notify('已移除珍藏');
                } catch {
                  notify('移除失败，请检查本地存储。');
                }
              }}
            >
              确认移除
            </Button>
          </div>
        </Modal>
      )}
      {toast}
    </div>
  );
}
