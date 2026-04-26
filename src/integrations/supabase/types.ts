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
  created_at: string;
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