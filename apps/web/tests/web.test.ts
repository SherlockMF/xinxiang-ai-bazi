import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { storage } from '../src/services/storage-adapter.ts';
import { Network } from '../src/network.ts';
import { generateBaziProfile } from '../src/services/bazi-service.ts';
import { generateDailyFortune } from '../src/services/fortune-service.ts';
import {
  getProfiles,
  upsertProfile,
  removeProfileData,
  clearAllData
} from '../src/services/storage-service.ts';
import {
  addFavoriteItem,
  getFavoriteItems,
  buildDailyVerseFavorite
} from '../src/services/favorite-service.ts';
import { sendAskQuestion } from '../src/services/ask-service.ts';
import type { UserProfile } from '../src/types/index.ts';
import { generateBaziAnalysis, getCachedAnalysis } from '../src/services/analysis-service.ts';
import { useAppStore } from '../src/store.ts';

const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
    removeItem: (key: string) => memory.delete(key)
  }
});
beforeEach(() => memory.clear());
const profile = (id = 'test'): UserProfile => ({
  id,
  birthDate: '1998-06-15',
  birthTime: '10:30',
  timeBranch: '巳时',
  unknownTime: false,
  calendarType: 'solar',
  privacyAccepted: true,
  createdAt: '2026-11-02',
  updatedAt: '2026-11-02'
});

test('浏览器存储与旧小程序数据隔离', () => {
  memory.set('xinxiang_profiles', 'original');
  storage.setItem('xinxiang_profiles', 'web');
  assert.equal(storage.getItem('xinxiang_profiles'), 'web');
  assert.equal(memory.get('xinxiang_profiles'), 'original');
});
test('同日同生辰稳定，档案各自缓存', async () => {
  const a = profile('a'),
    b = profile('b');
  const fa = await generateDailyFortune(await generateBaziProfile(a), a, '2026-11-02');
  const fb = await generateDailyFortune(await generateBaziProfile(b), b, '2026-11-02');
  assert.equal(fa.cyberBlessing, fb.cyberBlessing);
  assert.equal(fa.overallScore, fb.overallScore);
  assert.equal(fb.userId, 'b');
  assert.deepEqual(await generateDailyFortune(await generateBaziProfile(a), a, '2026-11-02'), fa);
});
test('收藏去重、删除档案和清空只影响网页版数据', async () => {
  const a = profile('a'),
    b = profile('b');
  upsertProfile(a);
  upsertProfile(b);
  const fortune = await generateDailyFortune(await generateBaziProfile(a), a, '2026-11-02');
  const favorite = buildDailyVerseFavorite(a.id, fortune);
  assert.equal(addFavoriteItem(favorite), 'added');
  assert.equal(addFavoriteItem(favorite), 'duplicate');
  removeProfileData(a.id);
  assert.deepEqual(
    getProfiles().map((p) => p.id),
    ['b']
  );
  assert.equal(getFavoriteItems(a.id).length, 0);
  memory.set('another-app', 'keep');
  clearAllData();
  assert.equal(getProfiles().length, 0);
  assert.equal(memory.get('another-app'), 'keep');
});
test('高风险问题不发网络请求', async (t) => {
  let called = false;
  t.mock.method(globalThis, 'fetch', async () => {
    called = true;
    throw new Error('unexpected');
  });
  const answer = await sendAskQuestion({ question: '我该买哪只股票' });
  assert.equal(answer.source, 'safety_fallback');
  assert.equal(called, false);
});
test('网络错误得到明确的本地回应', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('offline', { status: 503 }));
  const answer = await sendAskQuestion({ question: '今天沟通要注意什么？' });
  assert.equal(answer.source, 'fallback');
});
test('适配器保持现有后端响应封装', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ code: 200, data: { content: 'ok' } }));
  const response = await Network.request({ url: '/api/bazi/analyze', method: 'POST', data: {} });
  assert.equal(response.data.data.content, 'ok');
});
test('请求超时取消等待', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    (_input: unknown, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      })
  );
  await assert.rejects(Network.request({ url: '/api/chat/message', timeout: 10 }), /aborted/);
});

for (const action of ['delete', 'clear', 'edit'] as const) {
  test(`AI 解读晚返回不会恢复已${action}的档案缓存`, async (t) => {
    const user = profile();
    upsertProfile(user);
    let respond!: (value: Response) => void;
    t.mock.method(
      globalThis,
      'fetch',
      () =>
        new Promise<Response>((resolve) => {
          respond = resolve;
        })
    );
    const pending = generateBaziAnalysis(user, await generateBaziProfile(user));
    if (action === 'delete') removeProfileData(user.id);
    else if (action === 'clear') clearAllData();
    else upsertProfile({ ...user, birthDate: '2000-01-01', updatedAt: '2026-11-03' });
    respond(Response.json({ code: 200, data: { content: '旧盘解读' } }));
    await pending;
    assert.equal(getCachedAnalysis(user.id), null);
  });
}

test('有效 AI 解读保存到当前档案缓存', async (t) => {
  const user = profile();
  upsertProfile(user);
  t.mock.method(globalThis, 'fetch', async () => Response.json({ code: 200, data: { content: '新的解读' } }));
  const report = await generateBaziAnalysis(user, await generateBaziProfile(user));
  assert.equal(getCachedAnalysis(user.id)?.content, report.content);
});

test('多档案状态切换隔离收藏，清空使尚未完成的读取失效', async () => {
  const store = useAppStore.getState();
  await store.saveProfile(profile('first'));
  const firstFortune = useAppStore.getState().fortune!;
  store.favorite(buildDailyVerseFavorite('first', firstFortune));
  await store.saveProfile(profile('second'));
  assert.equal(useAppStore.getState().favorites.length, 0);
  assert.equal(useAppStore.getState().fortune?.userId, 'second');
  await store.selectProfile('first');
  assert.equal(useAppStore.getState().favorites.length, 1);
  const pending = store.selectProfile('second');
  store.clear();
  await pending;
  assert.equal(useAppStore.getState().profile, null);
  assert.equal(useAppStore.getState().fortune, null);
  assert.equal(getProfiles().length, 0);
});
