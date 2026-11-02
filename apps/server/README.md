# 心象 · AI 服务端

NestJS API，同时为独立网页与 Taro 小程序服务。默认使用智谱 GLM；模型名称与密钥通过服务端环境变量配置。

## 本地开发

先在仓库根目录执行 `pnpm install --frozen-lockfile`。在本目录将 `.env.example` 复制为 `.env`，填写自己的 `ZHIPU_API_KEY`；保持文件仅在本地。

```sh
# 仓库根目录
pnpm dev:server
pnpm build:server
pnpm --filter xinxiang-server typecheck
```

默认端口是 `3100`，被占用时会向后探测空闲端口；实际地址以启动输出为准。生产环境在本应用目录执行 `pnpm start:prod`，或 `node dist/main.js`。环境变量也可由部署平台注入。

## 现有接口

所有路径都有 `/api` 前缀，客户端应读取响应封装中的 `data` 字段。

| 方法 | 路径 | 功能 |
| --- | --- | --- |
| POST | `/api/chat/message` | AI 问心 |
| POST | `/api/bazi/analyze` | 基于已有四柱的深度解读 |
| POST | `/api/bazi/moment` | 此刻解读 |
| POST | `/api/bazi/generate` | 档案生成备用接口 |
| POST | `/api/fortune/generate` | 每日心象生成 |

当前客户端的基础排盘和日签主要由本地算法完成。AI 请求失败时由现有错误处理或本地陪伴内容承接；服务启动并不表示模型凭证有效。

## 技能来源与部署

深度解读提示词来自仓库 [八字技能](../../skills/bazi/SKILL.md) 的分析框架，整理在 `src/bazi/bazi-analysis.prompt.ts`。运行时不加载技能文件，更新技能后需同步审阅提示词。

站点静态文件应由静态托管服务或反向代理提供；本服务负责 API。网页同域 `/api` 反向代理到此服务即可。当前 CORS 配置允许请求来源，公开服务前应按实际站点限制来源，并配置适合自己部署的鉴权和调用额度。
