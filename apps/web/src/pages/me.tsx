import { useState } from 'react';
import { useAppStore } from '../store';
import { Button, Card, EmptyState, Icon, Modal, Notice, PageTitle, useToast } from '../components/ui';
import { getVisitStats } from '../services/visit-stats-service.ts';
import { getRecentHistory } from '../services/history-service.ts';
import { getReminderPreference, saveReminderPreference } from '../services/reminder-service.ts';
import { RELATION_LABELS } from '../types/index.ts';

export default function MePage() {
  const { profile, bazi, favorites, profiles, clear } = useAppStore();
  const [reminder, setReminder] = useState(() => (profile ? getReminderPreference(profile.id) : null));
  const [confirmClear, setConfirmClear] = useState(false);
  const { notify, toast } = useToast();
  if (!profile || !bazi) return <EmptyState />;
  const stats = getVisitStats(profile.id);
  const history = getRecentHistory(profile.id, 7);
  const saveReminder = () => {
    if (!reminder) return;
    try {
      saveReminderPreference(profile.id, reminder);
      notify('心约偏好已保存');
    } catch (error) {
      notify(error instanceof Error ? error.message : '未能保存。');
    }
  };
  return (
    <div className="page-enter">
      <PageTitle
        eyebrow="RETURN TO YOURSELF / 慢慢认识你"
        title="本心"
        description="与自己相处的日子，都值得被好好记住。"
      />
      <Card className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex min-w-0 max-w-full items-center gap-5">
          <span className="inset-panel flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-3xl text-jade">
            {(profile.nickname || '我').slice(0, 1)}
          </span>
          <div className="min-w-0">
            <h2 className="break-words font-display text-2xl">{profile.nickname || '我的心象'}</h2>
            <p className="mt-2 text-xs text-muted">
              {RELATION_LABELS[profile.relation || 'self']} · {profile.birthDate} ·{' '}
              {profile.unknownTime ? '时辰未知' : profile.timeBranch}
            </p>
            <p className="mt-2 text-xs text-jade">{bazi.personalityTags.slice(0, 3).join(' · ')}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="#/birth?edit=1" className="button button-soft rounded-2xl px-5 py-3 text-sm">
            编辑档案
          </a>
          <a
            href="#/chart"
            className="button button-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm"
          >
            心象盘
            <Icon name="arrow" />
          </a>
        </div>
      </Card>
      <div className="my-6 grid grid-cols-3 gap-3 sm:gap-6">
        {[
          ['连续观心', stats.streakDays, '天'],
          ['近期相见', stats.totalVisitDays, '天'],
          ['珍藏心意', favorites.length, '则']
        ].map(([label, value, unit]) => (
          <Card key={label} className="px-3 text-center">
            <p className="text-[.65rem] text-muted sm:text-xs">{label}</p>
            <p className="mt-4 font-display text-3xl text-jade sm:text-4xl">
              {value}
              <span className="ml-1 font-sans text-[.65rem] text-muted sm:ml-2">{unit}</span>
            </p>
          </Card>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl tracking-widest">近七次心象</h2>
            <span className="text-[.6rem] text-muted">你的来时路</span>
          </div>
          <div className="space-y-6">
            {history.map((item) => (
              <article key={item.date} className="flex gap-5">
                <time className="shrink-0 pt-1 text-xs text-muted">
                  {item.date.slice(5).replace('-', ' / ')}
                </time>
                <div>
                  <h3 className="font-display text-lg text-jade">{item.title}</h3>
                  <p className="mt-2 text-xs leading-7 text-muted">{item.verse}</p>
                </div>
              </article>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-xl tracking-widest">每日心约</h2>
            <p className="mb-5 mt-3 text-xs leading-7 text-muted">为每天的自己，留一点安静的时间。</p>
            {reminder && (
              <>
                <label className="flex items-center justify-between text-sm">
                  <span>记下我的心约</span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={reminder.enabled}
                    onChange={(e) => setReminder({ ...reminder, enabled: e.target.checked })}
                  />
                </label>
                <label className="mt-5 block text-xs text-muted">
                  心约时间
                  <input
                    type="time"
                    className="field mt-2"
                    value={reminder.time}
                    disabled={!reminder.enabled}
                    onChange={(e) => setReminder({ ...reminder, time: e.target.value })}
                  />
                </label>
                <Button
                  className="mt-5 w-full"
                  variant="soft"
                  onClick={saveReminder}
                  disabled={!reminder.time}
                >
                  保存心约
                </Button>
                <p className="mt-4 text-[.65rem] leading-6 text-muted">
                  当前仅保存偏好，网页关闭后不会推送通知。
                </p>
              </>
            )}
          </Card>
          <Card className="space-y-5">
            <a href="#/profiles" className="flex items-center justify-between gap-3 text-sm">
              <span>
                心象档案 <span className="ml-2 text-xs text-muted">{profiles.length} 位</span>
              </span>
              <Icon name="arrow" />
            </a>
            <a href="#/favorites" className="flex items-center justify-between gap-3 text-sm">
              <span>我的珍藏</span>
              <Icon name="arrow" />
            </a>
          </Card>
        </div>
      </div>
      <div className="mt-8 rounded-2xl bg-ink/3 p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="text-sm">你的隐私，由你掌握</h2>
            <p className="mt-2 max-w-2xl text-xs leading-7 text-muted">
              档案、历史和收藏保存在这个浏览器，不会自动跨设备同步。清除后无法恢复。AI
              请求中已发送的内容不属于本地数据清除范围。
            </p>
          </div>
          <Button variant="danger" onClick={() => setConfirmClear(true)}>
            <Icon name="trash" />
            清除本地数据
          </Button>
        </div>
      </div>
      {confirmClear && (
        <Modal title="清除所有本地数据？" onClose={() => setConfirmClear(false)}>
          <Notice error>将删除此网页版的全部档案、心象历史、对话、收藏与心约，无法恢复。</Notice>
          <div className="mt-7 flex flex-col justify-end gap-3 sm:flex-row">
            <Button variant="soft" onClick={() => setConfirmClear(false)}>
              暂时保留
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                try {
                  clear();
                  location.hash = '/';
                } catch {
                  notify('清除失败，请检查浏览器存储权限。');
                }
              }}
            >
              确认清除
            </Button>
          </div>
        </Modal>
      )}
      {toast}
    </div>
  );
}
