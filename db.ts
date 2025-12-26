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
    // Extract unique developer names, stripping the URL part if present
    const creators = new Set(this.bots.map(b => b.developer.split('(')[0].trim())).size;
    const allTags = this.bots.flatMap(b => b.tags);
    const tagCounts: Record<string, number> = {};
    allTags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);
    
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
    
    const matches = this.bots.filter(b => {
      const rawDev = b.developer.toLowerCase();
      // Extract name from "Name (URL)" format
      const cleanName = rawDev.split('(')[0].trim();
      
      if (mode === 'exact') {
        return cleanName === query || rawDev === query;
      }
      return rawDev.includes(query) || cleanName.includes(query);
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
    const devs = Array.from(new Set(this.bots.map(b => b.developer.split('(')[0].trim())));
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
