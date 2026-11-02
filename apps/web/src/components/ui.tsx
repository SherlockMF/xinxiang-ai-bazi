import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode
} from 'react';
import { createPortal } from 'react-dom';
import { AiRevealText } from './ai-reveal-text';
import { createRevealSchedule } from '../lib/ai-reveal.ts';

export type IconName =
  | 'sun'
  | 'chat'
  | 'bookmark'
  | 'user'
  | 'arrow'
  | 'plus'
  | 'download'
  | 'share'
  | 'close'
  | 'leaf'
  | 'check'
  | 'trash'
  | 'moon';
const paths: Record<IconName, ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  chat: (
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
  ),
  bookmark: <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a7 7 0 0 1 16 0v2" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4" />
    </>
  ),
  close: <path d="m6 6 12 12M6 18 18 6" />,
  leaf: (
    <>
      <path d="M20 3C8 1 2 9 5 16s16 8 15-13Z" />
      <path d="M3 22 15 10" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />,
  moon: <path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z" />
};
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 shrink-0 ${className}`}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'ghost' | 'danger' }) {
  return (
    <button
      type="button"
      className={`button button-${variant} inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`neu-card rounded-3xl p-6 sm:p-8 ${className}`} {...props} />;
}
export function PageTitle({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="mb-3 text-xs tracking-[.24em] text-muted">{eyebrow}</p>
        <h1 className="font-display text-3xl tracking-widest sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title = '先认识此刻的你',
  description = '留下一份出生信息，为每日心象写下序章。'
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="mx-auto flex min-h-80 max-w-2xl flex-col items-center justify-center text-center">
      <div className="seal mb-6">心</div>
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="my-5 max-w-sm text-sm leading-7 text-muted">{description}</p>
      <a
        className="button button-primary inline-flex items-center gap-3 rounded-2xl px-6 py-3 text-sm"
        href="#/birth"
      >
        录入生辰 <Icon name="arrow" />
      </a>
    </Card>
  );
}
export function Modal({
  title,
  children,
  onClose
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const trigger = document.activeElement;
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal fixed inset-0 m-auto max-w-none overflow-y-auto overscroll-contain break-words rounded-3xl p-0"
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 id={titleId} className="min-w-0 font-display text-xl">{title}</h2>
          <Button variant="ghost" className="shrink-0 px-3" aria-label="关闭" onClick={onClose}>
            <Icon name="close" />
          </Button>
        </div>
        {children}
      </section>
    </dialog>
  );
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return (
    <p
      role={error ? 'alert' : 'status'}
      className={`rounded-2xl px-4 py-3 text-sm leading-6 ${error ? 'bg-rose/10 text-rose' : 'bg-jade/8 text-jade'}`}
    >
      {children}
    </p>
  );
}
export function useToast() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [message]);
  return {
    notify: setMessage,
    toast: message ? createPortal(
      <div
        className="toast fixed bottom-24 left-1/2 z-50 w-max max-w-[90vw] -translate-x-1/2 rounded-2xl px-6 py-3 text-sm shadow-lg"
        role="status"
      >
        {message}
      </div>,
      document.body
    ) : null
  };
}
export function Prose({ text, animate = false }: { text: string; animate?: boolean }) {
  const lines = text.replace(/\\n/g, '\n').split('\n').map(line => line.replace(/\*\*/g, '').trim());
  const schedule = createRevealSchedule(lines.map(line => line.replace(/^#{1,3}\s/, '').replace(/^[-*]\s/, '· ')));
  return (
    <div className="space-y-3 text-sm leading-8">
      {lines.map((clean, i) => {
          if (!clean) return null;
          if (/^#{1,3}\s/.test(clean))
            return (
              <h3 key={i} className="pt-4 font-display text-lg text-jade">
                <AiRevealText chunks={schedule[i]} animate={animate} />
              </h3>
            );
          return <p key={i}><AiRevealText chunks={schedule[i]} animate={animate} /></p>;
        })}
    </div>
  );
}
