# 已归档发布包

`xinxiang-minitool.zip` 为 2026-09-05 已打包的纯离线 HTML 小工具，迁移目录时保留原文件内容。

- 源码：[apps/offline](../apps/offline/README.md)
- 打包记录：[minitool-pack-summary](../docs/minitool-pack-summary.md)
- 校验脚本：`node skills/minitool-zip-builder/scripts/audit_artifact.mjs artifacts/xinxiang-minitool.zip`（该 Node 脚本对 ZIP 只检查大小）。

该包不调用 AI。独立 React 网页通过 `pnpm build:web` 生成，发布目录为 `apps/web/dist`，不使用此 ZIP。
