// 签亭海报生成与保存

import Taro from '@tarojs/taro';
import type { DailyFortune, PosterPayload } from '../types';

export const POSTER_WIDTH = 750;
export const POSTER_HEIGHT = 1200;
export const POSTER_CANVAS_ID = 'xinxiang-poster-canvas';

const SAFETY_NOTE = '内容仅作传统文化与自我观察参考';

export function truncateText(text: string, maxLen: number): string {
  if (!text) return '';
  const t = text.trim();
  return t.length <= maxLen ? t : `${t.slice(0, maxLen)}…`;
}

export function buildPosterPayload(fortune: DailyFortune): PosterPayload {
  const title = fortune.moodKeyword.includes('日')
    ? fortune.moodKeyword.replace(/日$/, '')
    : fortune.moodKeyword;

  return {
    id: `poster_${fortune.date}_${fortune.userId}`,
    date: fortune.date,
    title,
    subtitle: truncateText(fortune.actionSuggestion, 28),
    verse: fortune.cyberBlessing,
    summary: truncateText(fortune.summary, 60),
    yi: fortune.yi.slice(0, 3),
    ji: fortune.ji.slice(0, 2),
    brand: '心象',
    safetyNote: SAFETY_NOTE,
    qrcodeUrl: undefined,
    createdAt: new Date().toISOString()
  };
}

