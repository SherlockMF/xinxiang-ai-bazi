# 心象 XinXiang · AI 八字与东方日签

**心象（xinxiang-ai-bazi）** 是一套结合八字意象、每日心象与 AI 问心的中文应用，包含独立 React 网页版、微信/抖音小程序、纯离线小工具版及 NestJS 服务端。界面采用宣纸色调与柔和的新拟物风格，适合桌面与手机使用。

XinXiang is an AI-assisted Bazi / Four Pillars app with daily reflection, a standalone React website, WeChat and Douyin mini programs, and a NestJS API.

八字排盘使用近似规则；内容用于传统文化体验、情绪陪伴与自我观察。农历、精确节气、真太阳时及专业决策支持不在当前能力范围内。

## 选择版本

| 应用 | 用途 | 技术 | 运行与部署说明 |
| --- | --- | --- | --- |
| [独立网页版](apps/web/) | 部署到网站，支持电脑与手机 | React 18 / Vite 7 / TypeScript | [网页说明](apps/web/README.md) |
| [小程序版](apps/miniapp/) | 微信、抖音小程序；同时保留原 Taro H5 | Taro 4 / React 18 | [小程序说明](apps/miniapp/README.md) |
| [离线小工具版](apps/offline/) | 零联网、直接打开 HTML；本地模板问心，不调用 AI | 原生 HTML / CSS / JavaScript | [离线说明](apps/offline/README.md) |
| [AI 服务端](apps/server/) | 为两种客户端提供问心、深度解读、此刻解读 API | NestJS 10 / 智谱 GLM | [服务端说明](apps/server/README.md) |

微信、抖音和原 H5 共用一份 Taro 源码，不是三个重复项目。独立网页与小程序是并列客户端，共用服务端协议，各自保存本地数据。

## 项目结构

```text
xinxiang-ai-bazi/
├── apps/
│   ├── web/           # 独立网页，自己的 package.json 与锁文件
│   ├── miniapp/       # Taro 源码、构建配置、测试与开发工具配置
│   ├── offline/       # 零联网 HTML 小工具，无需安装依赖
│   └── server/        # 共用 AI API，服务端环境配置放在这里
├── skills/           # 八字技能与离线小工具打包技能
├── artifacts/        # 已归档的离线小工具发布包
├── docs/             # 架构、设计、迁移与历史记录
├── patches/          # 现有 Taro 工具链补丁
├── .cozeproj/        # 保留的 Coze 开发/构建适配脚本
├── package.json      # 统一运行入口
└── pnpm-workspace.yaml
```

开发构建的 `dist`、`node_modules`、验收截图和本地迁移缓存不纳入 Git。原有离线发布包保留在 `artifacts`，日常构建包放在被忽略的 `output`。网页版没有嵌在小程序应用内部，可以单独复制、安装与部署。

## 快速开始

需要 **Node.js 22.18+（建议使用 24）和 pnpm 9**。

```sh
git clone https://github.com/SherlockMF/xinxiang-ai-bazi.git
cd xinxiang-ai-bazi
pnpm install --frozen-lockfile
pnpm install:web
```

仅体验网页，不使用 AI 时：

```sh
pnpm dev:web
```

网页默认地址为 `http://127.0.0.1:5173/`。如需 AI，参考服务端说明，在服务端应用内从 `.env.example` 创建 `.env` 并配置 `ZHIPU_API_KEY`，然后运行：

```sh
pnpm dev             # 独立网页 + AI 服务端
```

服务端默认端口为 `3100`。若端口被占用会顺延，应同步调整网页的 `API_PROXY_TARGET`。**密钥只放在服务端，不写入 `VITE_*` 或客户端源码。** 未配置或服务不可用时，问心明确显示本地陪伴，深度解读提示不可用。

## 常用命令

以下命令都在仓库根目录执行：

| 命令 | 作用 | 产物 |
| --- | --- | --- |
| `pnpm dev:web` | 独立网页开发 | — |
| `pnpm dev:weapp` / `pnpm dev:tt` | 小程序监听构建 | 小程序应用内 `dist` / `dist-tt` |
| `pnpm dev:h5` | 原 Taro H5 开发 | — |
| `pnpm dev:server` | API 开发 | — |
| `pnpm build:web` | 独立网页生产构建 | `apps/web/dist` |
| `pnpm build:h5` | 原 Taro H5 生产构建 | `apps/miniapp/dist-web` |
| `pnpm build:weapp` / `pnpm build:tt` | 小程序生产构建 | `apps/miniapp/dist` / `dist-tt` |
| `pnpm build:server` | API 生产构建 | `apps/server/dist` |
| `pnpm build` | 顺序构建全部应用 | 上述所有产物 |
| `pnpm test` / `pnpm typecheck` | 回归测试 / 全应用类型检查 | — |

`build:web` 现在明确表示独立网页版；原 Taro 网页改用 `build:h5`。只做静态部署时，选择 `apps/web` 为构建根目录，发布其 `dist`，详见网页说明。

## 功能

- 公历出生档案、未知时辰、多档案切换，四柱与五行意象。
- 每日心象、宜忌、本地历史、收藏与每日心约偏好。
- AI 问心、深度解读与此刻解读；回应以短语交叠浮现，支持减少动态效果设置。
- 签文海报、网页版 PNG 下载与浏览器分享。
- 本地数据清除、请求失败提示与敏感问题提醒。

目前没有云端账号同步或真正的订阅消息推送；每日心约只保存偏好。AI 服务通过后端调用，是否可用取决于部署与凭证配置。

## 八字技能与维护资料

[八字技能](skills/bazi/SKILL.md) 及其 `references` 已纳入仓库。后端将其中的分析框架整理成代码中的提示词，**运行时不读取 SKILL.md**；技能更新后，需要检查并同步后端提示词。安装到本地 Codex 的 `.agents/skills/bazi` 是工具副本，不作为仓库源文件维护。

- [技能目录说明](skills/README.md)
- [结构与迁移说明](docs/repository-layout.md)
- [视觉设计](docs/design.md)
- [第一轮 MVP 历史快照](docs/MVP-ROUND1-STATUS.md)

搜索关键词：心象、八字、四柱、AI 命理、东方日签、自我观察、Bazi、Four Pillars、Chinese metaphysics、React、Taro、微信小程序、抖音小程序。
