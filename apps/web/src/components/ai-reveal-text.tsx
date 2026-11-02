import type { RevealChunk } from '../lib/ai-reveal.ts';
import './ai-reveal-text.css';

export function AiRevealText({ chunks, animate = false }: { chunks: RevealChunk[]; animate?: boolean }) {
  if (!animate) return <>{chunks.map(chunk => chunk.text).join('')}</>;
  return <>{chunks.map((chunk, index) => (
    <span key={`${index}:${chunk.text}`} className="ai-reveal-chunk" style={{ animationDelay: `${chunk.delay}ms` }}>
      {chunk.text}
    </span>
  ))}</>;
}
