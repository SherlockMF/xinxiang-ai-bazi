# 小工具校验与打包摘要（minitool-zip-builder 1.6.0）

原打包日期：2026-09-05；目录说明更新：2026-11-02
Skill：`skills/minitool-zip-builder/`（自官方 skill 安装）

## 产物

| 项 | 路径 |
| --- | --- |
| 可上传 zip | `artifacts/xinxiang-minitool.zip` |
| 解压预览目录 | `output/dist-minitool/（按需解压，不纳入 Git）` |
| 源码目录 | `apps/offline/` |

- zip 大小：**约 0.10 MiB**（远低于建议 2 MiB / 硬限 10 MiB）
- 入口：`index.html` 在 zip **根目录**（未多套一层文件夹）
- 仅含允许类型：html / css / js / png / webp

## 审计脚本

命令按新目录整理；下方原有 PASS 记录属于原打包验收。Node 脚本对 ZIP 仅检查体积，不代表真机测试。

```
node skills/minitool-zip-builder/scripts/audit_artifact.mjs apps/offline  → PASS
node skills/minitool-zip-builder/scripts/audit_artifact.mjs artifacts/xinxiang-minitool.zip → PASS
python skills/minitool-zip-builder/scripts/audit_artifact.py artifacts/xinxiang-minitool.zip → PASS
```

## 本轮按规范修复

1. 移除剪贴板 API（`navigator.clipboard` / `execCommand('copy')`）→ 弹窗可选中文字，引导长按复制  
2. 移除 `a[download]` → 签卡预览长按；有 JSBridge 时 `writeTempFile` + `saveImageToPhotosAlbum`  
3. viewport 对齐模板（`maximum-scale=1.0, user-scalable=no, viewport-fit=cover`）  
4. CSS 去掉 flex `gap`，改 margin 回退；安全区用 `var(--safe-area-inset-*, env(...))`  
5. 图标改为 `icon.webp` + `icon-256.png`，剔除超大 PNG  

## 静态自检（摘要）

- [x] 无 fetch / XHR / WebSocket / 外链资源  
- [x] 脚本外置、经典 `<script src>`、无 module  
- [x] 无内联 script / 行内事件  
- [x] localStorage 可用；单页 hash 路由  
- [x] 包体体积门禁通过  

## 未实测

真机 / PC 模拟器 WebView 行为、相册权限弹窗、长按保存手势 — 交付前需在创作者中心模拟器再点验。
