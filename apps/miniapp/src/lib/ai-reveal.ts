export interface RevealChunk {
  text: string;
  delay: number;
}

/** 按短语切片；保留原文，避免逐字播放与末尾孤立一两个字。 */
export function splitRevealText(text: string): string[] {
  const characters = Array.from(text);
  const chunks: string[] = [];
  let start = 0;
  while (start < characters.length) {
    let end = Math.min(start + 8, characters.length);
    if (end < characters.length) {
      for (let i = end - 1; i >= start + 3; i--) {
        if (/[，。！？；、,.!?;:\s]/u.test(characters[i])) {
          end = i + 1;
          break;
        }
      }
      while (end < characters.length && /[，。！？；、,.!?;:」』”’）)]/u.test(characters[end])) end++;
      if (characters.length - end < 4) end = characters.length;
    }
    chunks.push(characters.slice(start, end).join(''));
    start = end;
  }
  return chunks;
}

/** 全篇使用一条时间线；每组淡入 900ms，相邻组交叠，长文也不会等待过久。 */
export function createRevealSchedule(texts: string[]): RevealChunk[][] {
  const groups = texts.map(splitRevealText);
  const count = groups.reduce((total, group) => total + group.length, 0);
  const interval = Math.min(110, 2800 / Math.max(1, count - 1));
  let index = 0;
  return groups.map(group => group.map(text => ({ text, delay: Math.round(index++ * interval) })));
}
