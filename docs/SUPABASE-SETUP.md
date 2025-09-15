# Supabase 项目设置指南

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase 控制台](https://app.supabase.com/)
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - **项目名称**: `blog-mcp`
   - **数据库密码**: 设置强密码
   - **地区**: 选择离你最近的地区
   - **组织**: 选择或创建组织

### 2. 获取项目凭据

项目创建完成后，从项目设置中获取以下信息：

1. **项目 URL**: `https://your-project-id.supabase.co`
2. **匿名密钥**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **服务角色密钥**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. 配置环境变量

将获取的凭据填入 `.env.production` 文件：

```bash
# 复制模板文件
cp .env.example .env.local

# 编辑环境变量
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. 初始化本地开发环境

```bash
# 安装 Supabase CLI (如果尚未安装)
npm install -g supabase

# 初始化项目
supabase init

# 启动本地开发环境
supabase start
```

### 5. 验证连接

运行以下命令验证连接：

```bash
# 测试数据库连接
npm run test:connection

# 或者使用 Node.js 直接测试
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
client.from('profiles').select('*').limit(1).then(r => console.log('连接成功:', r));
"
```

## 🗄️ 数据库配置

### 本地开发配置

文件: `supabase/config.toml`

```toml
[db]
port = 54322
major_version = 15

[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
```

### 生产环境配置

确保在生产环境中：
- 启用 Row Level Security (RLS)
- 配置正确的重定向 URL
- 设置强密码策略
- 启用双因素认证

## 📁 存储桶设置

### 创建存储桶

1. 在 Supabase 控制台导航到 "Storage"
2. 创建以下存储桶：
   - `blog-images`: 博客文章图片
   - `user-avatars`: 用户头像
   - `attachments`: 附件文件

### 配置存储策略

为每个存储桶设置适当的 RLS 策略：
- 公共读取权限
- 认证用户写入权限
- 文件大小限制

## 🔐 安全配置

### Row Level Security (RLS)

1. 为所有表启用 RLS
2. 创建适当的访问策略
3. 测试策略是否按预期工作

### 认证配置

1. 配置认证提供程序（邮箱、GitHub、Google等）
2. 设置重定向 URL
3. 配置邮件模板

## 🧪 测试连接

创建测试脚本验证所有功能：

```typescript
// scripts/test-connection.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testConnection() {
  try {
    // 测试数据库连接
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('数据库连接失败:', error);
      return false;
    }
    
    console.log('✅ 数据库连接成功');
    
    // 测试存储连接
    const { data: storageData, error: storageError } = await supabase.storage
      .from('blog-images')
      .list();
    
    if (storageError) {
      console.error('存储连接失败:', storageError);
      return false;
    }
    
    console.log('✅ 存储连接成功');
    
    // 测试认证服务
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('认证服务失败:', authError);
      return false;
    }
    
    console.log('✅ 认证服务正常');
    
    return true;
  } catch (error) {
    console.error('连接测试失败:', error);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 所有连接测试通过！');
  } else {
    console.log('❌ 部分测试失败，请检查配置');
    process.exit(1);
  }
});
```

## 📝 常见问题

### 连接问题

1. **CORS 错误**: 确保在 Supabase 控制台中配置了正确的 CORS 设置
2. **RLS 策略错误**: 检查 Row Level Security 策略是否过于严格
3. **环境变量问题**: 确保所有必需的环境变量都已正确设置

### 性能优化

1. 启用数据库连接池
2. 配置适当的索引
3. 使用 CDN 静态资源

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase CLI 文档](https://supabase.com/docs/guides/cli)
- [RLS 策略指南](https://supabase.com/docs/guides/auth/row-level-security)