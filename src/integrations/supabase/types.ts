export type ArticleStatus = 'draft' | 'published' | 'scheduled';

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  status: ArticleStatus;
  published_at: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}