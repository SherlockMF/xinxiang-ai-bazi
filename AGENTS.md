# 心象仓库开发约定

- 使用中文沟通，使用 pnpm；不要提交密钥、`.env`、私有开发工具配置或生成产物。
- 应用并列位于 `apps/web`、`apps/miniapp`、`apps/offline`、`apps/server`。共享说明位于 `docs`，技能源文件位于 `skills`。
- `apps/web` 是独立 React/Vite 应用，保留自己的 workspace 和锁文件；不要将 Taro 组件或依赖引入网页应用。
- 根 workspace 管理小程序与服务端。进入小程序目录前阅读其中的 `AGENTS.md`；其中的 Taro UI 约束仅适用于小程序应用。
- 迁移目录或改变启动命令时，同步更新根 README、应用 README 和 `.cozeproj/scripts`。
- 优先运行受影响应用的测试和构建；跨应用改动运行根目录 `pnpm test`、`pnpm typecheck`、`pnpm build`。
- 保留用户未提交改动，禁止擅自改写历史、强制推送或替换凭证。
