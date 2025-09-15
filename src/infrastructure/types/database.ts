// Blog-MCP 数据库类型定义
// 基于 DATABASE-DESIGN.md 中设计的完整表结构

export interface Database {
  public: {
    Tables: {
      // 用户资料表
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          location: string | null;
          twitter_handle: string | null;
          github_handle: string | null;
          linkedin_handle: string | null;
          role: 'user' | 'admin' | 'moderator';
          status: 'active' | 'inactive' | 'suspended' | 'banned';
          email_verified: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          twitter_handle?: string | null;
          github_handle?: string | null;
          linkedin_handle?: string | null;
          role?: 'user' | 'admin' | 'moderator';
          status?: 'active' | 'inactive' | 'suspended' | 'banned';
          email_verified?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          twitter_handle?: string | null;
          github_handle?: string | null;
          linkedin_handle?: string | null;
          role?: 'user' | 'admin' | 'moderator';
          status?: 'active' | 'inactive' | 'suspended' | 'banned';
          email_verified?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 文章表
      posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          content_html: string | null;
          featured_image: string | null;
          status: 'draft' | 'published' | 'archived' | 'deleted';
          visibility: 'public' | 'private' | 'password_protected';
          password: string | null;
          comment_enabled: boolean;
          featured: boolean;
          pinned: boolean;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string[] | null;
          reading_time: number;
          view_count: number;
          like_count: number;
          comment_count: number;
          published_at: string | null;
          scheduled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          slug?: string;
          excerpt?: string | null;
          content: string;
          content_html?: string | null;
          featured_image?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'deleted';
          visibility?: 'public' | 'private' | 'password_protected';
          password?: string | null;
          comment_enabled?: boolean;
          featured?: boolean;
          pinned?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[] | null;
          reading_time?: number;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          published_at?: string | null;
          scheduled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          content_html?: string | null;
          featured_image?: string | null;
          status?: 'draft' | 'published' | 'archived' | 'deleted';
          visibility?: 'public' | 'private' | 'password_protected';
          password?: string | null;
          comment_enabled?: boolean;
          featured?: boolean;
          pinned?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[] | null;
          reading_time?: number;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          published_at?: string | null;
          scheduled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 分类表
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          icon: string | null;
          parent_id: string | null;
          sort_order: number;
          post_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
          description?: string | null;
          color?: string;
          icon?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          post_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string;
          icon?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          post_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 标签表
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          post_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
          description?: string | null;
          color?: string;
          post_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string;
          post_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 文章分类关联表
      post_categories: {
        Row: {
          post_id: string;
          category_id: string;
        };
        Insert: {
          post_id: string;
          category_id: string;
        };
        Update: {
          post_id?: string;
          category_id?: string;
        };
      };

      // 文章标签关联表
      post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
        };
      };

      // 评论表
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string | null;
          parent_id: string | null;
          guest_name: string | null;
          guest_email: string | null;
          content: string;
          content_html: string | null;
          status: 'pending' | 'approved' | 'spam' | 'deleted';
          like_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id?: string | null;
          parent_id?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          content: string;
          content_html?: string | null;
          status?: 'pending' | 'approved' | 'spam' | 'deleted';
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string | null;
          parent_id?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          content?: string;
          content_html?: string | null;
          status?: 'pending' | 'approved' | 'spam' | 'deleted';
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 媒体文件表
      media: {
        Row: {
          id: string;
          author_id: string | null;
          filename: string;
          original_name: string;
          file_path: string;
          file_url: string;
          file_type: string;
          file_size: number;
          mime_type: string | null;
          width: number | null;
          height: number | null;
          alt_text: string | null;
          title: string | null;
          description: string | null;
          folder_path: string;
          status: 'active' | 'deleted';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          filename: string;
          original_name: string;
          file_path: string;
          file_url: string;
          file_type: string;
          file_size: number;
          mime_type?: string | null;
          width?: number | null;
          height?: number | null;
          alt_text?: string | null;
          title?: string | null;
          description?: string | null;
          folder_path?: string;
          status?: 'active' | 'deleted';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          filename?: string;
          original_name?: string;
          file_path?: string;
          file_url?: string;
          file_type?: string;
          file_size?: number;
          mime_type?: string | null;
          width?: number | null;
          height?: number | null;
          alt_text?: string | null;
          title?: string | null;
          description?: string | null;
          folder_path?: string;
          status?: 'active' | 'deleted';
          created_at?: string;
          updated_at?: string;
        };
      };

