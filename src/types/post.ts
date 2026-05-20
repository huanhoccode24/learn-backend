export interface Post {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  content: string;
  description?: string;
  categoryName?: string;
  authorName?: string;
  authorImage?: string;
  status?: 'PUBLISHED' | 'DRAFT' | 'PENDING' | 'REJECTED';
  rejectionReason?: string;
  isFeatured?: boolean;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryName?: string;
  authorName?: string;
  thumbnail?: string;
}
