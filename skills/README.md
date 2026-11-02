# 项目技能源文件

本目录集中维护两项技能：`bazi`（八字分析）和 `minitool-zip-builder`（离线小工具规范与产物校验）。后者原位于 `.claude/`，现保留原脚本及参考资料，不改变技能内容。

`bazi/` 保存八字分析技能及其参考资料，随仓库一起版本管理：

- `SKILL.md`：出生信息采集、分析流程与输出要求。
- `references/classical-texts.md`：经典命理资料索引。
- `references/dayun-rules.md`：大运规则。
- `references/shichen-table.md`：时辰对照。
- `references/wuxing-tables.md`：五行关系表。

后端深度解读使用从该技能整理出的提示词，文件在 `apps/server/src/bazi/bazi-analysis.prompt.ts`。它不是自动执行技能的代理，也不会在运行时读取此目录。

本地 Codex 可将 `bazi/` 安装到工作目录的 `.agents/skills/bazi/`。该工具副本由本机维护，Git 忽略 `.agents/`；请先修改仓库源文件，再按需同步工具副本和后端提示词。
