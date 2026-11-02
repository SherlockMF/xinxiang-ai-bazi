import { lazy, Suspense, useEffect, useState } from 'react';
import { useAppStore } from './store';
import { Icon, Notice, type IconName } from './components/ui';
import { getTodayDateString } from './services/birth-utils.ts';
import WelcomePage from './pages/welcome';

const TodayPage = lazy(() => import('./pages/today'));
const BirthPage = lazy(() => import('./pages/birth'));
const ChatPage = lazy(() => import('./pages/chat'));
const SharePage = lazy(() => import('./pages/share'));
const MePage = lazy(() => import('./pages/me'));
const ProfilesPage = lazy(() => import('./pages/profiles'));
const ChartPage = lazy(() => import('./pages/chart'));
const FavoritesPage = lazy(() => import('./pages/favorites'));
const nav: { route: string; title: string; note: string; icon: IconName }[] = [
  { route: '/today', title: '今日', note: '一日一象', icon: 'sun' },
  { route: '/chat', title: '问心', note: '听见自己', icon: 'chat' },
  { route: '/share', title: '签亭', note: '留住片刻', icon: 'bookmark' },
  { route: '/me', title: '本心', note: '慢慢认识你', icon: 'user' }
];
export default function App() {
  const [hash, setHash] = useState(() => location.hash.slice(1) || '/');
  const { profile, profiles, ready, loading, error, initialize, selectProfile, fortune } = useAppStore();
  useEffect(() => {
    void initialize();
  }, [initialize]);
  useEffect(() => {
    const change = () => {
      setHash(location.hash.slice(1) || '/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    const refreshDate = () => {
      if (profile && fortune && fortune.date !== getTodayDateString() && !document.hidden)
        void selectProfile(profile.id);
    };
    const timer = setInterval(refreshDate, 60000);
    document.addEventListener('visibilitychange', refreshDate);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshDate);
    };
  }, [profile, fortune, selectProfile]);
  const route = hash.split('?')[0];
  const current = route === '/' && profile ? '/today' : route;
  const active = ['/birth', '/profiles', '/chart', '/favorites'].includes(current) ? '/me' : current;
  const date = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(
    new Date()
  );
  let page;
  switch (current) {
    case '/':
      page = <WelcomePage />;
      break;
    case '/today':
      page = <TodayPage />;
      break;
    case '/birth':
      page = <BirthPage key={hash + profile?.id} edit={hash.includes('edit=1')} />;
      break;
    case '/chat':
      page = <ChatPage key={profile?.id} />;
      break;
    case '/share':
      page = <SharePage key={profile?.id} />;
      break;
    case '/me':
      page = <MePage key={profile?.id} />;
      break;
    case '/profiles':
      page = <ProfilesPage />;
      break;
    case '/chart':
      page = <ChartPage key={profile?.id + (profile?.updatedAt || '')} />;
      break;
    case '/favorites':
      page = <FavoritesPage />;
      break;
    default:
      page = (
        <div className="py-20 text-center">
          <h1 className="font-display text-3xl">此处暂未落笔</h1>
          <a href="#/today" className="mt-6 inline-block text-jade">
            回到今日 →
          </a>
        </div>
      );
  }
  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        跳到主要内容
      </a>
      <aside className="sidebar fixed inset-y-0 left-0 z-30 hidden w-60 flex-col px-7 py-10 lg:flex">
        <a href="#/" className="flex items-center gap-4" aria-label="心象首页">
          <span className="seal">心</span>
          <span>
            <span className="font-display block text-3xl tracking-[.25em]">心象</span>
            <span className="mt-2 block text-[.6rem] tracking-[.32em] text-muted">XINXIANG</span>
          </span>
        </a>
        <p className="mt-12 text-[.65rem] tracking-[.18em] text-muted">向内观照 · 自有回响</p>
        <nav aria-label="主导航" className="mt-8 space-y-3">
          {nav.map((item) => (
            <a
              key={item.route}
              href={`#${item.route}`}
              aria-current={active === item.route ? 'page' : undefined}
              className={`nav-link flex items-center gap-4 rounded-2xl px-5 py-4 ${active === item.route ? 'nav-active' : ''}`}
            >
              <Icon name={item.icon} />
              <span>
                <span className="block text-sm tracking-widest">{item.title}</span>
                <span className="mt-1 block text-[.65rem] text-muted">{item.note}</span>
              </span>
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-16">
          <span className="font-display text-2xl text-muted">「</span>
          <p className="my-3 font-display text-sm leading-8 tracking-widest text-muted">
            心有一隅静，
            <br />
            日子便生香。
          </p>
          <span className="font-display text-2xl text-muted">」</span>
          <p className="mt-9 text-[.6rem] tracking-widest text-muted">一处留给自己的静心之所</p>
        </div>
      </aside>
      <div className="lg:ml-60">
        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 sm:px-10 lg:px-14 lg:py-9">
          <a href="#/" className="flex items-center gap-2 font-display text-xl tracking-widest lg:hidden">
            <span className="seal seal-small">心</span>心象
          </a>
          <p className="hidden text-xs tracking-widest text-muted sm:block">
            {date}
            <span className="mx-4 opacity-40">/</span>此刻，正好
          </p>
          {profile ? (
            <label className="flex min-w-0 items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-jade" />
              <span className="sr-only">当前档案</span>
              <select
                aria-label="当前档案"
                value={profile.id}
                disabled={loading}
                onChange={(e) => {
                  void selectProfile(e.target.value);
                }}
                className="max-w-36 truncate bg-transparent py-2 pr-1 text-ink"
              >
                {profiles.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.nickname || '我的心象'}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="text-xs tracking-wider text-muted">每日一签 · 与自己相见</span>
          )}
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto min-h-[75vh] max-w-7xl px-6 pb-10 pt-4 sm:px-10 lg:px-14"
        >
          {error && (
            <div className="mb-6">
              <Notice error>{error}</Notice>
            </div>
          )}
          {!ready || loading ? (
            <div className="flex min-h-96 items-center justify-center gap-3 text-jade" role="status">
              <span className="loading-orbit" />
              正在整理你的心象…
            </div>
          ) : (
            <Suspense
              fallback={
                <p role="status" className="py-20 text-center text-muted">
                  正在展开…
                </p>
              }
            >
              {page}
            </Suspense>
          )}
        </main>
        <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-6 pb-28 pt-6 text-[.65rem] leading-6 tracking-wide text-muted sm:px-10 lg:px-14 lg:pb-9">
          <span>心象 XINXIANG · 愿你心有安处</span>
          <span>传统文化与自我观察参考，不作为现实决策依据。</span>
        </footer>
      </div>
      <nav
        aria-label="移动端导航"
        className="mobile-nav fixed inset-x-0 bottom-0 z-40 flex items-center justify-around px-2 pb-2 pt-3 lg:hidden"
      >
        {nav.map((item) => (
          <a
            key={item.route}
            href={`#${item.route}`}
            aria-current={active === item.route ? 'page' : undefined}
            className={`flex min-w-16 flex-col items-center gap-1.5 rounded-xl px-3 py-2 text-[.7rem] ${active === item.route ? 'text-jade' : 'text-muted'}`}
          >
            <Icon name={item.icon} />
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  );
}
