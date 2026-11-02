import { useState, type FormEvent } from 'react';
import { useAppStore } from '../store';
import { Button, Card, Icon, Notice, PageTitle } from '../components/ui';
import { getTodayDateString, timeToBranch } from '../services/birth-utils.ts';
import type { ProfileRelation, UserProfile } from '../types/index.ts';
import { RELATION_LABELS } from '../types/index.ts';

export default function BirthPage({ edit }: { edit: boolean }) {
  const { profile, profiles, saveProfile } = useAppStore();
  const existing = edit ? profile : null;
  const [nickname, setNickname] = useState(existing?.nickname || '');
  const [birthDate, setBirthDate] = useState(existing?.birthDate || '');
  const [birthTime, setBirthTime] = useState(existing?.birthTime || '');
  const [unknownTime, setUnknownTime] = useState(existing?.unknownTime || false);
  const [gender, setGender] = useState<UserProfile['gender']>(existing?.gender || 'unknown');
  const [relation, setRelation] = useState<ProfileRelation>(
    existing?.relation || (profiles.length ? 'family' : 'self')
  );
  const [birthPlace, setBirthPlace] = useState(existing?.birthPlace || '');
  const [accepted, setAccepted] = useState(existing?.privacyAccepted || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!birthDate || birthDate < '1900-01-01' || birthDate > getTodayDateString()) {
      setError('请选择 1900 年至今天之间的出生日期。');
      return;
    }
    if (!unknownTime && !birthTime) {
      setError('请选择出生时间，或勾选不知道时辰。');
      return;
    }
    if (!accepted) {
      setError('请先阅读并同意隐私说明。');
      return;
    }
    setError('');
    setSaving(true);
    const now = new Date().toISOString();
    try {
      await saveProfile({
        id: existing?.id || crypto.randomUUID(),
        nickname: nickname.trim() || RELATION_LABELS[relation],
        relation,
        birthDate,
        birthTime: unknownTime ? undefined : birthTime,
        unknownTime,
        timeBranch: unknownTime ? 'unknown' : timeToBranch(birthTime),
        gender,
        birthPlace: birthPlace.trim() || undefined,
        calendarType: 'solar',
        privacyAccepted: true,
        privacyAcceptedAt: now,
        createdAt: existing?.createdAt || now,
        updatedAt: now
      });
      location.hash = '/today';
    } catch (err) {
      setError(err instanceof Error ? err.message : '暂时无法保存，请重试。');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="page-enter">
      <PageTitle
        eyebrow="THE BEGINNING / 缘起"
        title={existing ? '重拾你的心象' : '从认识你开始'}
        description="留下一点关于你的线索，让每日的相见更有温度。"
      />
      <div className="grid items-start gap-8 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="block">
                  如何称呼你 <span className="text-xs text-muted">选填</span>
                </span>
                <input
                  className="field"
                  autoComplete="nickname"
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="一个让你安心的名字"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="block">这份心象属于</span>
                <select
                  className="field"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value as ProfileRelation)}
                >
                  {Object.entries(RELATION_LABELS).map(([v, label]) => (
                    <option value={v} key={v}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block space-y-2 text-sm">
              <span className="block">
                出生日期 <span className="text-xs text-muted">公历</span>
              </span>
              <input
                className="field"
                type="date"
                min="1900-01-01"
                max={getTodayDateString()}
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </label>
            <div>
              <label className="block space-y-2 text-sm">
                <span className="block">出生时间</span>
                <input
                  className="field"
                  type="time"
                  required={!unknownTime}
                  disabled={unknownTime}
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                />
              </label>
              <label className="mt-4 flex items-center gap-3 text-xs text-muted">
                <input
                  type="checkbox"
                  checked={unknownTime}
                  onChange={(e) => setUnknownTime(e.target.checked)}
                />
                不知道具体时辰
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="block">
                  性别 <span className="text-xs text-muted">选填</span>
                </span>
                <select
                  className="field"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as UserProfile['gender'])}
                >
                  <option value="unknown">暂不填写</option>
                  <option value="female">女</option>
                  <option value="male">男</option>
                  <option value="other">其他</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="block">
                  出生地 <span className="text-xs text-muted">选填</span>
                </span>
                <input
                  className="field"
                  maxLength={60}
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="城市或地区"
                />
              </label>
            </div>
            <div className="inset-panel rounded-2xl p-5">
              <label className="flex items-start gap-3 text-xs leading-6">
                <input
                  className="mt-1"
                  type="checkbox"
                  required
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <span>
                  我已了解：档案与收藏保存在当前浏览器；主动使用 AI
                  问心或解读时，相关出生信息、心象与问题会发送到所配置的 AI 服务。可在「本心」清除本地数据。
                </span>
              </label>
            </div>
            {error && <Notice error>{error}</Notice>}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? '正在整理…' : existing ? '保存心象档案' : '开启我的心象'}
                <Icon name="arrow" />
              </Button>
              {profiles.length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    location.hash = '/profiles';
                  }}
                >
                  返回
                </Button>
              )}
            </div>
          </form>
        </Card>
        <div className="px-2 py-6">
          <span className="seal mb-8">缘</span>
          <h2 className="font-display text-2xl leading-relaxed tracking-widest">
            每一种相遇，
            <br />
            都有自己的时序。
          </h2>
          <p className="mt-6 text-sm leading-8 text-muted">
            心象借传统文化的意象，邀请你观察自己的情绪与节律。它不会定义你，也不会替你决定人生。
          </p>
          <div className="mt-8 space-y-3 text-xs leading-7 text-muted">
            <p>· 目前使用公历日期，节气按近似规则计算。</p>
            <p>· 时辰未知时，以正午作参考，不代表精确命盘。</p>
            <p>· 出生地用于档案记录，暂不校正真太阳时。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
