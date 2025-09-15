-- 插入管理员用户
-- 注意：这会在用户注册时自动创建，这里只是创建示例用户

-- 创建示例分类（如果不存在）
INSERT INTO categories (name, slug, description, color, icon, sort_order) VALUES
('前端开发', 'frontend', '前端技术相关文章', '#3B82F6', 'code', 6),
('后端开发', 'backend', '后端技术相关文章', '#10B981', 'server', 7),
('移动开发', 'mobile', '移动应用开发', '#F59E0B', 'smartphone', 8),
('DevOps', 'devops', 'DevOps 和运维', '#EF4444', 'settings', 9),
('数据库', 'database', '数据库技术', '#8B5CF6', 'database', 10),
('机器学习', 'ml', '机器学习和AI', '#EC4899', 'brain', 11)
ON CONFLICT (slug) DO NOTHING;

-- 创建更多示例标签
INSERT INTO tags (name, slug, description, color) VALUES
('Supabase', 'supabase', 'Supabase 数据库', '#3ECF8E'),
('PostgreSQL', 'postgresql', 'PostgreSQL 数据库', '#336791'),
('Docker', 'docker', 'Docker 容器化', '#2496ED'),
('Kubernetes', 'kubernetes', 'K8s 容器编排', '#326CE5'),
('GraphQL', 'graphql', 'GraphQL 查询语言', '#E10098'),
('REST API', 'rest-api', 'RESTful API 设计', '#009688'),
('Microservices', 'microservices', '微服务架构', '#FF6B35'),
('Cloud Computing', 'cloud', '云计算技术', '#4285F4'),
('Cybersecurity', 'security', '网络安全', '#FF4444'),
('Blockchain', 'blockchain', '区块链技术', '#121D33'),
('IoT', 'iot', '物联网', '#00ACC1'),
('AR/VR', 'ar-vr', '增强现实/虚拟现实', '#9C27B0')
ON CONFLICT (slug) DO NOTHING;

-- 创建示例文章（需要用户存在后才能创建）
-- 注意：这些将在用户注册后通过应用创建

