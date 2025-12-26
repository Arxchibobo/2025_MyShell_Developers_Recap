## Development Environment
- OS: Windows 10.0.26200
- Shell: Git Bash
- Path format: Windows (use forward slashes in Git Bash)
- File system: Case-insensitive
- Line endings: CRLF (configure Git autocrlf)

## Playwright MCP Guide

File paths:
- Screenshots: `./CCimages/screenshots/`
- PDFs: `./CCimages/pdfs/`

Browser version fix:
- Error: "Executable doesn't exist at chromium-1179" → Version mismatch
- Quick fix: `cd ~/AppData/Local/ms-playwright && cmd //c "mklink /J chromium-1179 chromium-1181"`
- Or install: `npx playwright@1.40.0 install chromium`

你是一个严谨的全栈工程师 + 数据工程师。你的任务是：基于本地 CSV 数据（1168 个 bot），实现一个“开发者年终 Bot 回顾”动态网站（多页），并且所有展示内容必须来自 CSV 的真实数据，不得编造、不得用假数据占位。你需要输出一份可运行的完整项目代码与说明文档。

0) 数据源与强约束（必须遵守）

数据文件路径（运行环境本地文件系统）：

/mnt/data/生图类bot list (1) 2d43f81ff51e81c9b6c2ec60b255245d.csv

该 CSV 的真实规模与字段（必须按此读取）：

行数：1168

列数：6

列名为（严格匹配）：

Bot_Name

微信/Discord/x

Tag

MyShell_URL

Note

Launch_Date

数据真实性要求：

页面中出现的 bot 名称、微信名、tag、myshell url、launch date、note 必须全部来自 CSV。

任何统计（总数、每个 tag 数量、每个微信名的 bot 数量、时间分布等）必须由 CSV 计算得出。

禁止：杜撰 bot、杜撰 url、杜撰日期、用“示例数据/placeholder”替代真实数据。

Tag 解析规则（必须实现）：

Tag 字段为逗号分隔字符串（,），需要 split 后 trim。

保留 CSV 原始 tag 文本（不要擅自改名）；允许额外提供“显示层规范化”但必须能回溯到原值（例如：显示别名映射表是可选功能）。

数据质量处理（必须实现且不篡改原始数据）：

微信/Discord/x、Tag、Note 可能存在空值：展示时要显示 Unknown/(empty) 这类明确标识，但不能删除记录。

需要做 URL 基本校验（是否以 http 开头），无效也要原样保留并在 UI 标注“可能无效”。

1) 目标：多页动态年终总结网站（必须多页）

实现一个可部署的 Web App（建议 Next.js/React），至少包含以下页面（页面路径可自定，但必须存在对应功能）：

Page A — 年终总览（Overview）

展示：今年 bot 总数（必须=1168）、唯一创作者/微信名数量、Tag 总数、Top Tags（按 bot 数量排序）。

展示：按月份/日期的发布趋势（从 Launch_Date 解析），至少提供一个时间维度的统计图（柱状或折线）。

提供 CTA：进入“按微信查询”和“按 Tag 回顾”。

Page B — 按 Tag 回顾（Tag Explorer）

左侧 Tag 列表（可搜索/排序），右侧展示该 Tag 下全部 bot 列表（必须分页，防止一次性渲染卡死）。

列表每条 bot 必须展示：

Bot_Name

微信/Discord/x（完整原文）

Tag（显示拆分后的 tag chips）

MyShell_URL（可点击）

Launch_Date

Note（如为空则显示 empty）

支持组合筛选：Tag + 日期范围 + 关键词（Bot_Name / Note / 微信字段模糊匹配）。

必须提供“导出当前筛选结果 CSV/JSON”的功能（导出数据必须仍是原始真实内容）。

Page C — 开发者个人回顾（Creator Lookup）

页面中必须有输入框：用户输入自己的微信名字（字符串）。

系统进行匹配（必须支持两种）：

精确匹配（完全相等）

宽松匹配（包含/忽略大小写/去空格）——但要把匹配规则在 UI 明确展示，并允许用户切换“精确/宽松”

输出该微信名今年做了多少个 bot，并给出：

该开发者 bot 列表（分页）

该开发者 top tags

该开发者发布时间线（按月统计）

若没匹配到：必须给出“可能的相似候选”（top 10 fuzzy suggestions），并明确告知“未找到精确匹配”。

Page D — 全量目录（Directory）

提供全量 1168 bot 的可搜索表格视图（必须分页 + 虚拟列表或服务端分页）。

支持排序：Launch_Date、Bot_Name、微信字段。

点击某条 bot 进入详情页（可选，但建议）：展示该 bot 的完整字段、tag chips、同 tag 的相关 bot、同开发者的其他 bot。

2) “持久化保留数据”要求（必须实现）

你必须实现持久化存储，不仅是浏览器内存变量：

必须至少持久化以下内容：

用户输入的微信名字查询历史（输入值、匹配模式、查询时间、匹配到的 bot 数量）

页面访问/筛选行为的基础日志（例如：访问 Tag 页选了哪个 tag、导出了什么数据、时间戳）

持久化介质（必须使用数据库）：

推荐：SQLite（本地/轻量），通过 ORM（如 Prisma/Drizzle）或直接 SQL。

需要建两类表：

bots（由 CSV 导入）

user_events / lookup_history（用户行为与查询历史）

禁止仅用 localStorage 作为唯一持久化；localStorage 可作为辅助手段，但数据库必须存在并可查询。

数据导入机制（必须实现）：

提供一个 seed/import 脚本：首次启动时将 CSV 导入数据库。

导入应具备幂等性（重复执行不会产生重复数据）：例如用 MyShell_URL 或（Bot_Name + Launch_Date + MyShell_URL）作为唯一键策略，并在文档中说明。

Launch_Date 需要解析为标准日期类型（解析失败要记录原文并标注）。

3) 性能与工程化（必须实现）

因为 1168 条数据 + 多条件筛选，必须实现：

服务端分页 API（例如 /api/bots?tag=&creator=&q=&page=&pageSize=）

前端分页组件（pageSize 可选 20/50/100）

结果缓存（可选）与去抖搜索

UI 必须支持中英文混排与中文字段显示（列名含中文）。

必须提供 README.md：

环境要求

安装与启动

导入数据步骤

本地运行与构建部署

数据库文件位置与查看方法

常见问题（CSV 编码、日期解析、空值处理）

4) 安全与合规（必须做到）

所有输出内容仅来自 CSV 与用户输入；不得调用外网 API 去补齐信息。

对用户输入进行基本防注入处理（即使是 SQLite/ORM，也要避免拼接 SQL）。

微信/Discord/x 字段可能包含链接或括号内容：展示需 HTML 转义，避免 XSS。

5) 交付物（你必须输出什么）

你必须输出：

完整项目代码（按文件结构逐文件给出）

数据库 schema（Prisma/SQL migrations）

CSV 导入脚本

API 路由实现

前端页面实现（至少 4 页）

README 启动说明

（可选加分）简单的 UI 美化（Tailwind/组件库），以及统计图表（Recharts/ECharts）

6) 你必须做的“自检清单”（输出前自查并在 README 写明）

 首页显示 bot 总数 = 1168（来自数据库/CSV统计）

 任意 tag 页展示的 bot 条数与筛选统计可对上

 任意微信名查询结果可复现、可分页、可导出

 查询历史写入数据库，可在后台/管理页或 DB 中看到记录

 不存在任何假数据/硬编码示例数据

 日期解析失败不会导致崩溃，UI 有明确提示

开始实现并输出完整交付物。