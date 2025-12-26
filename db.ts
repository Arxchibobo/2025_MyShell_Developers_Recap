import { BotRecord, LookupHistory, UserEvent } from './types';

class LocalDB {
  private bots: BotRecord[] = [];
  private history: LookupHistory[] = [];
  private events: UserEvent[] = [];

  constructor() {
    this.loadPersistedData();
  }

  private loadPersistedData() {
    const h = localStorage.getItem('bot_lookup_history');
    const e = localStorage.getItem('bot_user_events');
    if (h) this.history = JSON.parse(h);
    if (e) this.events = JSON.parse(e);
  }

  private saveHistory() {
    localStorage.setItem('bot_lookup_history', JSON.stringify(this.history));
  }

  private saveEvents() {
    localStorage.setItem('bot_user_events', JSON.stringify(this.events));
  }

  public seed(data: BotRecord[]) {
    this.bots = data;
  }

  public getAllBots(): BotRecord[] {
    return this.bots;
  }

  public getStats() {
    const total = this.bots.length;

    // 提取唯一开发者名称
    // 注意：开发者名称已经在解析时去除了URL，这里直接使用即可
    const uniqueDevs = new Set(this.bots.map(b => b.developer));
    const creators = uniqueDevs.size;

    // 统计所有Tag
    const allTags = this.bots.flatMap(b => b.tags);
    const tagCounts: Record<string, number> = {};
    allTags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);

    // 调试输出
    console.log(`📊 数据库统计: ${total} 个 Bot, ${creators} 位开发者, ${Object.keys(tagCounts).length} 个 Tag`);

    return {
      total,
      creators,
      uniqueTags: Object.keys(tagCounts).length,
      topTags: Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8),
      tagCounts
    };
  }

  public searchByCreator(name: string, mode: 'exact' | 'fuzzy') {
    const query = name.trim().toLowerCase();

    // 开发者名称已在解析时去除URL，直接比较即可
    const matches = this.bots.filter(b => {
      const devName = b.developer.toLowerCase();

      if (mode === 'exact') {
        return devName === query;
      }
      return devName.includes(query);
    });

    const entry: LookupHistory = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      input: name,
      matchCount: matches.length,
      mode
    };

    this.history.unshift(entry);
    this.saveHistory();
    this.logEvent('search', { query: name, mode, results: matches.length });

    return {
      matches,
      suggestions: mode === 'fuzzy' && matches.length === 0 
        ? this.getFuzzySuggestions(query) 
        : []
    };
  }

  private getFuzzySuggestions(query: string) {
    // 获取所有唯一开发者名称
    const devs = Array.from(new Set(this.bots.map(b => b.developer)));
    return devs
      .filter(d => d.toLowerCase().includes(query))
      .slice(0, 10);
  }

  public logEvent(type: UserEvent['type'], data?: any) {
    const event: UserEvent = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now()
    };
    this.events.unshift(event);
    this.saveEvents();
  }
}

export const db = new LocalDB();
