-- 启用 Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tag_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles 表 RLS 策略
-- 用户可以查看自己的资料
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- 用户可以更新自己的资料
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 管理员可以查看所有用户资料
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- 管理员可以管理用户资料
CREATE POLICY "Admins can manage profiles" ON profiles
    FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- 新注册用户可以创建自己的资料
CREATE POLICY "Users can create own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Posts 表 RLS 策略
-- 用户可以查看已发布的公开文章
CREATE POLICY "Public can view published posts" ON posts
    FOR SELECT USING (status = 'published' AND visibility = 'public');

-- 用户可以查看自己的所有文章
CREATE POLICY "Users can view own posts" ON posts
    FOR SELECT USING (auth.uid() = author_id);

-- 用户可以创建文章
CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 用户可以更新自己的文章
CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (auth.uid() = author_id);

-- 用户可以删除自己的文章
CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (auth.uid() = author_id);

-- 管理员可以管理所有文章
CREATE POLICY "Admins can manage all posts" ON posts
    FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Categories 表 RLS 策略
-- 所有人都可以查看分类
CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

-- 管理员可以管理分类
CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Tags 表 RLS 策略
-- 所有人都可以查看标签
CREATE POLICY "Public can view tags" ON tags
    FOR SELECT USING (true);

-- 管理员可以管理标签
CREATE POLICY "Admins can manage tags" ON tags
    FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Comments 表 RLS 策略
-- 用户可以查看已审核的评论
CREATE POLICY "Public can view approved comments" ON comments
    FOR SELECT USING (status = 'approved');

-- 用户可以查看自己的评论
CREATE POLICY "Users can view own comments" ON comments
    FOR SELECT USING (auth.uid() = author_id);

-- 用户可以创建评论
CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = author_id OR guest_name IS NOT NULL);

-- 游客可以创建评论
CREATE POLICY "Guests can create comments" ON comments
    FOR INSERT WITH CHECK (guest_name IS NOT NULL);

-- 用户可以更新自己的评论
CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

-- 管理员可以管理所有评论
CREATE POLICY "Admins can manage all comments" ON comments
    FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Media 表 RLS 策略
-- 用户可以查看公开的媒体文件
CREATE POLICY "Public can view media" ON media
    FOR SELECT USING (true);

-- 用户可以查看自己的媒体文件
CREATE POLICY "Users can view own media" ON media
    FOR SELECT USING (auth.uid() = author_id);

-- 用户可以上传媒体文件
CREATE POLICY "Users can upload media" ON media
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 用户可以管理自己的媒体文件
CREATE POLICY "Users can manage own media" ON media
    FOR ALL USING (auth.uid() = author_id);

-- 管理员可以管理所有媒体文件
CREATE POLICY "Admins can manage all media" ON media
    FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- User Activities 表 RLS 策略
-- 用户可以查看自己的活动记录
CREATE POLICY "Users can view own activities" ON user_activities
    FOR SELECT USING (auth.uid() = user_id);

-- 系统可以记录用户活动
CREATE POLICY "System can log user activities" ON user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 管理员可以查看所有活动记录
CREATE POLICY "Admins can view all activities" ON user_activities
    FOR SELECT USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Settings 表 RLS 策略
-- 所有人都可以查看系统设置
CREATE POLICY "Public can view settings" ON settings
    FOR SELECT USING (true);

-- 管理员可以管理系统设置
CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- Search Index 表 RLS 策略
-- 所有人都可以查看搜索索引
CREATE POLICY "Public can view search index" ON search_index
    FOR SELECT USING (true);

-- 系统可以更新搜索索引
CREATE POLICY "System can update search index" ON search_index
    FOR ALL USING (auth.role() = 'service_role');

-- AI Content Generations 表 RLS 策略
-- 用户可以查看自己的 AI 生成记录
CREATE POLICY "Users can view own AI generations" ON ai_content_generations
    FOR SELECT USING (auth.uid() = user_id);

-- 用户可以创建 AI 生成记录
CREATE POLICY "Users can create AI generations" ON ai_content_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 管理员可以查看所有 AI 生成记录
CREATE POLICY "Admins can view all AI generations" ON ai_content_generations
    FOR SELECT USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- AI Tag Suggestions 表 RLS 策略
