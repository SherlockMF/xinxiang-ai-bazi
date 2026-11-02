# 心象 · 小程序与 Taro H5

使用同一份 Taro 4 / React 18 源码生成微信、抖音小程序和原 H5。面向静态网站部署的独立 React 版本位于同级 `../web`。

## 安装与运行

在仓库根目录执行 `pnpm install --frozen-lockfile`。随后任选一个平台：

```sh
pnpm dev:weapp
pnpm dev:tt
pnpm dev:h5
```

微信开发者工具可导入仓库根目录或本应用目录，两处 `project.config.json` 都指向本应用的微信构建产物。抖音开发者工具导入本应用构建后的 `dist-tt`。

项目 AppID、上传私钥由你自己的平台账号配置。上传私钥仅放本应用的 `key/`，环境配置放 `.env.local`，不要提交 Git。构建不等同于上传或发布。

## 构建与验证

在仓库根目录运行：

```sh
pnpm build:weapp
pnpm build:tt
pnpm build:h5
pnpm --filter xinxiang-miniapp test
pnpm --filter xinxiang-miniapp typecheck
```

产物分别在本目录的 `dist`、`dist-tt`、`dist-web`。`preview:weapp` 和 `preview:tt` 会调用平台预览能力，使用前配置自己的平台凭证。

## API 联调

本地 H5 默认通过代理访问 `3100` 端口的服务端。小程序发布环境需要配置自己的 API 域名与平台合法域名；`PROJECT_DOMAIN` 为构建时域名配置。服务端密钥留在服务端，禁止写入客户端变量。

本应用的 `AGENTS.md` 说明了 Taro 组件、网络、样式和跨端开发约定。旧模板完整说明保留在 [历史文档](../../docs/archive/taro-template-guide.md)，当前目录与命令以本说明和根 README 为准。
