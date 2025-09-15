# Blog-MCP Row Level Security (RLS) 配置指南

## 🔒 RLS 概述

Row Level Security (RLS) 是 PostgreSQL 的一种安全特性，允许在行级别控制数据访问权限。Blog-MCP 系统使用 RLS 来确保数据的安全性和隐私保护。

## 📋 RLS 策略概览

### 已配置的 RLS 策略

#### 1. 用户表 (profiles)
- ✅ **用户可以查看自己的资料**: `auth.uid() = id`
- ✅ **用户可以更新自己的资料**: `auth.uid() = id`
- ✅ **管理员可以查看所有用户资料**: `role = 'admin'`
- ✅ **管理员可以管理用户资料**: `role = 'admin'`
- ✅ **新用户可以创建自己的资料**: `auth.uid() = id`

#### 2. 文章表 (posts)
- ✅ **公开查看已发布文章**: `status = 'published' AND visibility = 'public'`
- ✅ **用户可以查看自己的文章**: `auth.uid() = author_id`
- ✅ **用户可以创建文章**: `auth.uid() = author_id`
- ✅ **用户可以更新自己的文章**: `auth.uid() = author_id`
- ✅ **用户可以删除自己的文章**: `auth.uid() = author_id`
- ✅ **管理员可以管理所有文章**: `role = 'admin'`

#### 3. 分类表 (categories)
- ✅ **所有人都可以查看分类**: `true`
- ✅ **管理员可以管理分类**: `role = 'admin'`

#### 4. 标签表 (tags)
- ✅ **所有人都可以查看标签**: `true`
- ✅ **管理员可以管理标签**: `role = 'admin'`

#### 5. 评论表 (comments)
- ✅ **公开查看已审核评论**: `status = 'approved'`
- ✅ **用户可以查看自己的评论**: `auth.uid() = author_id`
- ✅ **用户可以创建评论**: `auth.uid() = author_id OR guest_name IS NOT NULL`
- ✅ **游客可以创建评论**: `guest_name IS NOT NULL`
- ✅ **用户可以更新自己的评论**: `auth.uid() = author_id`
- ✅ **管理员可以管理所有评论**: `role = 'admin'`

#### 6. 媒体文件表 (media)
- ✅ **公开查看媒体文件**: `true`
- ✅ **用户可以查看自己的媒体文件**: `auth.uid() = author_id`
- ✅ **用户可以上传媒体文件**: `auth.uid() = author_id`
- ✅ **用户可以管理自己的媒体文件**: `auth.uid() = author_id`
- ✅ **管理员可以管理所有媒体文件**: `role = 'admin'`

#### 7. 用户活动表 (user_activities)
- ✅ **用户可以查看自己的活动记录**: `auth.uid() = user_id`
- ✅ **系统可以记录用户活动**: `auth.uid() = user_id`
- ✅ **管理员可以查看所有活动记录**: `role = 'admin'`

#### 8. 系统设置表 (settings)
- ✅ **所有人都可以查看系统设置**: `true`
- ✅ **管理员可以管理系统设置**: `role = 'admin'`

#### 9. 搜索索引表 (search_index)
- ✅ **所有人都可以查看搜索索引**: `true`
- ✅ **系统可以更新搜索索引**: `auth.role() = 'service_role'`

#### 10. AI 内容生成表 (ai_content_generations)
- ✅ **用户可以查看自己的 AI 生成记录**: `auth.uid() = user_id`
- ✅ **用户可以创建 AI 生成记录**: `auth.uid() = user_id`
- ✅ **管理员可以查看所有 AI 生成记录**: `role = 'admin'`

#### 11. AI 标签建议表 (ai_tag_suggestions)
- ✅ **用户可以查看 AI 标签建议**: `auth.uid() IN (SELECT author_id FROM posts WHERE id = post_id)`
- ✅ **系统可以创建 AI 标签建议**: `auth.role() = 'service_role'`

#### 12. 文章统计表 (post_analytics)
- ✅ **所有人都可以查看文章统计**: `true`
- ✅ **系统可以记录文章统计**: `auth.role() = 'service_role'`
- ✅ **管理员可以管理所有统计数据**: `role = 'admin'`

## 🛠️ RLS 管理工具

### 1. 查看 RLS 策略

```sql
-- 查看所有表的 RLS 策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 2. 检查 RLS 是否启用

```sql
-- 检查哪些表启用了 RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 3. 测试 RLS 策略

```sql
-- 以特定用户身份测试查询
SET ROLE authenticated;  -- 认证用户
-- 或者
SET ROLE anon;         -- 匿名用户

-- 执行测试查询
SELECT * FROM posts LIMIT 10;

-- 重置角色
RESET ROLE;
```

## 🔧 RLS 最佳实践

### 1. 策略设计原则

#### 最小权限原则
- 只授予用户完成其工作所需的最小权限
- 使用具体的、明确的条件，避免过于宽泛的策略

#### 性能考虑
- RLS 策略会影响查询性能，合理设计策略条件
- 在常用查询字段上创建索引以优化性能

#### 可维护性
- 使用清晰的策略命名，便于理解和维护
- 定期审查和清理不再需要的策略

### 2. 常见模式

