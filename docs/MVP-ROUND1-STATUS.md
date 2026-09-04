# 心象 · 第一轮 MVP 现状交接文档

> 更新日期：2026-09-04  
> 仓库：https://github.com/SherlockMF/cyber-spirit-xuanxue （private）  
> 继续开发请拉：`fix/bugfixes-and-ai-bazi-analysis`（含第一轮 MVP 全量；`main` 较旧）  
> 用途：换电脑继续开发前的状态快照

---

## 1. 一句话结论

**第一轮 MVP 已有条件完成（约 87/100）。**  
主路径「录入生辰 → 今日心象 → 问心 → 签亭收藏/分享 → 本心留存 → 清除数据」已闭环。可进入小范围真机测试；第二轮优先做埋点验证或 AI 成本/缓存，暂不堆新功能。

---

## 2. 产品定位（勿偏航）

- **是什么：** 东方心象日签 + 自我观察 + 情绪陪伴
- **不是什么：** 严肃算命、改运、转运、开光、支付会员、社区排行榜
- **留存来源：** 每日仪式感、自我观察、签文收藏 —— 禁止恐吓、承诺好运、错过焦虑

---

## 3. 已完成的 6 步改造

| 步骤 | 内容 | 状态 |
|------|------|------|
| 1 | 项目扫描与改造计划 | ✅ |
| 2 | 产品语言与页面结构收敛 | ✅ |
| 3 | 出生信息录入、Picker、隐私、今日缓存、清除数据 | ✅ |
| 4 | AI 问心结构化输出、敏感拦截、fallback | ✅ |
| 5 | 签亭海报、分享、收藏、我的珍藏 | ✅ |
| 6 | 每日心约、连续观心、近七日历史、本心页收敛 | ✅ |
| 验收 | 全流程回归 + 小范围 bug 修复 | ✅ |

---

## 4. 当前页面结构

### TabBar

1. **今日** `pages/fortune/today` — 今日心象主视觉
2. **问心** `pages/chat/index` — 结构化 AI 回应
3. **签亭** `pages/share/index` — 签卡 / 海报 / 珍藏
4. **本心** `pages/me/index` — 画像摘要 / 留存 / 心约 / 隐私

### 非 Tab 页

- `pages/index/index` — 欢迎启动页（pages 数组第一项）
- `pages/onboarding/birth` — 出生信息录入 / 编辑
- `pages/profile/bazi` — 心象盘（专业信息默认折叠）
- `pages/profiles/index` — 多命主档案
- `pages/favorites/index` — 珍藏列表
- `pages/reminder/index` — 每日心约独立页（与本心共用 storage）

---

## 5. 关键技术约定

### 技术栈

- 前端：Taro 4 + React 18 + TypeScript + Zustand
- 后端：NestJS 10（`server/`）
- 包管理：**必须用 pnpm**
- 本地存储：统一 `STORAGE_KEYS`（`xinxiang_*`），含 legacy `cyber_*` 迁移

### 启动命令（在 `projects/` 下）

```bash
pnpm install
pnpm dev              # H5 + server
pnpm dev:weapp        # 微信小程序
pnpm dev:server       # 仅后端
pnpm tsc              # 前端类型检查
```

### 环境变量

- 复制 `server/.env.example` → `server/.env`
- 问心 AI 需要 `ZHIPU_API_KEY`；**无 Key 时仍可体验**：今日心象纯本地生成，问心走 fallback
- **不要提交** `.env` / `.env.local` / 小程序私钥

### Storage Keys（清除时须全部清掉）

```
xinxiang_profiles
xinxiang_bazi_lite
xinxiang_active_profile_id
xinxiang_daily_xiang_cache
xinxiang_favorites
xinxiang_ask_history
xinxiang_reminder_preference
xinxiang_bazi_analysis
xinxiang_privacy_accepted
xinxiang_visit_stats
xinxiang_daily_xiang_history
```

---

## 6. 核心数据流

