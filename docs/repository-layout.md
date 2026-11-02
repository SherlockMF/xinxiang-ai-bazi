# 仓库结构与迁移说明

本仓库以应用为边界：`apps/web` 是独立网页，`apps/miniapp` 是 Taro 客户端，`apps/offline` 是纯离线 HTML 小工具，`apps/server` 是共用 API。微信、抖音和原 H5 是 Taro 的构建目标，不拆成重复源码。

## 2026-11-02 路径迁移

本地工作目录原先多了一层 `projects/`，该层已提升为工作目录自身；`.git` 与提交历史保留。

如果旧终端仍停留在原目录，Windows 可能保留被占用的空目录。先将终端工作目录切换到新的仓库根目录；所有源码已位于下表中的新位置。

| 旧位置（相对原 Git 根目录） | 新位置 |
| --- | --- |
| `web/` | `apps/web/` |
| `server/` | `apps/server/` |
| `offline/` | `apps/offline/` |
| `.claude/minitool-zip-builder/` | `skills/minitool-zip-builder/` |
| `xinxiang-minitool.zip` | `artifacts/xinxiang-minitool.zip`，保留原发布包 |
| `src/`、`config/`、`types/`、`tests/` | `apps/miniapp/` 下同名目录 |
| Taro 构建配置与本地私钥目录 | `apps/miniapp/` |
| `assets/` | `docs/assets/`，保留设计参考素材 |
| `DESIGN.md` | `docs/design.md` |
| 原长篇模板 README | `docs/archive/taro-template-guide.md` |
| `skills/bazi/` | 仍在仓库根目录的 `skills/bazi/` |

`docs/archive` 和带日期的计划/交接文档属于历史记录，可能提及迁移前路径；当前运行方式以根 README 和各应用说明为准。

## 依赖边界

根 pnpm workspace 管理小程序和服务端，二者使用根锁文件。网页保留独立 workspace 与锁文件，便于单独复制和静态部署。因此首次开发需要分别执行根安装与 `pnpm install:web`，不能只安装其中一处后假定所有应用可用。

`package.json` 中的 `private: true` 用来阻止误发 npm 包，与 GitHub 仓库是否公开无关。

## 命令迁移

- `dev:web` / `build:web` 现在对应独立 React 网页。
- 原 Taro H5 使用 `dev:h5` / `build:h5`。
- `dev` 同时启动独立网页与服务端；Coze 适配脚本使用 `dev:legacy` 启动原 Taro H5 与服务端。
- 打开旧位置的终端需要切换到新仓库根目录；开发工具重新导入根目录或对应应用目录。

离线版没有包管理依赖，直接打开 HTML 即可；它的问心使用本地模板，不调用大模型。本地 `output/` 可保留迁移备份、构建包和验收截图，Git 会忽略它；它不是应用源码。
