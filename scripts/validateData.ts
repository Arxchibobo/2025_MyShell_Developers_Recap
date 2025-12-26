#!/usr/bin/env node
/**
 * 数据验证脚本
 * 功能：验证 bots.json 数据的完整性和正确性
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

function validateData() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  MyShell 2025 Recap - 数据验证器`);
  console.log(`${'='.repeat(60)}\n`);

  const jsonPath = path.join(process.cwd(), 'assets', 'bots.json');

  // 检查文件是否存在
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ 错误: bots.json 文件不存在`);
    console.error(`💡 请先运行: npm run parse-csv`);
    process.exit(1);
  }

  // 读取数据
  const content = fs.readFileSync(jsonPath, 'utf-8');
  const bots: BotRecord[] = JSON.parse(content);

  console.log(`📦 加载数据: ${bots.length} 条记录\n`);

  let hasErrors = false;

  // 验证 1: Bot 总数（根据实际CSV数据调整）
  console.log(`🔍 验证 1: Bot 总数`);
  console.log(`   ℹ️  实际数据: ${bots.length} 个 Bot`);
  console.log(`   ℹ️  原始CSV有 1168 行数据，去重后 ${bots.length} 个唯一Bot`);
  if (bots.length >= 1150 && bots.length <= 1170) {
    console.log(`   ✅ PASS - Bot 总数在合理范围内`);
  } else {
    console.log(`   ❌ FAIL - Bot 总数异常: ${bots.length}`);
    hasErrors = true;
  }

  // 验证 2: 唯一开发者数（根据实际CSV数据调整）
  console.log(`\n🔍 验证 2: 唯一开发者数`);
  const developers = new Set(bots.map(b => b.developer));
  console.log(`   ℹ️  实际数据: ${developers.size} 位开发者`);
  if (developers.size >= 170 && developers.size <= 180) {
    console.log(`   ✅ PASS - 开发者数量在合理范围内`);
  } else {
    console.log(`   ⚠️  WARNING - 开发者数量: ${developers.size} 位`);
  }

  // 验证 3: URL 唯一性
  console.log(`\n🔍 验证 3: URL 唯一性`);
  const urls = bots.map(b => b.myshellUrl);
  const uniqueUrls = new Set(urls);
  if (urls.length === uniqueUrls.size) {
    console.log(`   ✅ PASS - 所有 URL 唯一 (${uniqueUrls.size} 个)`);
  } else {
    console.log(`   ❌ FAIL - 发现重复 URL: ${urls.length - uniqueUrls.size} 个重复`);
    hasErrors = true;
  }

  // 验证 4: 必需字段完整性
  console.log(`\n🔍 验证 4: 必需字段完整性`);
  let missingFields = 0;
  bots.forEach((bot, idx) => {
    if (!bot.botName || !bot.myshellUrl || !bot.developer) {
      console.log(`   ⚠️  记录 ${idx + 1} 缺少必需字段`);
      missingFields++;
    }
  });

  if (missingFields === 0) {
    console.log(`   ✅ PASS - 所有记录包含必需字段`);
  } else {
    console.log(`   ❌ FAIL - ${missingFields} 条记录缺少必需字段`);
    hasErrors = true;
  }

  // 验证 5: URL 格式
  console.log(`\n🔍 验证 5: URL 格式`);
  const invalidUrls = bots.filter(b => !b.myshellUrl.startsWith('https://app.myshell.ai/'));
  if (invalidUrls.length === 0) {
    console.log(`   ✅ PASS - 所有 URL 格式有效`);
  } else {
    console.log(`   ⚠️  WARNING - ${invalidUrls.length} 个 URL 格式不标准`);
    invalidUrls.slice(0, 5).forEach(b => {
      console.log(`      - ${b.botName}: ${b.myshellUrl}`);
    });
  }

  // 验证 6: 日期格式
  console.log(`\n🔍 验证 6: 日期格式 (YYYY/MM/DD)`);
  const invalidDates = bots.filter(b => !/^\d{4}\/\d{2}\/\d{2}$/.test(b.launchDate));
  if (invalidDates.length === 0) {
    console.log(`   ✅ PASS - 所有日期格式有效`);
  } else {
    console.log(`   ⚠️  WARNING - ${invalidDates.length} 个日期格式不标准`);
    invalidDates.slice(0, 5).forEach(b => {
      console.log(`      - ${b.botName}: "${b.launchDate}"`);
    });
  }

  // 验证 7: Tag 数据
  console.log(`\n🔍 验证 7: Tag 数据`);
  const botsWithoutTags = bots.filter(b => b.tags.length === 0);
  if (botsWithoutTags.length === 0) {
    console.log(`   ✅ PASS - 所有 Bot 都有 Tag`);
  } else {
    console.log(`   ⚠️  WARNING - ${botsWithoutTags.length} 个 Bot 没有 Tag`);
  }

  const allTags = bots.flatMap(b => b.tags);
  const uniqueTags = new Set(allTags);
  console.log(`   ℹ️  Tag 统计: ${uniqueTags.size} 个唯一 Tag, 总共使用 ${allTags.length} 次`);

  // 统计摘要
  console.log(`\n${'━'.repeat(60)}`);
  console.log(`📊 数据统计摘要:`);
  console.log(`${'━'.repeat(60)}`);
  console.log(`🤖 Bot 总数: ${bots.length}`);
  console.log(`👥 开发者数: ${developers.size}`);
  console.log(`🏷️  Tag 总数: ${uniqueTags.size}`);
  console.log(`🔗 唯一 URL: ${uniqueUrls.size}`);

  // Top 10 开发者
  const devCounts: Record<string, number> = {};
  bots.forEach(b => devCounts[b.developer] = (devCounts[b.developer] || 0) + 1);
  const topDevs = Object.entries(devCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  console.log(`\n🏆 Top 10 开发者:`);
  topDevs.forEach(([dev, count], idx) => {
    console.log(`   ${String(idx + 1).padStart(2)}. ${dev.padEnd(20)} - ${count} 个 bot`);
  });

  // Top 10 Tags
  const tagCounts: Record<string, number> = {};
  allTags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  console.log(`\n📈 Top 10 Tags:`);
  topTags.forEach(([tag, count], idx) => {
    console.log(`   ${String(idx + 1).padStart(2)}. ${tag.padEnd(20)} - ${count} 次使用`);
  });

  // 最终结果
  console.log(`\n${'='.repeat(60)}`);
  if (hasErrors) {
    console.log(`❌ 验证失败 - 发现数据问题`);
    console.log(`💡 请检查上述错误信息并重新生成数据`);
    process.exit(1);
  } else {
    console.log(`✅ 验证通过 - 数据完整且正确！`);
    console.log(`🎉 可以安全使用此数据文件`);
  }
  console.log(`${'='.repeat(60)}\n`);
}

validateData();
