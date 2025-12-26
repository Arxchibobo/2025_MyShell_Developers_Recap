# MyShell 2025 开发者年度回顾

> 🎉 一个基于真实数据的开发者年度总结动态网站

## 📊 项目概述

本项目是 MyShell 2025 年度开发者回顾网站，展示了：
- **1157 个 Bot**（去重后的唯一 Bot）
- **175 位开发者**
- **152 个 Tag 分类**

所有数据来自真实的 CSV 文件，经过严格的解析、去重和验证。

## ⚡ 一键启动

```bash
# 1. 克隆仓库
git clone https://github.com/Arxchibobo/2025_MyShell_Developers_Recap.git
cd 2025_MyShell_Developers_Recap

# 2. 配置环境变量（可选，用于AI功能）
cp .env.local.example .env.local
# 编辑 .env.local 填入你的 Gemini API Key

# 3. 安装依赖（必须使用 --legacy-peer-deps）
npm install --legacy-peer-deps

# 4. 启动开发服务器
npm run dev

# 5. 打开浏览器访问
# http://localhost:3000
```

数据已预先解析完成，无需额外配置即可运行！

## ⚠️ 重要安全提示

**API Key 安全问题：** 当前实现将 API Key 编译到前端代码中，这会导致 API Key 暴露在浏览器环境中。Google 的安全系统会自动检测并禁用任何在公开渠道泄露的 API Key。

**推荐解决方案：** 使用后端 API 代理来保护 API Key。详见 [API_PROXY_SOLUTION.md](./API_PROXY_SOLUTION.md)

**当前状态：**
- ✅ 核心功能正常（数据展示、开发者查询、抽奖）
- ⚠️ AI 功能需要配置有效的 API Key
- 🔒 生产环境强烈建议使用后端代理

## 🚀 快速开始

### 环境要求

- Node.js 18+ 或更高版本
- npm 或 pnpm

### 安装依赖

```bash
# 使用 --legacy-peer-deps 解决 React 19 和 recharts 的版本冲突
npm install --legacy-peer-deps
```

**重要：** 必须使用 `--legacy-peer-deps` 标志，否则会因 peer dependencies 冲突而安装失败。

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看网站。

### 构建生产版本

```bash
npm run build
npm run preview
```

## 📁 项目结构

```
├── scripts/
│   ├── parseCSV.ts          # CSV 解析脚本
│   └── validateData.ts      # 数据验证脚本
├── assets/
│   └── bots.json           # 解析后的 JSON 数据
├── App.tsx                  # 主应用组件
├── data.ts                  # 数据导入模块
├── db.ts                    # 内存数据库
├── types.ts                 # TypeScript 类型定义
├── myshell-bots-2025.csv    # 原始 CSV 数据源
└── .env.local               # Gemini API Key 配置
```

## 🔧 数据处理流程

### 1. 解析 CSV 数据

```bash
npm run parse-csv
```

**功能：**
- 读取原始 CSV 文件（1168 行数据）
- 处理引号内的换行符和逗号
- 提取开发者名称（去除 Notion URL）
- 按 \`MyShell_URL\` 去重（保留最新日期的记录）
- 生成 \`assets/bots.json\` 文件

**输出示例：**
```
✅ 成功解析 1168 条记录
🔍 去重后: 1157 条记录
📊 最终数据: 1157 个 Bot, 175 位开发者
```

### 2. 验证数据完整性

```bash
npm run validate-data
```

**验证项：**
- ✅ Bot 总数（1150-1170 范围）
- ✅ 开发者数量（170-180 范围）
- ✅ URL 唯一性
- ✅ 必需字段完整性
- ✅ URL 格式有效性
- ✅ 日期格式（YYYY/MM/DD）
- ✅ Tag 数据完整性

## 📊 数据说明

### CSV 数据源

**文件：** `myshell-bots-2025.csv`

**字段结构：**
```csv
Bot_Name,微信/Discord/x,Tag,MyShell_URL,Note,Launch_Date
```

### 去重策略

按 \`MyShell_URL\` 去重，当有重复 URL 时保留 \`Launch_Date\` 较新的记录。

**原因：**
- 原始 CSV 有 1168 行数据
- 去重后得到 1157 个唯一 Bot
- 移除了 11 条重复记录

### 开发者名称提取

从 \`微信/Discord/x\` 字段提取开发者名称，自动去除 Notion URL。

**示例：**
```
原始: "李火火 (https://www.notion.so/1bb3f81ff51e80eba138d176a1426398?pvs=21)"
提取后: "李火火"
```

## 🎨 功能特性

### 📄 页面一：总览页（Overview）

- 展示 Bot 总数和开发者总数
- 显示所有开发者名单（交互式词云）
- 社区感谢信
- 核心统计数据卡片

### 👤 页面二：成就查询（Creator Lookup）

- 输入开发者名称查询
- 支持**精确匹配**和**模糊匹配**
- 显示该开发者的所有 Bot
- 使用 Gemini AI 生成个性化总结
- 彩纸动画庆祝效果

## 🐛 常见问题

### Q: 为什么 Bot 总数是 1157 而不是 1168？

A: 原始 CSV 包含 1168 行数据，但有 11 条重复记录（相同的 MyShell_URL）。去重后得到 1157 个唯一 Bot。

### Q: 开发者数量为什么是 175？

A: 这是从 CSV 的 \`微信/Discord/x\` 字段提取的唯一开发者名称数量。已自动去除 Notion URL 部分。

### Q: 如何重新生成数据？

A: 执行以下命令：

```bash
# 1. 确保 CSV 文件在根目录
# 2. 解析 CSV
npm run parse-csv

# 3. 验证数据
npm run validate-data

# 4. 重启开发服务器
npm run dev
```

## 📈 数据统计摘要

### Top 10 开发者
1. 工作人员: 77 个 bot
2. 放空的记忆: 63 个 bot
3. 金运: 50 个 bot
4. 李火火: 49 个 bot
5. L gong: 44 个 bot
6. soilsigh: 43 个 bot
7. 宣宣: 43 个 bot
8. _12zzz22(discord): 37 个 bot
9. 牟某某: 36 个 bot
10. 亦诚: 27 个 bot

---

**构建时间：** 2025-12-26
**数据版本：** v1.0
**技术支持：** Claude Code + Gemini 3
