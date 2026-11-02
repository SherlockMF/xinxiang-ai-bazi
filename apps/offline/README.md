# 心象 · 离线小工具

纯前端 HTML / CSS / JS，**零联网**。问心使用本地模板，不连接大模型；需要 AI 的网站请使用同级 [独立网页版](../web/README.md)。对应 [离线版设计记录](../../docs/superpowers/specs/2026-09-05-offline-xinxiang-design.md)。

## 打开方式

1. 用浏览器直接打开本目录的 `index.html`（`file://`）
2. 或在仓库根目录起一个静态服务，例如：

```bash
pnpm dlx serve apps/offline -p 5177
```

然后访问 `http://localhost:5177`

## 图标

上传小红书小工具时可用：

- [`assets/icon.png`](assets/icon.png) — 方图，新拟物「月映心湖」意象

页面已引用为 favicon / apple-touch-icon。

## 功能

- 首次三步引导（可跳过）
- 生辰录入（默认不知具体时间 + 24小时制选择）→ 心象盘（细节可折叠）
- 今日心象竖版签卡、复制一句、**保存签卡长图**、连续观心
- 问心：三段式本地模板（意象 / 观察 / 一件小事）
- 签亭珍藏 / **多档案切换** / 今日心约 / 清除本机数据（自绘确认）

## 硬限制自检

- 无 `fetch` / XHR / WebSocket / SSE / WebRTC
- 无 CDN、无外链字体与图片
- 数据仅 `localStorage`

## 说明

已归档的发布包位于 [artifacts/xinxiang-minitool.zip](../../artifacts/xinxiang-minitool.zip)，打包记录见 [小工具打包说明](../../docs/minitool-pack-summary.md)。算法为现有前端服务的移植副本，与 Taro 主工程无运行时双写。
