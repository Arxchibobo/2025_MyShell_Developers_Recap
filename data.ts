/**
 * 数据导入模块
 *
 * 从 assets/bots.json 加载预解析的bot数据
 * 使用命令 `npm run parse-csv` 来重新生成 JSON 文件
 */

import { db } from './db';
import botsData from './assets/bots.json';

// 自动导入数据到内存数据库
db.seed(botsData);

console.log(`✅ MyShell 2025 数据已加载: ${botsData.length} 个 Bot`);
