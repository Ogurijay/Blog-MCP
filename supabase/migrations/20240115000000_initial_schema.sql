-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 创建触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- 创建用户表
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

-- 创建用户表索引
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- 创建用户表触发器
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建文章表
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

-- 创建文章表索引
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_featured ON posts(featured);
CREATE INDEX idx_posts_pinned ON posts(pinned);
CREATE INDEX idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- 创建全文搜索索引
CREATE INDEX idx_posts_search ON posts USING GIN(
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, ''))
);

-- 创建文章表触发器
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_post_slug
    BEFORE INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION generate_slug_from_title();

-- 创建分类表
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

-- 创建分类表索引
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_created_at ON categories(created_at);

-- 创建分类表触发器
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建标签表
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

-- 创建标签表索引
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_post_count ON tags(post_count DESC);
CREATE INDEX idx_tags_created_at ON tags(created_at);

-- 创建标签表触发器
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建文章分类关联表
CREATE TABLE post_categories (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- 创建文章分类关联表索引
CREATE INDEX idx_post_categories_post_id ON post_categories(post_id);
CREATE INDEX idx_post_categories_category_id ON post_categories(category_id);

-- 创建文章标签关联表
CREATE TABLE post_tags (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- 创建文章标签关联表索引
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

-- 创建评论表
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

-- 创建评论表索引
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 创建评论表触发器
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建媒体文件表
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

-- 创建媒体文件表索引
CREATE INDEX idx_media_author_id ON media(author_id);
CREATE INDEX idx_media_file_type ON media(file_type);
CREATE INDEX idx_media_folder_path ON media(folder_path);
CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_created_at ON media(created_at DESC);

-- 创建媒体文件表触发器
CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建用户活动表
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建用户活动表索引
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);

-- 创建系统设置表
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

-- 创建系统设置表索引
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_type ON settings(type);

-- 创建系统设置表触发器
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建搜索索引表
CREATE TABLE search_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT[],
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建搜索索引表索引
CREATE INDEX idx_search_index_entity_type ON search_index(entity_type);
CREATE INDEX idx_search_index_entity_id ON search_index(entity_id);
CREATE INDEX idx_search_index_search_vector ON search_index USING GIN(search_vector);

-- 创建搜索索引表触发器
CREATE TRIGGER update_search_vector
    BEFORE INSERT OR UPDATE ON search_index
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vector_trigger();

-- 创建 AI 内容生成表
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

-- 创建 AI 内容生成表索引
CREATE INDEX idx_ai_content_generations_user_id ON ai_content_generations(user_id);
CREATE INDEX idx_ai_content_generations_post_id ON ai_content_generations(post_id);
CREATE INDEX idx_ai_content_generations_status ON ai_content_generations(status);
CREATE INDEX idx_ai_content_generations_created_at ON ai_content_generations(created_at DESC);

-- 创建 AI 标签建议表
CREATE TABLE ai_tag_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    confidence_score DECIMAL(5, 4) DEFAULT 0,
    suggestion_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 AI 标签建议表索引
CREATE INDEX idx_ai_tag_suggestions_post_id ON ai_tag_suggestions(post_id);
CREATE INDEX idx_ai_tag_suggestions_tag_id ON ai_tag_suggestions(tag_id);
CREATE INDEX idx_ai_tag_suggestions_confidence ON ai_tag_suggestions(confidence_score DESC);

-- 创建文章统计表
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

-- 创建文章统计表索引
CREATE INDEX idx_post_analytics_post_id ON post_analytics(post_id);
CREATE INDEX idx_post_analytics_date ON post_analytics(date);
CREATE UNIQUE INDEX idx_post_analytics_unique ON post_analytics(post_id, date);

-- 创建视图
CREATE VIEW post_stats_view AS
SELECT 
    p.id,
    p.title,
    p.slug,
    p.author_id,
    pr.username as author_name,
    p.status,
    p.view_count,
    p.like_count,
    p.comment_count,
    p.published_at,
    COALESCE(ARRAY_AGG(DISTINCT c.name), ARRAY[]::VARCHAR[]) as category_names,
    COALESCE(ARRAY_AGG(DISTINCT t.name), ARRAY[]::VARCHAR[]) as tag_names
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
LEFT JOIN post_categories pc ON p.id = pc.post_id
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id, pr.username;

CREATE VIEW user_stats_view AS
SELECT 
    pr.id,
    pr.username,
    pr.email,
    COUNT(p.id) as post_count,
    COUNT(c.id) as comment_count,
    pr.last_login,
    pr.created_at
FROM profiles pr
LEFT JOIN posts p ON pr.id = p.author_id
LEFT JOIN comments c ON pr.id = c.author_id
GROUP BY pr.id;

-- 插入默认设置
INSERT INTO settings (key, value, description, type, is_system) VALUES
('site_title', 'Blog-MCP', '网站标题', 'string', true),
('site_description', '智能博客系统', '网站描述', 'string', true),
('site_url', 'http://localhost:3000', '网站URL', 'string', true),
('admin_email', 'admin@example.com', '管理员邮箱', 'string', true),
('posts_per_page', 10, '每页文章数', 'number', true),
('enable_comments', true, '启用评论', 'boolean', true),
('enable_registration', true, '启用用户注册', 'boolean', true),
('require_email_verification', false, '需要邮箱验证', 'boolean', true),
('default_post_status', 'draft', '默认文章状态', 'string', true),
('seo_meta_title', 'Blog-MCP - 智能博客系统', 'SEO标题', 'string', true),
('seo_meta_description', '基于 AI 的智能博客系统', 'SEO描述', 'string', true),
('social_share_image', '/images/share.jpg', '社交分享图片', 'string', true),
('analytics_enabled', false, '启用分析', 'boolean', false),
('ai_enabled', false, '启用 AI 功能', 'boolean', false),
('ai_provider', 'openai', 'AI 提供商', 'string', false),
('ai_model', 'gpt-3.5-turbo', 'AI 模型', 'string', false),
('max_file_size', 52428800, '最大文件大小(字节)', 'number', true),
('allowed_file_types', '["image/jpeg", "image/png", "image/gif", "image/webp"]', '允许的文件类型', 'array', true);

-- 插入默认分类
INSERT INTO categories (name, slug, description, color, sort_order) VALUES
('技术', 'tech', '技术相关文章', '#3B82F6', 1),
('生活', 'life', '生活感悟', '#10B981', 2),
('随笔', 'essay', '随笔杂谈', '#F59E0B', 3),
('教程', 'tutorial', '教程指南', '#EF4444', 4),
('资源', 'resources', '资源分享', '#8B5CF6', 5);

-- 插入默认标签
INSERT INTO tags (name, slug, description, color) VALUES
('JavaScript', 'javascript', 'JavaScript 相关', '#F7DF1E'),
('TypeScript', 'typescript', 'TypeScript 相关', '#3178C6'),
('Vue.js', 'vuejs', 'Vue.js 框架', '#4FC08D'),
('React', 'react', 'React 框架', '#61DAFB'),
('Node.js', 'nodejs', 'Node.js 后端', '#339933'),
('Python', 'python', 'Python 编程', '#3776AB'),
('AI', 'ai', '人工智能', '#FF6B6B'),
('Web开发', 'webdev', 'Web 开发', '#4A90E2'),
('数据库', 'database', '数据库相关', '#FF8C42'),
('工具', 'tools', '开发工具', '#9B59B6');