-- 创建示例设置
INSERT INTO settings (key, value, description, type, is_system) VALUES
('theme', 'light', '网站主题', 'string', false),
('language', 'zh-CN', '网站语言', 'string', false),
('timezone', 'Asia/Shanghai', '时区设置', 'string', false),
('date_format', 'YYYY-MM-DD', '日期格式', 'string', false),
('time_format', 'HH:mm:ss', '时间格式', 'string', false),
('comments_require_approval', true, '评论需要审核', 'boolean', true),
('allow_guest_comments', true, '允许游客评论', 'boolean', true),
('enable_rss', true, '启用 RSS 订阅', 'boolean', true),
('rss_items_limit', 20, 'RSS 条目限制', 'number', true),
('enable_sitemap', true, '启用站点地图', 'boolean', true),
('enable_search', true, '启用搜索功能', 'boolean', true),
('search_min_length', 3, '搜索最小长度', 'number', true),
('enable_social_login', true, '启用社交登录', 'boolean', false),
('social_providers', '["google", "github", "twitter"]', '社交登录提供商', 'array', false),
('enable_newsletter', false, '启用邮件订阅', 'boolean', false),
('newsletter_provider', 'mailchimp', '邮件订阅服务商', 'string', false),
('enable_captcha', false, '启用验证码', 'boolean', false),
('captcha_provider', 'recaptcha', '验证码提供商', 'string', false),
('enable_cdn', false, '启用 CDN', 'boolean', false),
('cdn_provider', 'cloudflare', 'CDN 提供商', 'string', false),
('cache_enabled', true, '启用缓存', 'boolean', true),
('cache_ttl', 3600, '缓存过期时间(秒)', 'number', true),
('backup_enabled', true, '启用自动备份', 'boolean', true),
('backup_frequency', 'daily', '备份频率', 'string', true),
('backup_retention', 30, '备份保留天数', 'number', true),
('maintenance_mode', false, '维护模式', 'boolean', true),
('maintenance_message', '网站正在维护中，请稍后再试。', '维护模式消息', 'string', true),
('max_upload_size', 10485760, '最大上传大小(字节)', 'number', true),
('allowed_image_types', '["image/jpeg", "image/png", "image/gif", "image/webp"]', '允许的图片类型', 'array', true),
('allowed_document_types', '["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]', '允许的文档类型', 'array', true),
('enable_watermark', false, '启用图片水印', 'boolean', false),
('watermark_text', 'Blog-MCP', '水印文字', 'string', false),
('enable_auto_save', true, '启用自动保存', 'boolean', true),
('auto_save_interval', 30, '自动保存间隔(秒)', 'number', true),
('enable_revision_history', true, '启用版本历史', 'boolean', true),
('max_revisions', 50, '最大版本数', 'number', true),
('enable_related_posts', true, '启用相关文章推荐', 'boolean', true),
('related_posts_count', 5, '相关文章数量', 'number', true),
('enable_reading_time', true, '启用阅读时间', 'boolean', true),
('reading_speed', 200, '阅读速度(字/分钟)', 'number', true),
('enable_share_buttons', true, '启用分享按钮', 'boolean', true),
('share_platforms', '["twitter", "facebook", "linkedin", "weibo", "wechat"]', '分享平台', 'array', false),
('enable_print', true, '启用打印功能', 'boolean', true),
('enable_dark_mode', true, '启用深色模式', 'boolean', true),
('default_font_size', 16, '默认字体大小', 'number', true),
('enable_syntax_highlighting', true, '启用代码高亮', 'boolean', true),
('syntax_theme', 'github', '代码高亮主题', 'string', false),
('enable_mermaid', true, '启用 Mermaid 图表', 'boolean', true),
('enable_mathjax', false, '启用 MathJax 数学公式', 'boolean', false),
('enable_toc', true, '启用目录', 'boolean', true),
('toc_depth', 3, '目录深度', 'number', true),
('enable_breadcrumbs', true, '启用面包屑导航', 'boolean', true),
('enable_pagination', true, '启用分页', 'boolean', true),
('posts_per_page_archive', 12, '归档页面每页文章数', 'number', true),
('posts_per_page_search', 10, '搜索结果每页文章数', 'number', true),
('posts_per_page_category', 12, '分类页面每页文章数', 'number', true),
('posts_per_page_tag', 12, '标签页面每页文章数', 'number', true),
('posts_per_page_author', 12, '作者页面每页文章数', 'number', true),
('enable_seo', true, '启用 SEO 优化', 'boolean', true),
('enable_og_tags', true, '启用 Open Graph 标签', 'boolean', true),
('enable_twitter_cards', true, '启用 Twitter 卡片', 'boolean', true),
('enable_structured_data', true, '启用结构化数据', 'boolean', true),
('enable_canonical_urls', true, '启用规范 URL', 'boolean', true),
('enable_amp', false, '启用 AMP', 'boolean', false),
('enable_pwa', false, '启用 PWA', 'boolean', false),
('enable_web_push', false, '启用 Web 推送', 'boolean', false),
('enable_lazy_loading', true, '启用懒加载', 'boolean', true),
('enable_image_optimization', true, '启用图片优化', 'boolean', true),
('image_quality', 85, '图片质量', 'number', true),
('enable_webp', true, '启用 WebP 格式', 'boolean', true),
('enable_avif', false, '启用 AVIF 格式', 'boolean', false),
('enable_critical_css', false, '启用关键 CSS', 'boolean', false),
('enable_js_bundling', true, '启用 JS 打包', 'boolean', true),
('enable_css_bundling', true, '启用 CSS 打包', 'boolean', true),
('enable_minification', true, '启用压缩', 'boolean', true),
('enable_gzip', true, '启用 Gzip 压缩', 'boolean', true),
('enable_brotli', false, '启用 Brotli 压缩', 'boolean', false)
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    is_system = EXCLUDED.is_system;

-- 创建存储桶策略（如果还没有创建）
-- 这些将在 Supabase 控制台中手动创建，或者通过初始化脚本创建