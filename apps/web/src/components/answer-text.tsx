import type { AskAnswer } from '../types/index.ts';
import { createRevealSchedule } from '../lib/ai-reveal.ts';
import { AiRevealText } from './ai-reveal-text';

export function AnswerText({ answer, animate }: { answer: AskAnswer; animate: boolean }) {
  const schedule = createRevealSchedule([
    answer.title, answer.observation, answer.innerState, ...answer.suggestions, answer.closingVerse
  ]);
  const reveal = (index: number) => <AiRevealText chunks={schedule[index]} animate={animate} />;
  return <>
    <h2 className="font-display text-xl leading-8">{reveal(0)}</h2>
    <p className="mt-3 text-sm leading-8">{reveal(1)}</p>
    <p className="mt-3 text-sm leading-8 text-muted">{reveal(2)}</p>
    <ol className="my-5 space-y-3">{answer.suggestions.map((_, i) => (
      <li className="flex gap-3 text-sm leading-7" key={i}>
        <span className="font-display text-jade">0{i + 1}</span>
        <span className="min-w-0">{reveal(3 + i)}</span>
      </li>
    ))}</ol>
    <p className="font-display text-base leading-8 text-jade">{reveal(3 + answer.suggestions.length)}</p>
  </>;
}
