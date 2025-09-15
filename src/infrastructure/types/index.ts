// Blog-MCP 基础类型定义

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseEntity {
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  role: 'admin' | 'editor' | 'author' | 'user';
  status: 'active' | 'inactive' | 'banned';
  last_sign_in_at?: string;
  email_verified: boolean;
}

export interface Post extends BaseEntity {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  read_time?: number;
  view_count: number;
  like_count: number;
  comment_count: number;
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  sort_order: number;
  post_count: number;
}

export interface Tag extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  post_count: number;
}

export interface Comment extends BaseEntity {
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'deleted';
  like_count: number;
}

export interface PostTranslation extends BaseEntity {
  post_id: string;
  locale: string;
  title: string;
  excerpt: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
}

export interface CategoryTranslation extends BaseEntity {
  category_id: string;
  locale: string;
  name: string;
  description?: string;
}

export interface TagTranslation extends BaseEntity {
  tag_id: string;
  locale: string;
  name: string;
  description?: string;
}

export interface VisitorAnalytics extends BaseEntity {
  post_id?: string;
  user_id?: string;
  session_id: string;
  ip_address: string;
  user_agent: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  country?: string;
  city?: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
}

export interface PostLike extends BaseEntity {
  post_id: string;
  user_id: string;
}

export interface PostTag extends BaseEntity {
  post_id: string;
  tag_id: string;
}

// MCP 相关类型
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export interface MCPRequest {
  method: string;
  params: Record<string, any>;
}

export interface MCPResponse {
  result: any;
  error?: string;
}

export interface MCPToolCall {
  tool: string;
  params: any;
  success: boolean;
  data?: any;
  error?: string;
}

// API 响应类型
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 搜索类型
export interface SearchQuery {
  q: string;
  type?: 'posts' | 'categories' | 'tags' | 'users';
  filters?: Record<string, any>;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  excerpt?: string;
  url: string;
  score: number;
  highlights?: string[];
}

// 配置类型
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey: string;
}

export interface AppConfig {
  supabase: SupabaseConfig;
  app: {
    name: string;
    url: string;
    description: string;
    author: string;
  };
  ai: {
    enabled: boolean;
    provider: 'openai' | 'anthropic' | 'local';
    apiKey?: string;
    model?: string;
  };
}