#!/usr/bin/env node
/**
 * CSV 解析脚本
 * 功能：读取原始 CSV 文件，解析数据，去重，生成 JSON 文件
 */

import * as fs from 'fs';
import * as path from 'path';

interface BotRecord {
  botName: string;
  developer: string;
  tags: string[];
  myshellUrl: string;
  launchDate: string;
  note: string;
}

// 提取开发者名称，去除 Notion URL
function extractDeveloperName(raw: string): string {
  if (!raw) return 'Unknown';

  // 处理格式: "李火火 (https://www.notion.so/...)" -> "李火火"
  // 或 "_12zzz22(discord) (https://...)" -> "_12zzz22(discord)"
  const urlMatch = raw.match(/^(.+?)\s+\(https?:\/\/[^)]+\)$/);
  if (urlMatch) {
    return urlMatch[1].trim();
  }

  return raw.trim();
}

// 解析 CSV 行（手动处理，因为有逗号在引号内的情况）
// 改进版：处理引号内的换行符
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// 解析整个 CSV，处理跨行的引号字段
function parseCSVContent(content: string): string[][] {
  const rows: string[][] = [];
  const lines = content.split('\n');

  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }

    // 如果还在引号内，说明字段跨行，添加换行符并继续
    if (inQuotes) {
      currentField += '\n';
    } else {
      // 行结束，添加最后一个字段
      currentRow.push(currentField.trim());

      if (currentRow.some(f => f.length > 0)) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentField = '';
    }
  }

  // 处理最后一行
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// 解析 CSV 文件
function parseCSV(csvPath: string): BotRecord[] {
  console.log(`📖 正在读取 CSV 文件: ${csvPath}`);

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSVContent(content);

  console.log(`📊 CSV 总行数 (含表头): ${rows.length}`);

  // 跳过表头
  const dataRows = rows.slice(1);
  const bots: BotRecord[] = [];
  let skippedLines = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const fields = dataRows[i];

    // CSV 格式: Bot_Name, 微信/Discord/x, Tag, MyShell_URL, Note, Launch_Date
    if (fields.length < 6) {
      console.warn(`⚠️  行 ${i + 2} 字段不足，跳过: ${fields.length} 个字段 - ${fields[0]?.substring(0, 30)}`);
      skippedLines++;
      continue;
    }

    const [botName, rawDeveloper, rawTags, myshellUrl, note, launchDate] = fields;

    // 验证必需字段
    if (!botName || !myshellUrl) {
      console.warn(`⚠️  行 ${i + 2} 缺少必需字段，跳过`);
      skippedLines++;
      continue;
    }

    // 解析 Tag（逗号分隔，需要 trim）
    const tags = rawTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const bot: BotRecord = {
      botName: botName.trim(),
      developer: extractDeveloperName(rawDeveloper || 'Unknown'),
      tags,
      myshellUrl: myshellUrl.trim(),
      note: (note || '').trim().replace(/\n/g, ' '),  // 移除 Note 中的换行符
      launchDate: (launchDate || '').trim()
    };

    bots.push(bot);
  }

  console.log(`✅ 成功解析 ${bots.length} 条记录`);
  if (skippedLines > 0) {
    console.log(`⚠️  跳过 ${skippedLines} 条无效记录`);
  }

  return bots;
}

// 按 MyShell_URL 去重，保留日期最新的记录
function deduplicateBots(bots: BotRecord[]): BotRecord[] {
  console.log(`\n🔍 开始去重处理...`);
  console.log(`去重前: ${bots.length} 条记录`);

  const urlMap = new Map<string, BotRecord>();

  bots.forEach(bot => {
    const existing = urlMap.get(bot.myshellUrl);

    if (!existing) {
      urlMap.set(bot.myshellUrl, bot);
    } else {
      // 比较日期，保留较新的
      const existingDate = new Date(existing.launchDate);
      const currentDate = new Date(bot.launchDate);

      if (currentDate > existingDate || isNaN(existingDate.getTime())) {
        urlMap.set(bot.myshellUrl, bot);
        console.log(`🔄 替换重复记录: ${bot.botName} (${bot.launchDate})`);
      }
    }
  });

  const uniqueBots = Array.from(urlMap.values());
  console.log(`去重后: ${uniqueBots.length} 条记录`);
  console.log(`✂️  移除了 ${bots.length - uniqueBots.length} 条重复记录`);

  return uniqueBots;
}

// 统计信息
function printStats(bots: BotRecord[]) {
  console.log(`\n📊 数据统计信息:`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // Bot 总数
  console.log(`🤖 Bot 总数: ${bots.length}`);

  // 唯一开发者数
  const developers = new Set(bots.map(b => b.developer));
  console.log(`👥 唯一开发者: ${developers.size} 位`);

  // Tag 统计
  const allTags = bots.flatMap(b => b.tags);
  const tagCounts: Record<string, number> = {};
  allTags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log(`🏷️  唯一 Tag 数: ${Object.keys(tagCounts).length}`);
  console.log(`\n📈 Top 10 Tags:`);
  topTags.forEach(([tag, count], idx) => {
    console.log(`   ${idx + 1}. ${tag}: ${count} 个 bot`);
  });

  // 开发者排名
  const devCounts: Record<string, number> = {};
  bots.forEach(b => devCounts[b.developer] = (devCounts[b.developer] || 0) + 1);
  const topDevs = Object.entries(devCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log(`\n🏆 Top 10 开发者:`);
  topDevs.forEach(([dev, count], idx) => {
    console.log(`   ${idx + 1}. ${dev}: ${count} 个 bot`);
  });

  // URL 验证
  const validUrls = bots.filter(b => b.myshellUrl.startsWith('https://app.myshell.ai/')).length;
  console.log(`\n🔗 有效 URL: ${validUrls}/${bots.length}`);

  // 日期验证
  const validDates = bots.filter(b => /^\d{4}\/\d{2}\/\d{2}$/.test(b.launchDate)).length;
  console.log(`📅 有效日期: ${validDates}/${bots.length}`);

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

// 主函数
function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  MyShell 2025 Recap - CSV 数据解析器`);
  console.log(`${'='.repeat(60)}\n`);

  const csvPath = path.join(process.cwd(), 'myshell-bots-2025.csv');
  const outputPath = path.join(process.cwd(), 'assets', 'bots.json');

  // 确保 assets 目录存在
  const assetsDir = path.dirname(outputPath);
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log(`📁 创建目录: ${assetsDir}`);
  }

  // 检查 CSV 文件是否存在
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ 错误: CSV 文件不存在: ${csvPath}`);
    process.exit(1);
  }

  // 解析 CSV
  let bots = parseCSV(csvPath);

  // 去重
  bots = deduplicateBots(bots);

  // 按日期排序（最新的在前）
  bots.sort((a, b) => {
    const dateA = new Date(a.launchDate);
    const dateB = new Date(b.launchDate);
    return dateB.getTime() - dateA.getTime();
  });

  // 打印统计信息
  printStats(bots);

  // 保存 JSON
  console.log(`💾 保存到: ${outputPath}`);
  fs.writeFileSync(outputPath, JSON.stringify(bots, null, 2), 'utf-8');

  console.log(`\n✅ 数据解析完成！`);
  console.log(`📦 生成文件: ${outputPath}`);
  console.log(`📊 最终数据: ${bots.length} 个 Bot, ${new Set(bots.map(b => b.developer)).size} 位开发者\n`);
}

main();
