# 心象仓库结构与命名整理 Implementation Plan

> **For agentic workers:** Execute this migration inline, preserving the current working changes. Steps use checkbox syntax for tracking.

**Goal:** 使网页、小程序、离线小工具和服务端并列，并把 GitHub 仓库改为 xinxiang-ai-bazi。

**Architecture:** 将 projects 内的 Git 根目录提升到当前工作目录；应用分别置于 apps/web、apps/miniapp、apps/offline、apps/server。网页保留独立锁文件；根 pnpm workspace 管理小程序与后端，统一脚本负责调用各应用。

**Tech Stack:** pnpm、React/Vite、Taro、NestJS、GitHub CLI。

## Global Constraints

- 保留用户修改、Git 历史及本地密钥；用户追加要求将 GitHub 仓库改为公开，完成内容检查后执行。
- 不变更业务逻辑，不更新依赖版本，不部署站点。
- 本地 .agents 技能保持原位；仓库技能位于 skills/bazi。
- 仓库名称已由用户确认：xinxiang-ai-bazi。

## Tasks

- [x] 清点并迁移：src/config/types/tests 与构建配置到 apps/miniapp，web/server 到 apps 同级；Git、docs、skills、patches、Coze 脚本移到新根目录。构建缓存保留在忽略目录。
- [x] 根 package.json 增加统一入口；pnpm-workspace.yaml 和锁文件 importer 对应新路径；小程序内的脚本只管理自身；修正开发工具与 Coze 路径。
- [x] 重写根 README、补齐各应用入口说明和结构迁移说明；更新名称、简介、关键词、部署路径与技能来源说明。
- [x] 执行 web 测试/构建、miniapp 测试/类型检查/三端构建、server 构建；核对无旧路径、无敏感文件进入 Git。
- [x] 更新 GitHub 名称/简介/topics、origin 地址，提交并同步已验证的目录与文档，核对远端默认分支内容与公开状态。

## Verification Commands

在新根目录运行 `pnpm test`、`pnpm typecheck`、`pnpm build`、`git diff --check`。单独核对 `pnpm -C apps/web install --frozen-lockfile` 与根 workspace 的冻结安装；网页开发入口继续使用本地 4173 端口验收。

## 实际验证与交付

- 根 workspace 与独立网页均完成冻结锁文件安装。
- 网页 16 项测试、小程序文字时序 4 项测试通过；离线源码体积与既有 ZIP 大小校验通过。
- `pnpm validate` 通过；分别执行 web、h5、weapp、tt、server 构建，全部通过。保留工具链原有 Browserslist 与抖音 RootPortal 警告。
- 更新后的 Coze shell 脚本语法检查通过；8 份当前入口文档的本地链接全部有效。
- 历史及暂存差异的凭证形态扫描未检出问题；历史 `key/private.appid.key` 只有一个 0 字节占位对象，不含密钥材料。
- GitHub 仓库已改为 `SherlockMF/xinxiang-ai-bazi`，可见性 public，12 个检索主题；匿名读取新 README 返回 HTTP 200。
- 本地旧 `projects/web` 仅剩空目录，仍被打开的系统进程占用，未强制关闭用户进程。源码与 Git 根目录已完成迁移。
