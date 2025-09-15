# Blog-MCP 开发指南

## 🚀 快速开始

### 1. 环境准备
```bash
# 安装 Node.js 18+
node --version

# 安装 Supabase CLI
npm install -g supabase

# 克隆项目
git clone <repository-url>
cd Blog-MCP
```

### 2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装各模块依赖
npm run install:all
```

### 3. 配置 Supabase
```bash
# 登录 Supabase
supabase login

# 初始化项目
supabase init

# 启动本地开发环境
supabase dev
```

### 4. 启动开发服务器
```bash
# 启动博客前台
npm run dev:blog-web

# 启动管理后台
npm run dev:admin-web
```

## 📦 模块开发

### 1. 基础设施模块
```bash
# 开发 Supabase 客户端
cd src/infrastructure/supabase/client

# 开发认证服务
cd src/infrastructure/supabase/auth

# 开发数据库服务
cd src/infrastructure/supabase/database
```

### 2. 核心业务模块
```bash
# 开发用户管理
cd src/core/user

# 开发内容管理
cd src/core/content

# 开发分析功能
cd src/core/analytics
```

### 3. AI 增强模块
```bash
# 开发 MCP 协议
cd src/ai/mcp

# 开发 AI 服务
cd src/ai/services
```

### 4. 前端应用模块
```bash
# 开发博客前台
cd src/apps/blog-web

# 开发管理后台
cd src/apps/admin-web

# 开发共享组件
cd src/apps/shared-ui
```

### 5. Edge Functions
```bash
# 开发 MCP 服务器
cd src/functions/mcp-server

# 开发 AI 助手
cd src/functions/ai-blog-assistant
```

## 🛠️ 开发规范

### 1. 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 编写单元测试

### 2. 提交规范
```bash
# 提交格式
git commit -m "feat: 添加新功能"
git commit -m "fix: 修复问题"
git commit -m "docs: 更新文档"
git commit -m "style: 代码格式化"
git commit -m "refactor: 重构代码"
git commit -m "test: 添加测试"
```

### 3. 分支管理
```bash
# 主分支
main          # 生产环境
develop       # 开发环境

# 功能分支
feature/xxx   # 功能开发
fix/xxx       # 问题修复
hotfix/xxx    # 紧急修复
```

## 🚀 部署流程

### 1. 前端部署
```bash
# 构建项目
npm run build

# 部署到 Vercel
vercel --prod
```

### 2. Edge Functions 部署
```bash
# 部署所有函数
npm run functions:deploy

# 部署特定函数
supabase functions deploy mcp-server
```

### 3. 数据库迁移
```bash
# 推送迁移
npm run migrate:up

# 回滚迁移
npm run migrate:down
```

## 🧪 测试

### 1. 单元测试
```bash
# 运行所有测试
npm test

# 运行特定模块测试
npm run test:blog-web
```

### 2. E2E 测试
```bash
# 安装 Playwright
npm install -g @playwright/test

# 运行 E2E 测试
npx playwright test
```

## 📊 监控

### 1. 性能监控
- 使用 Lighthouse 进行性能测试
- 监控 Edge Functions 执行时间
- 跟踪数据库查询性能

### 2. 错误监控
- 集成 Sentry 错误监控
- 监控 API 调用失败率
- 跟踪 MCP 工具调用状态

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📞 支持

如有问题，请查看文档或提交 Issue。