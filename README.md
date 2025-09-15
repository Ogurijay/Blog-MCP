# Blog-MCP - 智能化博客系统

基于 Vue 3 + Supabase + MCP 的现代化博客系统，无需传统后端服务器，通过 Edge Functions 和 MCP 协议实现 AI 增强功能。

## 🚀 架构优势

- **真正的无服务器架构** - Edge Functions 替代传统后端
- **AI 增强功能** - MCP 协议集成，支持智能内容生成
- **自动扩展** - Supabase 自动处理扩展和负载均衡
- **快速开发** - 专注前端和 AI 功能，无需后端维护
- **成本优化** - 按使用付费，无固定服务器成本

## 🛠 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的前端构建工具
- **Pinia** - Vue 状态管理库
- **Element Plus** - Vue 3 UI 组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Vue I18n** - Vue 国际化插件

### 后端即服务
- **Supabase** - 后端即服务（PostgreSQL + 认证 + 存储）
- **Edge Functions** - 无服务器函数，替代传统后端
- **Row Level Security** - 数据安全策略
- **Realtime Subscriptions** - 实时数据同步

### AI 集成
- **MCP (Model Context Protocol)** - AI 功能集成协议
- **Edge Functions MCP Server** - AI 处理服务
- **智能内容生成** - 文章、摘要、标签自动生成
- **AI 辅助优化** - SEO 优化、内容建议

## 📁 项目结构

```
Blog-MCP/
├── src/
│   ├── frontend/              # 前端项目
│   │   ├── blog-web/         # 博客前台
│   │   │   ├── src/
│   │   │   │   ├── components/     # 组件
│   │   │   │   ├── views/         # 页面
│   │   │   │   ├── stores/        # Pinia状态管理
│   │   │   │   ├── composables/   # 组合式函数
│   │   │   │   ├── utils/         # 工具函数
│   │   │   │   ├── types/         # TypeScript类型
│   │   │   │   ├── locales/       # 国际化
│   │   │   │   └── services/      # Supabase服务
│   │   │   └── package.json
│   │   ├── admin-web/        # 管理后台
│   │   │   └── (类似结构)
│   │   └── shared-ui/        # 共享UI组件
│   └── supabase/              # Supabase配置
│       ├── functions/        # Edge Functions
│       │   ├── mcp-server/   # MCP 服务器
│       │   ├── ai-blog-assistant/  # AI 博客助手
│       │   ├── content-processing/  # 内容处理
│       │   └── analytics/    # 数据分析
│       ├── migrations/       # 数据库迁移
│       ├── storage/          # 文件存储
│       └── config/           # RLS策略
├── docs/                     # 项目文档
├── tools/                    # 工具脚本
└── README.md                 # 项目说明
```

## 🎯 核心功能

### 博客功能
- 📝 文章管理（创建、编辑、发布、删除）
- 🏷️ 分类和标签系统
- 💬 评论系统
- 👥 用户认证和权限管理
- 🌐 多语言支持（中文、英文、日文）
- 🔍 全文搜索
- 📱 响应式设计

### AI 增强功能
- 🤖 **智能内容生成** - MCP 集成，自动生成文章内容
- 🏷️ **智能标签生成** - 基于内容自动生成相关标签
- 📝 **SEO 优化** - AI 辅助的 SEO 建议
- 🎯 **个性化推荐** - 基于用户行为的内容推荐
- 📊 **智能分析** - 自动化的数据分析和报告
- 🌍 **多语言翻译** - AI 驱动的多语言内容翻译

### 高级功能
- 📊 **实时数据统计** - 用户行为分析
- 🔄 **实时数据同步** - WebSocket 支持
- 📷 **图片智能处理** - 自动压缩、裁剪、水印
- 🎨 **SEO 优化** - 自动生成元数据
- 📈 **访客统计** - 智能访问分析

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Supabase 账户
- Git

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/Blog-MCP.git
   cd Blog-MCP
   ```

2. **设置 Supabase**
   - 创建 Supabase 项目
   - 配置数据库表和 RLS 策略
   - 设置 Edge Functions

3. **安装前端依赖**
   ```bash
   cd src/frontend/blog-web
   npm install
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **部署 Edge Functions**
   ```bash
   supabase functions deploy
   ```

## 🤖 MCP 集成

### MCP 功能
- **内容生成** - 使用 AI 生成文章内容
- **智能分类** - 自动分类文章
- **标签生成** - 基于内容生成标签
- **SEO 优化** - 智能的 SEO 建议
- **内容摘要** - 自动生成文章摘要

### 使用示例
```typescript
// 前端调用 MCP 功能
const { data } = await supabase.functions
  .invoke('ai-blog-assistant', {
    body: {
      tool_name: 'generate-tags',
      parameters: { content: '文章内容' }
    }
  })
```

## 🎨 开发指南

### 代码规范
- 前端使用 Vue 3 Composition API + TypeScript
- 严格的 TypeScript 类型检查
- 集成 Element Plus 组件库
- 使用 Pinia 进行状态管理
- 支持多语言国际化

### 数据库设计
- 使用 PostgreSQL（通过 Supabase）
- UUID 主键设计
- Row Level Security (RLS)
- 多语言支持设计
- 实时数据同步

### MCP 开发
- Edge Functions 实现 MCP 服务器
- TypeScript 开发 AI 功能
- 安全的 API 密钥管理
- 错误处理和日志记录

### 测试策略
- 前端单元测试 (Vitest)
- 组件测试
- E2E 测试 (Playwright)
- Edge Functions 测试

## 📚 部署指南

### 前端部署
1. 推送代码到 GitHub
2. 配置 Vercel 项目
3. 设置环境变量
4. 自动部署

### Supabase 配置
1. 创建 Supabase 项目
2. 设置数据库迁移
3. 配置 RLS 策略
4. 部署 Edge Functions

### MCP 服务部署
1. 配置 Edge Functions
2. 设置环境变量
3. 测试 MCP 功能
4. 监控和日志

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🆘 支持

如有问题，请提交 Issue 或联系开发团队。

---

© 2024 Blog-MCP. All rights reserved.