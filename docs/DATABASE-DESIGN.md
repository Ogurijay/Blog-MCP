# Blog-MCP 数据库设计文档

## 📋 数据库概述

Blog-MCP 系统采用 PostgreSQL 数据库，使用 Supabase 作为数据库服务。设计遵循以下原则：

- **规范化设计**: 避免数据冗余，保持数据一致性
- **性能优化**: 合理使用索引，考虑查询性能
- **扩展性**: 支持未来功能扩展
- **安全性**: 使用 Row Level Security (RLS) 保护数据
- **UUID 主键**: 使用 UUID 而非自增 ID，提高安全性

## 🗃️ 核心表结构

### 1. 用户表 (profiles)

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    location VARCHAR(100),
    twitter_handle VARCHAR(50),
    github_handle VARCHAR(50),
    linkedin_handle VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- 触发器：更新 updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. 文章表 (posts)

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    content_html TEXT,
    featured_image TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'password_protected')),
    password VARCHAR(255),
    comment_enabled BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    seo_title VARCHAR(200),
    seo_description TEXT,
    seo_keywords TEXT[],
    reading_time INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_featured ON posts(featured);
CREATE INDEX idx_posts_pinned ON posts(pinned);
CREATE INDEX idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- 全文搜索索引
CREATE INDEX idx_posts_search ON posts USING GIN(
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, ''))
);

-- 触发器：更新 updated_at
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 触发器：生成 slug
CREATE TRIGGER generate_post_slug
    BEFORE INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION generate_slug_from_title();
```

### 3. 分类表 (categories)

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_created_at ON categories(created_at);

-- 触发器：更新 updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. 标签表 (tags)

```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#10B981',
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_post_count ON tags(post_count DESC);
CREATE INDEX idx_tags_created_at ON tags(created_at);

-- 触发器：更新 updated_at
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5. 文章分类关联表 (post_categories)

```sql
CREATE TABLE post_categories (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- 索引
CREATE INDEX idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories(category_id);
```

### 6. 文章标签关联表 (post_tags)

```sql
CREATE TABLE post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- 索引
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);
```

### 7. 评论表 (comments)

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    guest_name VARCHAR(100),
    guest_email VARCHAR(255),
    content TEXT NOT NULL,
    content_html TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'deleted')),
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 触发器：更新 updated_at
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 8. 媒体文件表 (media)

```sql
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    title VARCHAR(200),
    description TEXT,
    folder_path TEXT DEFAULT '/',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_media_author_id ON media(author_id);
CREATE INDEX idx_media_file_type ON media(file_type);
CREATE INDEX idx_media_folder_path ON media(folder_path);
CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_created_at ON media(created_at DESC);

-- 触发器：更新 updated_at
CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 9. 用户活动表 (user_activities)

```sql
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);
```

### 10. 系统设置表 (settings)

```sql
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json', 'array')),
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_type ON settings(type);

-- 触发器：更新 updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 🔍 搜索优化表

### 11. 搜索索引表 (search_index)

```sql
CREATE TABLE search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'post', 'profile', 'category', 'tag'
    entity_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT[],
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_search_index_entity_type ON search_index(entity_type);
CREATE INDEX idx_search_index_entity_id ON search_index(entity_id);
CREATE INDEX idx_search_index_search_vector ON search_index USING GIN(search_vector);

-- 触发器：更新搜索向量
CREATE TRIGGER update_search_vector
    BEFORE INSERT OR UPDATE ON search_index
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vector_trigger();
```

## 🤖 AI 相关表

### 12. AI 内容生成表 (ai_content_generations)

```sql
CREATE TABLE ai_content_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    model VARCHAR(50) NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_ai_content_generations_user_id ON ai_content_generations(user_id);
CREATE INDEX idx_ai_content_generations_post_id ON ai_content_generations(post_id);
CREATE INDEX idx_ai_content_generations_status ON ai_content_generations(status);
CREATE INDEX idx_ai_content_generations_created_at ON ai_content_generations(created_at DESC);
```

### 13. AI 标签建议表 (ai_tag_suggestions)

```sql
CREATE TABLE ai_tag_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    confidence_score DECIMAL(5, 4) DEFAULT 0,
    suggestion_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_ai_tag_suggestions_post_id ON ai_tag_suggestions(post_id);
CREATE INDEX idx_ai_tag_suggestions_tag_id ON ai_tag_suggestions(tag_id);
CREATE INDEX idx_ai_tag_suggestions_confidence ON ai_tag_suggestions(confidence_score DESC);
```

## 📊 分析数据表

### 14. 文章统计表 (post_analytics)

```sql
CREATE TABLE post_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    referrers JSONB,
    countries JSONB,
    devices JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_post_analytics_post_id ON post_analytics(post_id);
CREATE INDEX idx_post_analytics_date ON post_analytics(date);
CREATE UNIQUE INDEX idx_post_analytics_unique ON post_analytics(post_id, date);
```

## 🔄 触发器函数

```sql
-- 更新 updated_at 字段的通用函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 生成 slug 的函数
CREATE OR REPLACE FUNCTION generate_slug_from_title()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s]', '', 'g'));
        NEW.slug = REGEXP_REPLACE(NEW.slug, '\s+', '-', 'g');
        -- 确保唯一性
        FOR i IN 1..100 LOOP
            IF NOT EXISTS (SELECT 1 FROM posts WHERE slug = NEW.slug) THEN
                EXIT;
            END IF;
            NEW.slug = NEW.slug || '-' || i;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 更新搜索向量的函数
CREATE OR REPLACE FUNCTION update_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' || 
        COALESCE(NEW.content, '') || ' ' || 
        COALESCE(ARRAY_TO_STRING(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## 📊 数据库统计

- **核心表**: 14 个
- **关联表**: 3 个
- **AI 相关表**: 2 个
- **分析表**: 1 个
- **触发器**: 4 个
- **索引**: 40+ 个

## 🚀 性能优化

1. **索引策略**: 为常用查询字段创建索引
2. **全文搜索**: 使用 GIN 索引支持全文搜索
3. **分区考虑**: 大表可以考虑按时间分区
4. **缓存策略**: 应用层缓存热点数据
5. **查询优化**: 避免复杂的 JOIN 查询

## 🔐 安全考虑

1. **RLS 策略**: 所有表都启用 Row Level Security
2. **数据加密**: 敏感数据加密存储
3. **访问控制**: 基于角色的访问控制
4. **审计日志**: 记录用户操作日志