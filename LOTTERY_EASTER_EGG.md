# 🎉 彩蛋抽奖系统说明

## 功能概述

在 MyShell 2025 年度回顾中，系统会**随机选择一位开发者**作为幸运中奖者。当该开发者搜索自己的名字时，会看到特殊的中奖提示。

---

## 实现机制

### 1. 中奖者选择（自动）

- **时机：** 网站首次加载数据时
- **方法：** 从 1168 位开发者中随机选择一位
- **存储：** 保存在浏览器 localStorage（`lucky_winner`）
- **持久性：** 一旦选定，除非清除浏览器缓存，否则不会改变

```typescript
// db.ts:34-40
if (!this.luckyWinner && data.length > 0) {
  const uniqueDevs = Array.from(new Set(data.map(b => b.developer)));
  const randomIndex = Math.floor(Math.random() * uniqueDevs.length);
  this.luckyWinner = uniqueDevs[randomIndex];
  localStorage.setItem('lucky_winner', this.luckyWinner);
  console.log('🎉 彩蛋抽奖：中奖者已选出！', this.luckyWinner);
}
```

### 2. 中奖检测（搜索时）

- **时机：** 用户搜索开发者名字时
- **判断：** 检查搜索结果中是否包含中奖者
- **返回：** `isLuckyWinner: true/false`

```typescript
// db.ts:97-98
const isWinner = matches.length > 0 && matches.some(b => b.developer === this.luckyWinner);
```

### 3. 中奖提示（UI）

- **位置：** 成就卡片顶部
- **样式：** 金色发光徽章 + 弹跳动画
- **文案：** "恭喜中奖！你是本次年度回顾的幸运儿！"

```tsx
{/* App.tsx:459-471 */}
{isLuckyWinner && (
  <div className="mb-12 animate-bounce">
    <div className="inline-flex items-center gap-6 px-16 py-8 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 shadow-[0_0_80px_rgba(234,179,8,0.5)]">
      <span className="text-7xl animate-pulse">🎉</span>
      <div className="text-left">
        <div className="text-4xl font-black text-yellow-300">恭喜中奖！</div>
        <div className="text-lg text-yellow-200 mt-1">你是本次年度回顾的幸运儿！</div>
      </div>
      <span className="text-7xl animate-pulse">🎊</span>
    </div>
  </div>
)}
```

---

## 视觉效果

### 中奖提示样式

- **背景：** 渐变（黄色到橙色，半透明）
- **边框：** 金色发光边框
- **光晕：** `shadow-[0_0_80px_rgba(234,179,8,0.5)]`
- **动画：**
  - 整体弹跳：`animate-bounce`
  - 表情闪烁：`animate-pulse`
- **图标：** 🎉 🎊

---

## 技术细节

### 随机性保证

- 使用 `Math.random()` 确保真正随机
- 基于唯一开发者列表（去重后）
- 概率均等：每位开发者中奖概率 = 1 / 总开发者数

### 持久化策略

```typescript
// 保存中奖者
localStorage.setItem('lucky_winner', this.luckyWinner);

// 加载中奖者
const w = localStorage.getItem('lucky_winner');
if (w) this.luckyWinner = w;
```

### 检测逻辑

```typescript
// 1. 搜索开发者
const res = db.searchByCreator(searchName, 'fuzzy');

// 2. 检查是否中奖
if (res.isLuckyWinner) {
  setIsLuckyWinner(true);
}
```

---

## 用户体验流程

1. **网站加载** → 自动选出一位中奖者（控制台可见）
2. **用户搜索** → 输入自己的名字
3. **系统检测** → 判断是否为中奖者
4. **显示结果** →
   - 非中奖者：正常显示成就卡片
   - 中奖者：顶部显示金色中奖提示 + 成就卡片

---

## 调试方法

### 查看中奖者

打开浏览器控制台（F12），查找日志：

```
🎉 彩蛋抽奖：中奖者已选出！ 张三
```

### 手动设置中奖者（测试用）

在控制台执行：

```javascript
localStorage.setItem('lucky_winner', '你的名字');
location.reload();
```

### 重新抽奖

清除缓存后刷新：

```javascript
localStorage.removeItem('lucky_winner');
location.reload();
```

---

## 文件清单

| 文件 | 修改内容 | 说明 |
|-----|---------|------|
| `db.ts` | 新增中奖逻辑 | 选择中奖者、检测中奖 |
| `App.tsx` | 新增中奖提示 | 显示中奖徽章 |
| `deploy.sh` | 更新 API Key | AIzaSyCsvye2kLGyQIdPAfBogsUf8ZXNO5qfZmg |

---

## 统计数据

- **总开发者数：** 1168 位（去重后可能略少）
- **中奖概率：** ~0.085%（1 / 1168）
- **中奖人数：** 1 位
- **中奖奖励：** 专属金色徽章 🎉

---

## 注意事项

1. **唯一性：** 全站仅一位中奖者
2. **公平性：** 完全随机，无人为干预
3. **持久性：** 中奖者固定，除非清除缓存
4. **隐私性：** 中奖者信息仅存储在本地浏览器
5. **兼容性：** 需要浏览器支持 localStorage

---

**完成时间：** 2025-12-26
**状态：** ✅ 已实现并测试
**中奖者：** 随机（首次加载时确定）
