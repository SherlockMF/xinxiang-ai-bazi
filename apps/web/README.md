# 心象 · 独立网页版

独立 React + TypeScript + Vite 应用，延续小程序的宣纸、新拟物与东方意象。支持桌面侧栏和手机底部导航，不依赖 Taro、微信 SDK 或小程序运行时。

## 本地运行

需要 Node.js >= 22.18.0、pnpm 9。进入本目录：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

开发地址以终端输出为准，默认 `http://127.0.0.1:5173/`。

```sh
pnpm test       # 业务与回归测试
pnpm typecheck  # TypeScript 检查
pnpm build      # 类型检查 + 生产构建，输出 dist/
pnpm preview    # 本地检查构建产物，默认端口 4173
```

本目录有独立 `package.json`、`pnpm-workspace.yaml` 和 `pnpm-lock.yaml`，可单独复制到另一个仓库，不需要安装原小程序依赖。`pnpm preview` 仅供本地验收，不是生产服务器。

## 已实现

- 欢迎、出生信息录入与编辑（公历、未知时辰）、多档案切换与删除。
- 本地心象盘、五行意象、稳定的每日心象、宜忌解读、近七次历史。
- 问心：调用现有后端、结构化回应、敏感问题提醒、失败时明确显示本地陪伴。
- AI 深度解读及此刻解读入口。
- 签亭：生成并下载 900 × 1280 PNG，浏览器分享或复制签文与网站入口。
- 珍藏分类与移除、心约偏好、连续观心记录、清除本地数据。

## 部署前端

先运行 `pnpm build`，将 **`dist/` 内的全部文件**上传到静态托管服务的站点目录。资源使用相对路径，路由使用 hash，支持部署在域名根目录或 `/xinxiang/` 这样的子目录，不需要服务器配置页面路由重写。

生产站点请使用 HTTPS，以支持浏览器安全上下文中的档案 ID 生成、剪贴板与分享能力；本地 `localhost` / `127.0.0.1` 可直接开发。

Git 托管构建的通用配置：

| 配置 | 值 |
| --- | --- |
| 项目根目录 | 当前仓库中为 `apps/web`；若只上传本目录则为仓库根目录 |
| Node.js | 22.18+ 或 24 |
| 安装命令 | `pnpm install --frozen-lockfile` |
| 构建命令 | `pnpm build` |
| 发布目录 | `dist`（相对于所选项目根目录） |

纯静态部署即可使用档案、日签、心象盘、历史、收藏与海报。AI 问心在无后端时显示本地陪伴，深度解读会提示暂不可用。

Vite 的构建和托管规则见 [官方静态部署文档](https://vite.dev/guide/static-deploy.html)。

## 接入现有 AI 后端

真实 AI 功能需要已有的 `../server/` NestJS 服务。网页版不会把智谱密钥放入浏览器。

1. 单独部署原后端，并在服务端配置 `ZHIPU_API_KEY`。不要把任何密钥写入 `VITE_*` 变量。
2. 推荐让网站同域的 `/api/` 反向代理到后端。前端的 `VITE_API_BASE_URL` 保持为空。
3. 若前后端分开域名，在构建平台设置 `VITE_API_BASE_URL` 为后端的 HTTPS origin，**不带结尾 `/api`**；同时按你的前端域名配置后端 CORS。修改该变量后重新构建。

后端接口：`POST /api/chat/message`、`POST /api/bazi/analyze`、`POST /api/bazi/moment`。默认请求超时为 45 秒。

本地联调时，在仓库根目录运行 `pnpm dev:server`，或进入同级 `../server/` 按服务端说明配置后执行 `pnpm dev`。网页开发代理默认指向 `http://127.0.0.1:3100`；若后端使用别的端口，在本目录 `.env.local` 设置 `API_PROXY_TARGET`。

Nginx 已有 HTTPS 站点内可以按下列方式接入，路径与端口按实际部署修改：

```nginx
root /srv/xinxiang;
index index.html;

location / {
    try_files $uri $uri/ =404;
}

location /api/ {
    proxy_pass http://127.0.0.1:3100;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 60s;
}
```

这是前端复刻，本次未修改后端的认证、限流或运营部署配置。公开开放 AI 接口前，需要在你的现有服务或网关落实访问控制和调用额度，避免接口被无限调用。本项目未执行任何外部发布。

## 数据与功能边界

- 数据保存在当前浏览器，键名前缀为 `xinxiang_web:`，与原 Taro H5 数据隔离，不会自动迁移或跨设备同步。用户可在「本心」清除本站数据。
- 问心/AI 解读只有用户主动触发才发请求；会发送相关出生信息、心象、问题与部分对话。清除本地数据不会删除已经发送给 AI 服务的内容。
- 排盘、日签和内容模板迁移自原项目 `src/services/`，保留原算法。暂不提供精确节气、农历转换或真太阳时校正；未知时辰以正午参考计算，并在界面注明。
- 心约只保存偏好，不提供网页关闭后的推送。
- 浏览器原生分享取决于设备和 HTTPS 支持；不可用时提供复制内容。参见 [MDN Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)。分享链接只指向网站入口，不传输个人档案。
- PNG 下载由浏览器处理，手机上的下载保存方式取决于浏览器。页面签卡为响应式预览，下载图片采用固定画布排版。

## 代码入口

```text
src/app.tsx             应用壳、hash 路由和日期刷新
src/store.ts           多档案状态与切换
src/pages/             九个页面
src/components/ui.tsx  原生 React 通用组件
src/services/          迁移业务逻辑及浏览器适配
src/network.ts         服务端请求与超时
src/styles.css         宣纸主题、Tailwind、新拟物效果
tests/web.test.ts      数据隔离、缓存、降级和竞态回归
```

迁移逻辑保留来源，改为 kebab-case 文件名；存储和网络适配使用浏览器 API，避免将小程序组件封装带入纯网页项目。

## 本次验证（2026-11-02）

- `pnpm test`：16 项通过，覆盖存储隔离、日签稳定、多档案、收藏去重、删除/清空、请求超时、失败回应、AI 缓存回写竞态，以及文字分组和渐显时序。
- `pnpm build`：TypeScript 与 Vite 生产构建通过。
- 浏览器：1440px 桌面与 390px 手机视口无横向溢出；实际验证录入、刷新、档案切换、对话隔离、收藏、心约保存、清空、风险提醒与 AI 不可用时的本地回应。
- PNG 已实际下载并目视检查。
- 未执行真实 AI 成功调用、外网发布及真实 iOS/Android 设备测试。

AI 回应、深度解读和此刻解读采用短语交叠浮现：淡入、轻微上浮与模糊消散，完整显示不超过约 3.7 秒；已保存的对话和深度解读直接显示。系统开启减少动态效果时关闭动效。