#### 所有权检查
```sql
-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON table_name
    FOR SELECT USING (auth.uid() = user_id);
```

#### 角色基础访问
```sql
-- 基于角色的访问控制
CREATE POLICY "Admins can manage data" ON table_name
    FOR ALL USING (auth.role() = 'admin');
```

#### 状态基础访问
```sql
-- 基于数据状态的访问控制
CREATE POLICY "Public can view published items" ON table_name
    FOR SELECT USING (status = 'published');
```

#### 时间基础访问
```sql
-- 基于时间的访问控制
CREATE POLICY "Users can view recent data" ON table_name
    FOR SELECT USING (created_at > NOW() - INTERVAL '30 days');
```

### 3. 性能优化建议

#### 索引策略
```sql
-- 在 RLS 策略条件中使用的字段上创建索引
CREATE INDEX idx_table_user_id ON table_name(user_id);
CREATE INDEX idx_table_status ON table_name(status);
CREATE INDEX idx_table_created_at ON table_name(created_at);
```

#### 避免复杂策略
```sql
-- 避免：复杂的子查询策略
CREATE POLICY "Complex policy" ON posts
    FOR SELECT USING (auth.uid() IN (
        SELECT author_id FROM posts WHERE id = posts.id
    ));

-- 推荐：简单的直接条件
CREATE POLICY "Simple policy" ON posts
    FOR SELECT USING (auth.uid() = author_id);
```

#### 使用视图简化
```sql
-- 创建简化查询的视图
CREATE VIEW user_posts AS
SELECT * FROM posts WHERE author_id = auth.uid();

-- 在视图上应用 RLS
CREATE POLICY "Users can view user_posts" ON user_posts
    FOR SELECT USING (true);
```

## 🚨 安全注意事项

### 1. 常见安全风险

#### 策略绕过
- 确保 RLS 在所有表上都启用
- 避免使用过于宽松的策略条件
- 定期审计策略的有效性

#### 数据泄露
- 避免在错误消息中泄露敏感信息
- 使用参数化查询防止 SQL 注入
- 定期检查权限配置

#### 权限提升
- 严格控制管理员权限
- 使用最小权限原则
- 定期审查用户权限

### 2. 监控和审计

#### 启用审计日志
```sql
-- 启用 PostgreSQL 审计日志
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';

-- 重载配置
SELECT pg_reload_conf();
```

#### 监控可疑活动
```sql
-- 监控失败的登录尝试
SELECT 
    username,
    count(*) as failed_attempts
FROM pg_stat_activity 
WHERE state = 'idle'
GROUP BY username
HAVING count(*) > 10;
```

#### 定期安全审查
- 每月审查 RLS 策略
- 每季度检查用户权限
- 每年进行全面安全审计

## 📊 RLS 测试

### 1. 单元测试

```sql
-- 测试用户只能访问自己的数据
-- 以用户 A 身份登录
SELECT * FROM profiles WHERE id = 'user-a-id';  -- 应该返回数据
SELECT * FROM profiles WHERE id = 'user-b-id';  -- 不应该返回数据

-- 测试管理员权限
-- 以管理员身份登录
SELECT * FROM profiles;  -- 应该返回所有数据
```

### 2. 集成测试

```sql
-- 测试完整的工作流程
-- 1. 用户注册
-- 2. 用户创建文章
-- 3. 其他用户查看文章
-- 4. 用户更新自己的文章
-- 5. 尝试访问其他用户的数据（应该失败）
```

### 3. 性能测试

```sql
-- 测试 RLS 对查询性能的影响
EXPLAIN ANALYZE SELECT * FROM posts WHERE status = 'published';

-- 比较启用 RLS 前后的性能差异
-- 确保性能在可接受范围内
```

## 🔧 故障排除

### 1. 常见问题

#### RLS 策略不生效
- 检查表是否启用了 RLS
- 确认策略语法正确
- 验证用户身份和权限

#### 查询性能下降
- 检查 RLS 策略中的索引使用情况
- 优化策略条件
- 考虑使用物化视图

#### 权限配置错误
- 检查用户角色和权限
- 验证策略条件逻辑
- 确保没有冲突的策略

### 2. 调试技巧

#### 查看实际应用的策略
```sql
-- 查看查询时应用的策略
EXPLAIN (VERBOSE) SELECT * FROM posts WHERE id = 'some-id';
```

#### 测试特定用户的权限
```sql
-- 切换到特定用户
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-id';

-- 执行查询
SELECT * FROM posts;

-- 重置
RESET ROLE;
```

#### 检查策略冲突
```sql
-- 查看可能冲突的策略
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'your_table_name';
```

## 📝 更新和维护

### 1. 策略更新流程
1. 在开发环境测试新策略
2. 备份现有策略
3. 应用新策略
4. 验证功能正常
5. 部署到生产环境

### 2. 版本控制
- 将 RLS 策略纳入版本控制
- 使用迁移文件管理策略变更
- 记录策略变更的原因和影响

### 3. 文档更新
- 及时更新 RLS 策略文档
- 记录策略变更历史
- 提供策略使用指南

---

**注意**: RLS 是数据安全的重要组成部分，定期审查和更新策略以确保系统的安全性。