      // 用户活动表
      user_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          activity_data: Record<string, any> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          activity_data?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          activity_data?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };

      // 系统设置表
      settings: {
        Row: {
          id: string;
          key: string;
          value: Record<string, any>;
          description: string | null;
          type: 'string' | 'number' | 'boolean' | 'json' | 'array';
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Record<string, any>;
          description?: string | null;
          type?: 'string' | 'number' | 'boolean' | 'json' | 'array';
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Record<string, any>;
          description?: string | null;
          type?: 'string' | 'number' | 'boolean' | 'json' | 'array';
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // 搜索索引表
      search_index: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          title: string;
          content: string | null;
          tags: string[] | null;
          search_vector: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          title: string;
          content?: string | null;
          tags?: string[] | null;
          search_vector?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          title?: string;
          content?: string | null;
          tags?: string[] | null;
          search_vector?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // AI 内容生成表
      ai_content_generations: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          prompt: string;
          generated_content: string;
          model: string;
          tokens_used: number;
          cost: number;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          error_message: string | null;
          metadata: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          prompt: string;
          generated_content: string;
          model: string;
          tokens_used?: number;
          cost?: number;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          error_message?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          prompt?: string;
          generated_content?: string;
          model?: string;
          tokens_used?: number;
          cost?: number;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          error_message?: string | null;
          metadata?: Record<string, any> | null;
          created_at?: string;
        };
      };

      // AI 标签建议表
      ai_tag_suggestions: {
        Row: {
          id: string;
          post_id: string;
          tag_id: string;
          confidence_score: number;
          suggestion_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          tag_id: string;
          confidence_score?: number;
          suggestion_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          tag_id?: string;
          confidence_score?: number;
          suggestion_reason?: string | null;
          created_at?: string;
        };
      };

      // 文章统计表
      post_analytics: {
        Row: {
          id: string;
          post_id: string;
          date: string;
          views: number;
          unique_views: number;
          likes: number;
          comments: number;
          shares: number;
          bookmarks: number;
          referrers: Record<string, number> | null;
          countries: Record<string, number> | null;
          devices: Record<string, number> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          date: string;
          views?: number;
          unique_views?: number;
          likes?: number;
          comments?: number;
          shares?: number;
          bookmarks?: number;
          referrers?: Record<string, number> | null;
          countries?: Record<string, number> | null;
          devices?: Record<string, number> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          date?: string;
          views?: number;
          unique_views?: number;
          likes?: number;
          comments?: number;
          shares?: number;
          bookmarks?: number;
          referrers?: Record<string, number> | null;
          countries?: Record<string, number> | null;
          devices?: Record<string, number> | null;
          created_at?: string;
        };
      };
    };
    Views: {
      // 文章统计视图
      post_stats_view: {
        Row: {
          id: string;
          title: string;
          slug: string;
          author_id: string;
          author_name: string;
          status: string;
          view_count: number;
          like_count: number;
          comment_count: number;
          published_at: string | null;
          category_names: string[];
          tag_names: string[];
        };
      };
      
      // 用户统计视图
      user_stats_view: {
        Row: {
          id: string;
          username: string;
          email: string;
          post_count: number;
          comment_count: number;
          last_login: string | null;
          created_at: string;
        };
      };
    };
    Functions: {
      // 生成 UUID
      generate_uuid: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      
      // 生成 slug
      generate_slug: {
        Args: {
          text: string;
        };
        Returns: string;
      };
      
      // 更新文章计数
      update_post_counts: {
        Args: {
          post_id: string;
        };
        Returns: void;
      };
      
      // 更新搜索索引
      update_search_index: {
        Args: {
          entity_type: string;
          entity_id: string;
        };
        Returns: void;
      };
      
      // 获取文章推荐
      get_post_recommendations: {
        Args: {
          user_id: string;
          limit?: number;
        };
        Returns: Array<{
          id: string;
          title: string;
          score: number;
        }>;
      };
    };
    Enums: {
      // 用户角色枚举
      user_role: {
        user: 'user';
        admin: 'admin';
        moderator: 'moderator';
      };
      
      // 文章状态枚举
      post_status: {
        draft: 'draft';
        published: 'published';
        archived: 'archived';
        deleted: 'deleted';
      };
      
      // 评论状态枚举
      comment_status: {
        pending: 'pending';
        approved: 'approved';
        spam: 'spam';
        deleted: 'deleted';
      };
    };
  };
}

// 数据库查询辅助类型
export type DatabaseQuery<T extends keyof Database['public']['Tables']> = {
  select?: string;
  from: T;
  where?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
};

// 数据库事件类型
export type DatabaseEvent = {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  old: Record<string, any> | null;
  new: Record<string, any> | null;
};

// 数据库错误类型
export type DatabaseError = {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
};