-- 用户可以查看 AI 标签建议
CREATE POLICY "Users can view AI tag suggestions" ON ai_tag_suggestions
    FOR SELECT USING (auth.uid() IN (
        SELECT author_id FROM posts WHERE id = ai_tag_suggestions.post_id
    ));

-- 系统可以创建 AI 标签建议
CREATE POLICY "System can create AI tag suggestions" ON ai_tag_suggestions
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Post Analytics 表 RLS 策略
-- 所有人都可以查看文章统计（聚合数据）
CREATE POLICY "Public can view post analytics" ON post_analytics
    FOR SELECT USING (true);

-- 系统可以记录文章统计
CREATE POLICY "System can record post analytics" ON post_analytics
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 管理员可以管理所有统计数据
CREATE POLICY "Admins can manage all analytics" ON post_analytics
    FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- 创建触发器函数：自动创建用户资料
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, full_name, role, status, email_verified)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'user',
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN 'active' ELSE 'inactive' END,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 创建触发器：用户注册时自动创建资料
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 创建函数：更新文章计数
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 更新分类计数
        UPDATE categories SET post_count = post_count + 1
        WHERE id IN (SELECT category_id FROM post_categories WHERE post_id = NEW.id);
        
        -- 更新标签计数
        UPDATE tags SET post_count = post_count + 1
        WHERE id IN (SELECT tag_id FROM post_tags WHERE post_id = NEW.id);
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 更新分类计数
        UPDATE categories SET post_count = post_count - 1
        WHERE id IN (SELECT category_id FROM post_categories WHERE post_id = OLD.id);
        
        -- 更新标签计数
        UPDATE tags SET post_count = post_count - 1
        WHERE id IN (SELECT tag_id FROM post_tags WHERE post_id = OLD.id);
        
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 如果状态改变，更新分类和标签计数
        IF NEW.status != OLD.status THEN
            IF NEW.status = 'published' AND OLD.status != 'published' THEN
                -- 文章发布，增加计数
                UPDATE categories SET post_count = post_count + 1
                WHERE id IN (SELECT category_id FROM post_categories WHERE post_id = NEW.id);
                
                UPDATE tags SET post_count = post_count + 1
                WHERE id IN (SELECT tag_id FROM post_tags WHERE post_id = NEW.id);
            ELSIF OLD.status = 'published' AND NEW.status != 'published' THEN
                -- 文章取消发布，减少计数
                UPDATE categories SET post_count = post_count - 1
                WHERE id IN (SELECT category_id FROM post_categories WHERE post_id = NEW.id);
                
                UPDATE tags SET post_count = post_count - 1
                WHERE id IN (SELECT tag_id FROM post_tags WHERE post_id = NEW.id);
            END IF;
        END IF;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建触发器：文章状态改变时更新计数
CREATE TRIGGER update_post_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_counts();

-- 创建函数：更新搜索索引
CREATE OR REPLACE FUNCTION update_search_index_for_post()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 插入搜索索引
        INSERT INTO search_index (entity_type, entity_id, title, content, tags)
        SELECT 'post', p.id, p.title, p.excerpt, ARRAY_AGG(t.name)
        FROM posts p
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.id = NEW.id
        GROUP BY p.id;
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 更新搜索索引
        UPDATE search_index SET 
            title = NEW.title,
            content = NEW.excerpt,
            tags = COALESCE(ARRAY_AGG(t.name), ARRAY[]::VARCHAR[])
        FROM posts p
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.id = NEW.id AND search_index.entity_id = NEW.id AND search_index.entity_type = 'post';
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 删除搜索索引
        DELETE FROM search_index WHERE entity_id = OLD.id AND entity_type = 'post';
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建触发器：文章更新时同步搜索索引
CREATE TRIGGER update_search_index_trigger
    AFTER INSERT OR UPDATE OR DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_search_index_for_post();

-- 创建函数：清理过期数据
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- 清理30天前的失败AI生成记录
    DELETE FROM ai_content_generations 
    WHERE status = 'failed' AND created_at < NOW() - INTERVAL '30 days';
    
    -- 清理90天前的用户活动记录
    DELETE FROM user_activities 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- 清理1年前的文章统计数据
    DELETE FROM post_analytics 
    WHERE date < NOW() - INTERVAL '1 year';
END;
$$ language 'plpgsql';