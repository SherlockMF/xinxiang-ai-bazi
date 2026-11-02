import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitRevealText, createRevealSchedule } from '../src/lib/ai-reveal.ts';

test('短语分组完整保留文字、标点、空白和 Unicode', () => {
  const text = '风过竹林，心自澄明。\n  慢一些，听听自己 🌿，也听听雨声。';
  const chunks = splitRevealText(text);
  assert.equal(chunks.join(''), text);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every(chunk => Array.from(chunk).length > 1));
});

test('长句不会变成逐字或整段显示，不留下孤立尾字', () => {
  const text = '把心放在此刻让思绪像云一样缓缓经过不急于寻找答案';
  const chunks = splitRevealText(text);
  assert.ok(chunks.length >= 3);
  assert.ok(chunks.every(chunk => chunk.length >= 4 && chunk.length <= 11));
  assert.equal(splitRevealText('').length, 0);
  assert.deepEqual(splitRevealText('安然'), ['安然']);
});

test('标题、正文和建议共用连续错峰时间线，动画交叠而非整段齐出', () => {
  const texts = ['让心慢下来', '此刻不必急着回答所有问题，让念头缓缓流过。', '今天可以先完成一件小事。'];
  const schedule = createRevealSchedule(texts);
  assert.deepEqual(schedule.map(part => part.map(chunk => chunk.text).join('')), texts);
  const delays = schedule.flat().map(chunk => chunk.delay);
  assert.equal(delays[0], 0);
  assert.ok(delays.every((delay, i) => i === 0 || delay > delays[i - 1]));
  assert.ok(delays[1] < 900);
});

test('长篇解读的最后一组最多等待 2.8 秒', () => {
  const schedule = createRevealSchedule(['愿你安然，心有归处。'.repeat(180)]).flat();
  assert.ok(schedule.length > 100);
  assert.equal(schedule.at(-1)?.delay, 2800);
  assert.deepEqual(createRevealSchedule(['', '']), [[], []]);
});
