import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAppStore } from '../store';
import { Button, Card, EmptyState, Icon, Notice, PageTitle, useToast } from '../components/ui';
import { buildAskRequest, sendAskQuestion, MAX_ASK_QUESTION_LENGTH } from '../services/ask-service.ts';
import { getChatHistory, saveChatMessage } from '../services/storage-service.ts';
import { buildAskAnswerFavorite } from '../services/favorite-service.ts';
import type { ChatMessage } from '../types/index.ts';
import { getTodayDateString } from '../services/birth-utils.ts';
import { AnswerText } from '../components/answer-text';
import { AiRevealText } from '../components/ai-reveal-text';
import { createRevealSchedule } from '../lib/ai-reveal.ts';

const prompts = [
  '今天适合主动联系对方吗？',
  '今天适合推进重要事情吗？',
  '我现在为什么有点不安？',
  '今天沟通要注意什么？'
];
export default function ChatPage() {
  const { profile, bazi, fortune, favorite, refresh } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    profile ? getChatHistory(profile.id).slice(-30) : []
  );
  const [question, setQuestion] = useState('');
  const [openedAt] = useState(Date.now);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);
  const { notify, toast } = useToast();
  useEffect(() => {
    if (messages.length) bottom.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);
  if (!profile || !bazi || !fortune) return <EmptyState />;
  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = question.trim();
    if (!text || submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError('');
    const createdAt = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      userId: profile.id,
      role: 'user',
      content: text,
      createdAt,
      sourceDate: getTodayDateString()
    };
    try {
      saveChatMessage(userMessage);
      setMessages((prev) => [...prev, userMessage]);
      setQuestion('');
      const answer = await sendAskQuestion(
        buildAskRequest(
          profile.id,
          text,
          profile,
          bazi,
          fortune,
          messages.slice(-10).map((m) => ({ role: m.role, content: m.content }))
        )
      );
      const active = useAppStore.getState().profile;
      if (active?.id !== profile.id || active.updatedAt !== profile.updatedAt) return;
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        userId: profile.id,
        role: 'assistant',
        content: `${answer.title}：${answer.observation}`,
        answer,
        createdAt: new Date().toISOString(),
        sourceDate: getTodayDateString()
      };
      saveChatMessage(reply);
      setMessages((prev) => [...prev, reply]);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '回应未能保存，请重试。');
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };
  return (
    <div className="page-enter">
      <PageTitle
        eyebrow="A CONVERSATION WITHIN / 听见自己"
        title="问心"
        description="有些念头，说出来，就轻了一些。"
      />
      <div className="grid items-start gap-7 xl:grid-cols-[1fr_17rem]">
        <div className="min-w-0">
          <Card className="min-h-80">
            {messages.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                <span className="seal mb-6">问</span>
                <h2 className="font-display text-2xl tracking-widest">此刻，什么在你心上？</h2>
                <p className="mt-5 max-w-sm text-sm leading-8 text-muted">
                  关于情绪、关系，或一件迟迟放不下的小事。
                  <br />
                  不必整理好语言，从一个念头开始。
                </p>
              </div>
            ) : (
              <div className="space-y-7">
                {messages.map((message) =>
                  message.role === 'user' ? (
                    <div
                      key={message.id}
                      className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-jade/10 px-5 py-4"
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-7">{message.content}</p>
                    </div>
                  ) : (
                    <article key={message.id} className="rounded-2xl p-1">
                      <div className="mb-4 flex items-center gap-2 text-xs text-jade">
                        <Icon name="leaf" />
                        <span>心象回应</span>
                        <span className="ml-auto text-[.6rem] text-muted">
                          {message.answer?.source === 'ai'
                            ? 'AI 生成'
                            : message.answer?.source === 'safety_fallback'
                              ? '边界提醒'
                              : '本地陪伴'}
                        </span>
                      </div>
                      {message.answer ? (
                        <>
                          <AnswerText answer={message.answer} animate={Date.parse(message.createdAt) >= openedAt && message.answer.source !== 'safety_fallback'} />
                          {message.answer.source === 'fallback' && (
                            <p className="mt-4 text-xs leading-6 text-muted">
                              AI 服务暂不可用，以上为预设的本地陪伴内容。
                            </p>
                          )}
                          <div className="mt-5 flex justify-end">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                const result = favorite(
                                  buildAskAnswerFavorite(
                                    profile.id,
                                    message.answer!,
                                    message.sourceDate || getTodayDateString(),
                                    message.id
                                  )
                                );
                                notify(
                                  result === 'added'
                                    ? '回应已珍藏'
                                    : result === 'duplicate'
                                      ? '已在珍藏中'
                                      : '收藏失败，请检查本地存储。'
                                );
                              }}
                            >
                              <Icon name="bookmark" />
                              珍藏回应
                            </Button>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm leading-8"><AiRevealText chunks={createRevealSchedule([message.content])[0]} animate={Date.parse(message.createdAt) >= openedAt} /></p>
                      )}
                    </article>
                  )
                )}
              </div>
            )}
            {pending && (
              <p role="status" className="mt-6 flex items-center gap-3 text-sm text-jade">
                <span className="loading-orbit" />
                正在细听你的心声…
              </p>
            )}
            <div ref={bottom} />
          </Card>
          <form onSubmit={send} className="mt-6">
            <label htmlFor="question" className="sr-only">
              想问的问题
            </label>
            <textarea
              id="question"
              className="field min-h-28 resize-y text-sm leading-7"
              placeholder="把此刻的念头，轻轻放在这里…"
              maxLength={MAX_ASK_QUESTION_LENGTH}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={pending}
            />
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-xs text-muted">
                {question.length} / {MAX_ASK_QUESTION_LENGTH}
              </span>
              <Button type="submit" disabled={pending || !question.trim()}>
                {pending ? '静候回应' : '寄予心象'}
                <Icon name="arrow" />
              </Button>
            </div>
            {error && (
              <div className="mt-4">
                <Notice error>{error}</Notice>
              </div>
            )}
          </form>
        </div>
        <aside className="space-y-7">
          <div className="px-1">
            <p className="mb-5 text-xs tracking-[.2em] text-muted">也许，你想聊聊</p>
            <div className="flex flex-col gap-3">
              {prompts.map((prompt, i) => (
                <Button
                  key={prompt}
                  variant="soft"
                  className="justify-start text-left leading-6"
                  disabled={pending}
                  onClick={() => {
                    setQuestion(prompt);
                    document.getElementById('question')?.focus();
                  }}
                >
                  <span className="mr-1 font-display text-jade">0{i + 1}</span>
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
          <div className="inset-panel rounded-2xl p-5">
            <Icon name="moon" className="mb-4 text-gold" />
            <p className="font-display text-base leading-8">
              心象是一面镜子，
              <br />
              选择仍在你的手里。
            </p>
            <p className="mt-4 text-xs leading-7 text-muted">
              回应仅作自我观察参考。医疗、法律、投资等现实决策，请结合事实与专业意见。
            </p>
            <p className="mt-4 text-xs leading-7 text-muted">
              发送后，问题、相关心象与最近对话会交由所配置的 AI 服务处理。
            </p>
          </div>
        </aside>
      </div>
      {toast}
    </div>
  );
}
