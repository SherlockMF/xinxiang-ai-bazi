import { useState } from 'react';
import { useAppStore } from '../store';
import { Button, Card, EmptyState, Icon, Modal, PageTitle, useToast } from '../components/ui';
import { RELATION_LABELS, type UserProfile } from '../types/index.ts';

export default function ProfilesPage() {
  const { profiles, profile, selectProfile, deleteProfile } = useAppStore();
  const [removing, setRemoving] = useState<UserProfile | null>(null);
  const { notify, toast } = useToast();
  return (
    <div className="page-enter">
      <PageTitle
        eyebrow="THE PEOPLE WE CARE FOR / 惦念之人"
        title="心象档案"
        description="每个人都有自己的节律，每份心意都单独珍藏。"
        action={
          <a
            href="#/birth"
            className="button button-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm"
          >
            <Icon name="plus" />
            新增档案
          </a>
        }
      />
      {!profiles.length ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {profiles.map((p) => (
            <Card key={p.id}>
              <div className="flex justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="inset-panel flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-xl text-jade">
                    {(p.nickname || '我').slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="break-words font-display text-xl">
                      {p.nickname || RELATION_LABELS[p.relation || 'self']}
                    </h2>
                    <p className="mt-2 text-xs text-muted">{RELATION_LABELS[p.relation || 'self']}</p>
                  </div>
                </div>
                {p.id === profile?.id && (
                  <span className="h-fit shrink-0 rounded-full bg-jade/10 px-3 py-1 text-xs text-jade">当前</span>
                )}
              </div>
              <p className="my-6 text-sm text-muted">
                {p.birthDate} · {p.unknownTime ? '时辰未知' : p.timeBranch}
              </p>
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="soft"
                  onClick={async () => {
                    await selectProfile(p.id);
                    location.hash = '/today';
                  }}
                >
                  查看心象
                  <Icon name="arrow" />
                </Button>
                <Button
                  variant="ghost"
                  aria-label={`删除${p.nickname || '此档案'}`}
                  onClick={() => setRemoving(p)}
                >
                  <Icon name="trash" className="text-rose" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {removing && (
        <Modal title={`删除「${removing.nickname || '此档案'}」？`} onClose={() => setRemoving(null)}>
          <p className="text-sm leading-8">
            该档案及其日签、对话、收藏和心约将一并删除，无法恢复。其他档案会保留。
          </p>
          <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
            <Button variant="soft" onClick={() => setRemoving(null)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await deleteProfile(removing.id);
                  setRemoving(null);
                  notify('档案已删除');
                } catch {
                  notify('删除失败，请检查本地存储。');
                }
              }}
            >
              确认删除
            </Button>
          </div>
        </Modal>
      )}
      {toast}
    </div>
  );
}