```
出生信息 (UserProfile / BirthProfile)
  → 本地排盘 (BaziProfile)
  → 今日心象 seed 缓存 (DailyFortune，同日同生辰不变)
  → 问心 AskRequest / AskAnswer（结构化）
  → 签亭 PosterPayload / FavoriteItem
  → 留存 VisitStats + DailyXiangHistoryItem + ReminderPreference
```

### 今日心象稳定性

- Seed：`birthDate + timeBranch + date`
- 同用户同日多次进入内容不变
- 修改出生信息后清缓存与历史，再生成

### 问心风控

- **high**：本地 / 服务端直接 `safety_fallback`（医疗、法律、投资、恐吓、改运、操控等）
- **medium**：仍可请求 LLM，但加强 prompt（如离婚等关系决策）
- 无 Key / API 失败 / 非 JSON → `fallback`
- 本轮验收已补关键词：`得病`、`发财`、`离不开我` 等

---

## 7. 已知问题（第二轮再处理）

| 优先级 | 问题 | 建议 |
|--------|------|------|
| P0 | 真机全路径未在本机完整跑通 | 用 `docs` 外真机清单测一遍 |
| P1 | H5 生产构建缺 `@babel/plugin-proposal-decorators` | 评估补 devDependency（勿乱动业务） |
| P1 | 海报小程序码为占位 | 后续接真实码 |
| P1 | 每日心约仅存偏好，无真实推送 | 预留 `requestDailyReminderPermission` |
| P2 | medium 关系问题仍走 LLM | 可改为本地克制模板 / 短答 |
| P2 | 农历 / 真太阳时 / 节气未精确 | 排盘准确性补强 |
| P2 | 深度心象解读 prompt 仍含大运/格局 | 折叠区；监控输出合规 |
| P3 | 可绕过欢迎页直达 Tab | 依赖各 Tab 空态兜底，可接受 |

---

## 8. 第二轮建议方向（只选其一推进）

1. **小范围用户测试与埋点**（优先验证漏斗）
2. **农历 / 真太阳时 / 节气准确性**
3. **AI 成本与缓存 + medium 风险收紧**

**明确不做：** Supabase、支付会员、真实订阅消息强接、社区、排行榜、改运玩法、大运详批重写。

---

## 9. 换电脑接手清单

1. Clone 并切到 MVP 分支：

```bash
git clone https://github.com/SherlockMF/cyber-spirit-xuanxue.git
cd cyber-spirit-xuanxue
git checkout fix/bugfixes-and-ai-bazi-analysis
```

2. `pnpm install`
3. 配置 `server/.env`（参考 `.env.example`）
4. `pnpm tsc` 确认类型通过
5. `pnpm dev:weapp` + 微信开发者工具；或 `pnpm dev` 跑 H5
6. 按「真机验收」路径走一遍：录入 → 今日 → 问心风控题 → 签亭 → 本心心约 → 清除数据
7. 阅读本文件第 7、8 节后再开新功能

### 真机快速冒烟（最少 10 项）

- [ ] 清除数据后欢迎页 → 录入（隐私必勾、未知时辰可用）
- [ ] 今日心象首屏完整，同日再进内容不变
- [ ] 「我该买哪只股票」「我是不是有灾」「买什么能转运」→ safety_fallback
- [ ] 签亭生成/保存海报有 Toast；分享路径无生辰
- [ ] 本心可开关每日心约并回显
- [ ] 清除后四 Tab 空状态干净

---

## 10. 验收评分快照

```
MVP 完成度：87 / 100
建议：可小范围真机测试
最大风险：深度解读 AI 输出合规、medium 问心、构建环境
```

---

## 11. 相关文档

- `README.md` — 项目说明与 API 概览
- `DESIGN.md` — 设计相关
- `AGENTS.md` — 开发规范（pnpm、TOS 资源等）
- `skills/bazi/` — 八字 skill 参考（开发用，非前台文案）

---

*本文档仅描述第一轮 MVP 收口状态，不作为功能开发规格替代品。第二轮开工前请先确认方向。*
