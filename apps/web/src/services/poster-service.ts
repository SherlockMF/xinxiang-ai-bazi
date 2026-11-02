import type { DailyFortune } from '../types/index.ts';

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const char of text) {
    if (ctx.measureText(line + char).width > width && line) {
      lines.push(line);
      line = char;
    } else line += char;
  }
  if (line) lines.push(line);
  return lines;
}
export function drawPoster(canvas: HTMLCanvasElement, fortune: DailyFortune): void {
  canvas.width = 900;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('当前浏览器不支持海报绘制。');
  ctx.fillStyle = '#eee8db';
  ctx.fillRect(0, 0, 900, 1280);
  ctx.strokeStyle = '#c5b99f';
  ctx.lineWidth = 1;
  ctx.strokeRect(32, 32, 836, 1216);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#756e64';
  ctx.font = '22px sans-serif';
  ctx.fillText('心 象   ·   今 日 签', 450, 112);
  ctx.font = '20px sans-serif';
  ctx.fillText(fortune.date.replaceAll('-', ' / '), 450, 160);
  ctx.strokeStyle = '#769489';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(450, 332, 99, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#3f7169';
  ctx.font = '44px "Songti SC", "SimSun", serif';
  ctx.fillText(fortune.moodKeyword.replace(/日$/, ''), 450, 345);
  ctx.fillStyle = '#49443c';
  ctx.font = '38px "Songti SC", "SimSun", serif';
  const lines = wrap(ctx, fortune.cyberBlessing, 670).slice(0, 5);
  let y = 550;
  for (const line of lines) {
    ctx.fillText(line, 450, y);
    y += 64;
  }
  ctx.fillStyle = '#756e64';
  ctx.font = '24px sans-serif';
  y = Math.max(y + 45, 790);
  for (const line of wrap(ctx, fortune.actionSuggestion, 660).slice(0, 3)) {
    ctx.fillText(line, 450, y);
    y += 38;
  }
  ctx.fillStyle = '#3f7169';
  ctx.font = '24px sans-serif';
  ctx.fillText(`宜  ${fortune.yi.slice(0, 2).join(' · ')}`, 450, 1015);
  ctx.fillStyle = '#995560';
  ctx.fillText(`缓  ${fortune.ji.slice(0, 2).join(' · ')}`, 450, 1060);
  ctx.fillStyle = '#9d6456';
  ctx.font = '28px "SimSun", serif';
  ctx.fillText('心 象', 450, 1140);
  ctx.fillStyle = '#756e64';
  ctx.font = '18px sans-serif';
  ctx.fillText('传统文化与自我观察参考，不作为现实决策依据', 450, 1200);
}
export async function downloadPoster(fortune: DailyFortune): Promise<void> {
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  drawPoster(canvas, fortune);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('海报生成失败。'))), 'image/png')
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `xinxiang-${fortune.date}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export function publicShareUrl(): string {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '/';
  return url.href;
}
