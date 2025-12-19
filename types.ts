export interface GuestPostRequest {
  id: string;
  keyword: string;
  hostNiche: string;
  targetLink: string;
  anchorText: string;
  targetNiche: string;
}

export interface GeneratedArticle {
  id: string;
  requestId: string;
  title: string;
  content: string; // Markdown content
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
  driveUrl?: string; // Real Google Drive WebViewLink
  driveId?: string;
}

export enum AppMode {
  SINGLE = 'SINGLE',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS'
}