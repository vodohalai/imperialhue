export type ArticleStatus = 'draft' | 'published' | 'scheduled' | 'draft_ai' | 'failed';

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  status: ArticleStatus;
  published_at: string | null;
  scheduled_for?: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface SeoTopic {
  id: string;
  topic: string;
  keyword: string;
  search_intent: string;
  category: string;
  priority_score: number;
  status: 'pending' | 'used' | 'rejected';
  research_notes?: string | null;
  source_urls?: string[] | null;
  researched_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AiContentJob {
  id: string;
  topic_id: string | null;
  article_id: string | null;
  title: string | null;
  image_prompt: string | null;
  image_url: string | null;
  status: 'draft_ai' | 'scheduled' | 'published' | 'failed';
  scheduled_for: string | null;
  published_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export type WorkflowMode = "running" | "paused";

export interface WorkflowControl {
  id: string;
  workflow_key: string;
  mode: WorkflowMode;
  default_schedule_time?: string | null;
  updated_at: string;
}

export type WorkflowLogStatus = 'success' | 'failed' | 'skipped' | 'running';

export interface WorkflowLog {
  id: string;
  workflow_key: string;
  action: string;
  status: WorkflowLogStatus;
  message?: string | null;
  details?: Record<string, unknown> | null;
  duration_ms?: number | null;
  created_at: string;
}