/** 将文本按最大宽度拆行（按字符数近似） */
function wrapLines(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const ch of text) {
    if ((line + ch).length > maxCharsPerLine) {
      if (line) lines.push(line);
      line = ch;
      if (lines.length >= maxLines) break;
    } else {
      line += ch;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.slice(0, maxLines);
}

/** 在 Canvas 上绘制海报 */
export function drawPosterCanvas(
  ctx: Taro.CanvasContext,
  payload: PosterPayload,
  width = POSTER_WIDTH,
  height = POSTER_HEIGHT
): void {
  const pad = 56;
  const contentW = width - pad * 2;

  // 背景：米色宣纸感
  ctx.setFillStyle('#e8e3da');
  ctx.fillRect(0, 0, width, height);

  // 顶部装饰线
  ctx.setFillStyle('#d4cfc4');
  ctx.fillRect(pad, 48, contentW, 2);

  // 顶部品牌
  ctx.setFillStyle('#968e7f');
  ctx.setFontSize(26);
  ctx.setTextAlign('left');
  ctx.fillText('心象 · 今日签', pad, 96);

  // 日期
  ctx.setFillStyle('#b0a99a');
  ctx.setFontSize(22);
  ctx.fillText(payload.date, pad, 132);

  // 标题
  ctx.setFillStyle('#3f7a78');
  ctx.setFontSize(52);
  ctx.fillText(truncateText(payload.title, 8), pad, 210);

  // 副标题
  if (payload.subtitle) {
    ctx.setFillStyle('#7a7568');
    ctx.setFontSize(26);
    const subLines = wrapLines(payload.subtitle, 14, 2);
    subLines.forEach((ln, i) => {
      ctx.fillText(ln, pad, 268 + i * 38);
    });
  }

  // 偈语（视觉核心）
  ctx.setFillStyle('#4a443b');
  ctx.setFontSize(32);
  const verseLines = wrapLines(payload.verse, 16, 4);
  let verseY = payload.subtitle ? 360 : 290;
  verseLines.forEach((ln) => {
    ctx.fillText(ln, pad, verseY);
    verseY += 48;
  });

  // 分隔
  ctx.setFillStyle('#d4cfc4');
  ctx.fillRect(pad, verseY + 24, contentW, 1);

  // 宜
  const yiY = verseY + 72;
  ctx.setFillStyle('#3f7a78');
  ctx.setFontSize(26);
  ctx.fillText(`宜　${payload.yi.join(' / ')}`, pad, yiY);

  // 忌
  ctx.setFillStyle('#a85761');
  ctx.setFontSize(26);
  ctx.fillText(`忌　${payload.ji.join(' / ')}`, pad, yiY + 44);

  // 底部品牌区
  ctx.setFillStyle('#d4cfc4');
  ctx.fillRect(pad, height - 160, contentW, 1);

  ctx.setFillStyle('#3f7a78');
  ctx.setFontSize(28);
  ctx.fillText(payload.brand, pad, height - 110);

  ctx.setFillStyle('#968e7f');
  ctx.setFontSize(20);
  ctx.fillText(payload.date, pad, height - 72);

  // 小程序码预留区
  ctx.setStrokeStyle('#c8c2b8');
  ctx.setLineWidth(1);
  ctx.strokeRect(width - pad - 100, height - 150, 100, 100);
  ctx.setFillStyle('#b0a99a');
  ctx.setFontSize(18);
  ctx.setTextAlign('center');
  ctx.fillText('码', width - pad - 50, height - 88);
  ctx.setTextAlign('left');

  // 安全说明
  ctx.setFillStyle('#968e7f');
  ctx.setFontSize(18);
  const safetyLines = wrapLines(payload.safetyNote || SAFETY_NOTE, 22, 2);
  safetyLines.forEach((ln, i) => {
    ctx.fillText(ln, pad, height - 36 + i * 24);
  });
}

/** 生成海报临时文件路径 */
export function generatePosterImage(
  payload: PosterPayload,
  canvasId = POSTER_CANVAS_ID
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const ctx = Taro.createCanvasContext(canvasId);
      drawPosterCanvas(ctx, payload);
      ctx.draw(false, () => {
        setTimeout(() => {
          Taro.canvasToTempFilePath({
            canvasId,
            width: POSTER_WIDTH,
            height: POSTER_HEIGHT,
            destWidth: POSTER_WIDTH,
            destHeight: POSTER_HEIGHT,
            success: (res) => resolve(res.tempFilePath),
            fail: (err) => reject(err)
          });
        }, 300);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export type SavePosterResult = 'success' | 'auth_denied' | 'unsupported' | 'fail';

/** 保存海报到相册（跨端兼容） */
export async function savePosterToAlbum(tempFilePath: string): Promise<SavePosterResult> {
  const env = Taro.getEnv();

  if (env === Taro.ENV_TYPE.WEB && typeof document !== 'undefined') {
    try {
      const link = document.createElement('a');
      link.href = tempFilePath;
      link.download = `xinxiang_${Date.now()}.png`;
      link.click();
      return 'success';
    } catch {
      return 'unsupported';
    }
  }

  try {
    await Taro.saveImageToPhotosAlbum({ filePath: tempFilePath });
    return 'success';
  } catch (err: unknown) {
    const msg = err && typeof err === 'object' && 'errMsg' in err
      ? String((err as { errMsg: string }).errMsg)
      : '';
    if (msg.includes('auth deny') || msg.includes('authorize')) {
      return 'auth_denied';
    }
    return 'fail';
  }
}

export function showSavePosterToast(result: SavePosterResult): void {
  switch (result) {
    case 'success':
      Taro.showToast({ title: '已保存到相册', icon: 'success' });
      break;
    case 'auth_denied':
      Taro.showToast({ title: '请授权保存到相册', icon: 'none' });
      break;
    case 'unsupported':
      Taro.showToast({ title: '请长按图片保存', icon: 'none' });
      break;
    default:
      Taro.showToast({ title: '保存失败，请稍后再试', icon: 'none' });
  }
}

/** 分享标题（克制、无诱导） */
export function buildShareTitle(payload: PosterPayload): string {
  const verseShort = truncateText(payload.verse, 18);
  if (verseShort) {
    return `今日心象：${verseShort}`;
  }
  return '我今日抽到了一句心象';
}

/** 分享路径（仅 date，不含出生信息） */
export function buildSharePath(date: string): string {
  return `/pages/fortune/today?date=${date}`;
}
