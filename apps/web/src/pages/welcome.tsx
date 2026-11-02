import { Card, Icon } from '../components/ui';

export default function WelcomePage() {
  return (
    <div className="page-enter">
      <div className="grid min-h-[30rem] items-center gap-8 pb-12 pt-4 xl:grid-cols-[1.1fr_1fr]">
        <div className="relative z-10">
          <p className="mb-7 flex items-center gap-3 text-xs tracking-[.3em] text-jade">
            <span className="h-px w-8 bg-jade/50" />
            一日一象 · 一念一心
          </p>
          <h1 className="font-display text-5xl leading-[1.55] tracking-[.12em] sm:text-6xl">
            向内观照，
            <br />
            <span className="text-jade">自有回响。</span>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-8 text-muted">
            日子很快，不妨为自己慢下来。
            <br />
            在生辰与时序之间，读一签，问一念，
            <br className="hidden sm:block" />
            听见心里的声音。
          </p>
          <a
            href="#/birth"
            className="button button-primary mt-9 inline-flex items-center gap-8 rounded-2xl px-7 py-4 text-sm tracking-widest"
          >
            开启我的心象 <Icon name="arrow" />
          </a>
          <p className="mt-5 text-xs text-muted">出生档案保存在当前浏览器，由你随时清除。</p>
        </div>
        <div
          className="welcome-art relative mx-auto hidden h-[28rem] w-full max-w-md sm:block"
          aria-hidden="true"
        >
          <div className="enso absolute left-1/2 top-12 -translate-x-1/2" />
          <div className="vertical-poem absolute left-[45%] top-24 font-display text-2xl text-jade">
            万物自有时序
            <br />
            心亦自有归处
          </div>
          <span className="seal absolute right-16 top-20">静</span>
          <svg className="absolute bottom-6 left-0 w-full text-jade/30" viewBox="0 0 500 190" fill="none">
            <path
              d="M0 157C60 148 61 72 117 91S185 167 232 99 278 29 321 81 401 104 432 61 477 94 500 92"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M0 179C72 165 95 116 154 138s62 32 110 4 50-54 102-24 89 31 134-5"
              stroke="currentColor"
              strokeWidth=".7"
            />
            <path d="M40 184h390" stroke="currentColor" strokeWidth=".5" />
          </svg>
          <p className="absolute bottom-0 right-10 text-[.6rem] tracking-[.35em] text-muted">
            观心 · 照己 · 慢行
          </p>
        </div>
      </div>
      <div className="stagger grid gap-5 md:grid-cols-3">
        {[
          ['壹', '读一签', '今日心象', '以你的生辰为引，拾起一份每日心意。', 'sun'],
          ['贰', '问一念', '与心对话', '把难以理清的思绪，慢慢说给自己听。', 'chat'],
          ['叁', '留一瞬', '珍藏片刻', '收好一句触动你的话，让温柔有迹可循。', 'bookmark']
        ].map(([n, title, sub, desc, icon]) => (
          <Card key={n} className="relative">
            <div className="mb-6 flex items-center justify-between">
              <Icon name={icon as 'sun' | 'chat' | 'bookmark'} className="text-jade" />
              <span className="font-display text-2xl text-gold/50">{n}</span>
            </div>
            <h2 className="font-display text-xl tracking-widest">
              {title}
              <span className="ml-4 font-sans text-xs tracking-normal text-muted">{sub}</span>
            </h2>
            <p className="mt-4 text-xs leading-7 text-muted">{desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
