# Blog-MCP 模块化项目结构

## 目录结构

```
Blog-MCP/
├── src/
│   ├── infrastructure/           # 基础设施模块
│   │   ├── supabase/
│   │   ├── config/
│   │   ├── utils/
│   │   └── types/
│   ├── core/                     # 核心业务模块
│   │   ├── user/
│   │   ├── content/
│   │   ├── analytics/
│   │   └── search/
│   ├── ai/                       # AI 增强模块
│   │   ├── mcp/
│   │   ├── services/
│   │   └── types/
│   ├── apps/                     # 前端应用模块
│   │   ├── blog-web/
│   │   ├── admin-web/
│   │   └── shared-ui/
│   ├── database/                 # 数据库模块
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── policies/
│   └── functions/                # Edge Functions
│       ├── mcp-server/
│       ├── ai-blog-assistant/
│       └── analytics/
├── docs/                         # 文档
├── tools/                        # 工具脚本
└── README.md                     # 项目说明
```

## 模块说明

### infrastructure (基础设施)
- Supabase 客户端封装
- 认证服务
- 数据库连接
- 文件存储
- 基础工具函数

### core (核心业务)
- 用户管理
- 内容管理（文章、分类、标签）
- 评论系统
- 数据分析
- 搜索功能

### ai (AI 增强)
- MCP 协议实现
- AI 工具定义
- 内容生成
- 智能推荐
- SEO 优化

### apps (前端应用)
- 博客前台
- 管理后台
- 共享UI组件

### database (数据库)
- 数据库迁移
- 种子数据
- RLS 策略

### functions (Edge Functions)
- MCP 服务器
- 内容处理
- 邮件通知
- 数据分析