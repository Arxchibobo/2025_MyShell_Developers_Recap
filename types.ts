
export interface BotRecord {
  botName: string;
  developer: string;
  tags: string[];
  myshellUrl: string;
  launchDate: string;
  note: string;
}

export interface LookupHistory {
  id: string;
  timestamp: number;
  input: string;
  matchCount: number;
  mode: 'exact' | 'fuzzy';
}

export interface UserEvent {
  id: string;
  type: 'page_view' | 'export' | 'search';
  page?: string;
  data?: any;
  timestamp: number;
}

export enum Page {
  Overview = 'overview',
  Tags = 'tags',
  Creator = 'creator',
  Directory = 'directory'
}
