# 心象离线小工具 Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** 在 `offline/` 交付可 `file://` 打开的纯 HTML/CSS/JS「心象」完整仪式感离线版（零联网）。

**Architecture:** 全局命名空间 `Xinxiang` + hash 路由；算法从 `baziService`/`fortuneService`/`birthUtils` 移植；`localStorage` 持久化；问心用本地模板。

**Tech Stack:** 原生 HTML/CSS/JS（无构建、无 CDN、无 fetch）

## Global Constraints

- 禁止 fetch/XHR/WebSocket/SSE/WebRTC/外链资源
- 先不打 zip；可后续优化
- 视觉：neumorphism 米色底 `#e8e3da`

---

### Task 1: 脚手架 + CSS + 存储

- [ ] `offline/index.html`、`css/app.css`、`js/storage.js`、`README.md`

### Task 2: 算法移植

- [ ] `js/birth-utils.js`、`js/bazi.js`、`js/fortune.js`（含偈语与宜忌解释）

### Task 3: 问心模板 + 主应用

- [ ] `js/ask-templates.js`、`js/app.js`（欢迎/生辰/心象盘/今日/问心/签亭/本心）

### Task 4: 自检

- [ ] 本地打开走通主路径；检索无联网 API
