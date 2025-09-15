# Supabase 配置和使用指南

## 🚀 快速开始

### 1. 环境准备

确保你已经安装了必要的工具：

```bash
# 安装 Node.js (v16+)
# 安装 Supabase CLI
npm install -g supabase

# 克隆项目
git clone <your-repo>
cd Blog-MCP

# 安装依赖
npm install
```

### 2. 配置 Supabase 项目

#### 创建 Supabase 项目

1. 访问 [Supabase 控制台](https://app.supabase.com/)
2. 点击 "New Project"
3. 填写项目信息：
   - **项目名称**: `blog-mcp`
   - **数据库密码**: 设置强密码
   - **地区**: 选择离你最近的地区

#### 获取项目凭据

项目创建完成后，在项目设置中获取：

- **项目 URL**: `https://your-project-id.supabase.co`
- **匿名密钥**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **服务角色密钥**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.development

# 编辑环境变量
nano .env.development
```

填入你的 Supabase 项目信息：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. 初始化项目

```bash
# 构建基础设施模块
cd src/infrastructure
npm install
npm run build

# 返回根目录
cd ../..

# 初始化 Supabase
npm run init:supabase

# 测试连接
npm run test:connection
```

### 4. 本地开发

```bash
# 启动 Supabase 本地开发环境
supabase start

# 运行项目
npm run dev
```

## 🔧 可用脚本

### 项目管理
- `npm run setup:dev` - 完整的开发环境设置
- `npm run test:connection` - 测试 Supabase 连接
- `npm run init:supabase` - 初始化 Supabase 项目

### Supabase 操作
- `npm run supabase:dev` - 启动 Supabase 本地开发环境
- `npm run supabase:deploy` - 部署到 Supabase
- `npm run migrate:up` - 运行数据库迁移
- `npm run migrate:down` - 回滚数据库迁移

### 开发工具
- `npm run lint` - 代码检查
- `npm run type-check` - 类型检查
- `npm run test` - 运行测试

## 📁 项目结构

```
Blog-MCP/
├── src/infrastructure/          # 基础设施模块
│   ├── supabase/               # Supabase 相关
│   ├── config/                 # 配置管理
│   ├── types/                  # 类型定义
│   └── utils/                  # 工具函数
├── scripts/                    # 脚本文件
│   ├── test-supabase-connection.js    # 连接测试
│   └── init-supabase.js              # 初始化脚本
├── docs/                       # 文档
├── supabase/                   # Supabase 配置
└── package.json               # 项目配置
```

## 🧪 测试连接

### 使用脚本测试

```bash
# 测试 Supabase 连接
npm run test:connection

# 测试基础设施模块
cd src/infrastructure
npm run test:connection
```

### 手动测试

```bash
# 使用 Node.js 测试
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
client.from('pg_catalog.pg_tables').select('*').limit(1).then(r => console.log('连接成功:', r));
"
```

## 🔐 安全配置

### 环境变量

确保在生产环境中：

1. 使用 `.env.production` 文件
2. 不要提交敏感信息到版本控制
3. 使用环境变量管理工具

### Row Level Security (RLS)

所有表都应该启用 RLS：

```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);
```

## 🚨 故障排除

### 常见问题

1. **连接失败**
   - 检查环境变量是否正确
   - 确认 Supabase 项目是否正在运行
   - 检查网络连接

2. **权限错误**
   - 确认 RLS 策略是否正确配置
   - 检查用户认证状态
   - 验证 API 密钥是否有效

3. **构建错误**
   - 确保所有依赖已安装
   - 检查 TypeScript 配置
   - 验证文件路径

### 调试命令

```bash
# 查看 Supabase 状态
supabase status

# 查看日志
supabase logs

# 重置本地数据库
supabase db reset

# 生成迁移文件
supabase migration new your_migration_name
```

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase CLI 文档](https://supabase.com/docs/guides/cli)
- [项目 TODO 列表](./docs/PROJECT-TODO.md)
- [开发指南](./docs/development-guide.md)

## 🤝 贡献

如果你遇到问题或有改进建议，请：

1. 查看现有 [Issues](../../issues)
2. 创建新的 Issue 描述问题
3. 提交 Pull Request

---

**注意**: 确保在开始开发前阅读 [PROJECT_RULES.md](../PROJECT_RULES.md) 中的开发规则。