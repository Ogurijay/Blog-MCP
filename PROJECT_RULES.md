# Blog-MCP 项目开发规则文档

## 📋 项目概述

**项目名称**：Blog-MCP (智能博客系统)  
**技术栈**：Vue 3 + Supabase + MCP + Edge Functions  
**架构**：无服务器架构 + AI 增强功能 + 云原生

## 🎯 开发目标

构建一个现代化、国际化、支持AI辅助的博客系统，具备高性能、高可用性和良好的用户体验，通过 MCP 协议实现智能内容生成和处理功能。

## 📁 项目结构规则

### 1. 目录结构约定

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
├── tests/                     # 测试项目
├── docs/                      # 项目文档
└── tools/                     # 工具脚本
```

### 2. 文件命名规范

#### 前端文件命名
- **组件文件**：PascalCase.vue (如：PostCard.vue)
- **页面文件**：PascalCase.vue (如：HomePage.vue)
- **工具文件**：camelCase.ts (如：dateUtils.ts)
- **类型文件**：camelCase.ts (如：postTypes.ts)
- **配置文件**：camelCase.config.ts (如：vite.config.ts)

#### Edge Functions 文件命名
- **函数文件**：kebab-case/index.ts (如：ai-blog-assistant/index.ts)
- **工具文件**：camelCase.ts (如：mcpTools.ts)
- **类型文件**：camelCase.ts (如：mcpTypes.ts)
- **配置文件**：camelCase.json (如：supabase/config.json)

#### 通用规则
- 使用有意义的名称，避免缩写
- 文件名应反映其内容和用途
- 保持命名一致性

## 🛠 技术栈规范

### 1. 前端技术规范

#### Vue 3 + TypeScript
- 使用 Composition API
- 严格的 TypeScript 类型检查
- 组件使用 `<script setup>` 语法
- 避免使用 Options API

#### 状态管理
- 使用 Pinia 进行状态管理
- 避免过度使用全局状态
- 状态变更必须是同步的

#### 样式规范
- 使用 SCSS 预处理器
- 采用 BEM 命名约定
- 优先使用 CSS 变量
- 响应式设计优先

### 2. Edge Functions 技术规范

#### TypeScript + Deno
- 使用 TypeScript 严格模式
- 异步编程优先
- 错误处理和日志记录
- 环境变量管理

#### MCP 服务器实现
- 实现标准的 MCP 协议
- 工具定义和调用
- 安全的 API 密钥管理
- 请求验证和清理

#### 数据访问
- 使用 Supabase 客户端
- 直接数据库操作
- RLS 策略遵循
- 性能优化

### 3. 数据库规范

#### PostgreSQL + Supabase
- 使用 UUID 主键
- 启用 Row Level Security
- 规范化表设计
- 适当的索引策略
- 实时数据同步

## 📝 代码规范

### 1. TypeScript/JavaScript 规范

#### 基本规则
```typescript
// ✅ 正确
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User | null> => {
  // 实现
}

// ❌ 错误
interface user {
  id;
  name;
  email;
}

const getUser = function(id) {
  // 实现
}
```

#### 组件规范
```vue
<template>
  <!-- 使用语义化标签 -->
  <article class="post-card">
    <h2 class="post-card__title">{{ post.title }}</h2>
    <p class="post-card__excerpt">{{ post.excerpt }}</p>
  </article>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface Post {
  id: string;
  title: string;
  excerpt: string;
}

const props = defineProps<{
  post: Post;
}>()
</script>

<style lang="scss" scoped>
.post-card {
  &__title {
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  &__excerpt {
    color: var(--el-text-color-secondary);
  }
}
</style>
```

### 2. Edge Functions 规范

#### 基本规则
```typescript
// ✅ 正确
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface MCPRequest {
  method: string
  params: Record<string, any>
}

interface MCPResponse {
  result: any
  error?: string
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { method, params }: MCPRequest = await req.json()
    
    switch (method) {
      case 'tools/call':
        return await handleToolCall(params)
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown method' }),
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}

// ❌ 错误
async function handle(req) {
  const data = await req.json()
  // 没有错误处理
  // 没有类型检查
  return new Response('OK')
}
```

#### MCP 工具定义
```typescript
// ✅ 正确
interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required: string[]
  }
}

const generateTagsTool: MCPTool = {
  name: 'generate-tags',
  description: 'Generate tags for blog content',
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'Blog post content'
      }
    },
    required: ['content']
  }
}

// ❌ 错误
const generateTagsTool = {
  name: 'generateTags',
  // 缺少描述和输入模式定义
}
```

### 3. SQL 规范

#### 命名规范
- 表名：复数形式，小写下划线 (如：`posts`, `post_translations`)
- 字段名：小写下划线 (如：`created_at`, `is_active`)
- 主键：`id` (UUID类型)
- 外键：`表名_id` (如：`post_id`)

#### 查询规范
```sql
-- ✅ 正确
SELECT 
    p.id,
    p.title,
    p.created_at,
    u.username as author_name
FROM posts p
JOIN users u ON p.author_id = u.id
WHERE p.status = 'published'
ORDER BY p.created_at DESC
LIMIT 10;

-- ❌ 错误
SELECT * FROM posts WHERE status='published' ORDER BY created_at LIMIT 10;
```

## 🔒 安全规范

### 1. 前端安全
- 所有用户输入必须验证
- 避免 XSS 攻击
- 使用 CSP 头
- 敏感信息不要存储在 localStorage
- 使用 Supabase Auth 进行身份验证

### 2. Edge Functions 安全
- 使用 HTTPS
- 输入验证和清理
- 环境变量管理
- API 密钥安全存储
- 请求频率限制
- 错误信息不暴露敏感数据

### 3. 数据库安全
- 使用 Row Level Security (RLS)
- 定期备份
- 最小权限原则
- 敏感数据加密
- 实时监控和审计日志

### 4. MCP 安全
- 工具调用权限控制
- 敏感操作需要二次验证
- API 密钥轮换
- 审计日志记录
- 内容安全策略

## 🧪 测试规范

### 1. 前端测试
- 组件单元测试 (Vitest)
- 集成测试
- E2E 测试 (Playwright)
- Pinia 状态测试
- 服务层测试

### 2. Edge Functions 测试
- 单元测试 (Deno.test)
- 集成测试
- MCP 协议测试
- API 测试
- 错误处理测试

### 3. 数据库测试
- 迁移测试
- RLS 策略测试
- 性能测试
- 数据完整性测试

### 4. 测试覆盖率
- 前端测试覆盖率 > 80%
- Edge Functions 测试覆盖率 > 80%
- 关键业务逻辑 100% 覆盖
- MCP 工具 100% 测试

## 📚 文档规范

### 1. 代码注释
- 复杂业务逻辑必须有注释
- 公共 API 必须有文档注释
- TODO 和 FIXME 必须有说明

### 2. 项目文档
- README.md 必须包含项目说明
- MCP 工具文档
- API 文档 (Edge Functions)
- 部署文档

## 🚀 构建和部署

### 1. 构建流程
- 前端：`npm run build`
- Edge Functions：`supabase functions build`
- 测试：`npm test` 和 `supabase functions test`

### 2. 部署流程
- 前端部署到 Vercel
- Edge Functions 部署到 Supabase
- 数据库迁移自动化
- 环境隔离 (dev/staging/prod)
- 自动化测试和部署

## 🎨 UI/UX 规范

### 1. 设计原则
- 响应式设计
- 一致的设计语言
- 无障碍访问
- 性能优化

### 2. 组件规范
- 可复用性优先
- 单一职责原则
- 清晰的 API
- 文档完整

## 🔧 开发流程

### 1. Git 工作流
- 主分支：`main` (生产环境)
- 开发分支：`develop` (开发环境)
- 功能分支：`feature/xxx`
- 修复分支：`fix/xxx`

### 2. 代码审查
- 所有 PR 必须经过代码审查
- 自动化测试必须通过
- 代码规范检查必须通过

### 3. 发布流程
- 语义化版本控制
- 变更日志
- 向后兼容性

## 📊 性能规范

### 1. 前端性能
- 首屏加载时间 < 2s
- Lighthouse 评分 > 90
- 代码分割和懒加载
- 图片优化

### 2. 后端性能
- API 响应时间 < 200ms
- 数据库查询优化
- 缓存策略
- 并发处理

## 🌐 国际化规范

### 1. 多语言支持
- 默认语言：中文 (zh-CN)
- 支持语言：中文、英文、日文
- 语言文件：`src/locales/{locale}.json`
- 动态语言切换

### 2. 内容管理
- 数据库多语言设计
- SEO 多语言支持
- 图片和资源多语言

## 🤖 AI 集成规范

### 1. MCP 集成架构
- **Edge Functions 作为 MCP 服务器**：处理 AI 工具调用
- **前端作为 MCP 客户端**：通过 Supabase Functions 调用 AI 功能
- **工具定义标准化**：统一的 MCP 工具接口
- **错误处理机制**：完善的错误处理和重试机制

### 2. MCP 工具开发规范
- **工具命名**：kebab-case 格式（如：generate-tags, optimize-seo）
- **输入验证**：严格的输入参数验证
- **输出格式**：统一的 JSON 响应格式
- **日志记录**：完整的调用日志记录
- **性能监控**：工具执行时间监控

### 3. AI 功能实现
- **内容生成**：文章、摘要、标签生成
- **智能分类**：基于内容的自动分类
- **SEO 优化**：关键词分析、元数据生成
- **多语言支持**：AI 驱动的翻译功能
- **个性化推荐**：基于用户行为的内容推荐

### 4. 数据分析
- **用户行为分析**：访问模式、兴趣分析
- **内容效果分析**：阅读量、点赞、评论分析
- **性能监控**：系统性能、API 调用监控
- **AI 效果分析**：AI 生成内容的效果评估

## 📱 移动端适配

### 1. 响应式设计
- 移动优先
- 断点设计
- 触摸优化
- 性能优化

### 2. PWA 支持
- Service Worker
- 离线缓存
- 推送通知
- 应用安装

## 🔄 兼容性

### 1. 浏览器支持
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 2. 设备支持
- 桌面设备
- 平板设备
- 移动设备

## 📋 检查清单

### 开发前检查
- [ ] 了解需求和设计
- [ ] 环境配置完成
- [ ] 依赖项安装完成
- [ ] 代码规范了解

### 代码提交检查
- [ ] 代码格式正确
- [ ] 测试通过
- [ ] 文档更新
- [ ] 性能考虑

### 发布前检查
- [ ] 功能测试完成
- [ ] 安全测试通过
- [ ] 性能测试通过
- [ ] 文档完整

## 🚨 错误处理

### 1. 错误分类
- 用户错误：清晰提示
- 系统错误：日志记录
- 网络错误：重试机制
- 业务错误：友好提示

### 2. 日志规范
- 结构化日志
- 错误级别分类
- 敏感信息过滤
- 性能监控

## 📈 监控和分析

### 1. 性能监控
- 前端性能指标
- Edge Functions 响应时间
- 数据库查询性能
- 用户行为分析

### 2. 错误监控
- 前端错误收集
- Edge Functions 异常监控
- API 错误追踪
- 用户反馈收集

### 3. MCP 工具监控
- 工具调用频率统计
- 工具执行时间分析
- AI 调用成本监控
- 错误率和成功率统计

## 🛠 MCP 开发指南

### 1. MCP 工具开发流程

#### 步骤 1：工具定义
```typescript
// src/supabase/functions/mcp-server/tools/generateTags.ts
export const generateTagsTool: MCPTool = {
  name: 'generate-tags',
  description: 'Generate tags for blog content based on AI analysis',
  inputSchema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'Blog post content to analyze'
      },
      maxTags: {
        type: 'number',
        description: 'Maximum number of tags to generate',
        default: 10
      }
    },
    required: ['content']
  }
}
```

#### 步骤 2：工具实现
```typescript
// src/supabase/functions/mcp-server/handlers/generateTags.ts
export const generateTagsHandler = async (params: any) => {
  const { content, maxTags = 10 } = params
  
  try {
    // 调用 AI 服务生成标签
    const tags = await callAIService(content, maxTags)
    
    return {
      success: true,
      data: { tags }
    }
  } catch (error) {
    console.error('Error generating tags:', error)
    return {
      success: false,
      error: 'Failed to generate tags'
    }
  }
}
```

#### 步骤 3：工具注册
```typescript
// src/supabase/functions/mcp-server/index.ts
import { generateTagsTool, generateTagsHandler } from './tools/generateTags'

const tools = [
  { tool: generateTagsTool, handler: generateTagsHandler }
]

serve(async (req) => {
  const { method, params } = await req.json()
  
  if (method === 'tools/call') {
    const { name, arguments: args } = params
    const tool = tools.find(t => t.tool.name === name)
    
    if (tool) {
      const result = await tool.handler(args)
      return new Response(JSON.stringify(result))
    }
  }
})
```

### 2. 前端 MCP 集成

#### MCP 服务封装
```typescript
// src/frontend/blog-web/src/services/mcp.ts
export class MCPService {
  constructor(private supabase: any) {}
  
  async generateTags(content: string, maxTags: number = 10) {
    const { data, error } = await this.supabase.functions
      .invoke('mcp-server', {
        body: {
          method: 'tools/call',
          params: {
            name: 'generate-tags',
            arguments: { content, maxTags }
          }
        }
      })
    
    if (error) throw error
    return data
  }
  
  async optimizeSEO(content: string) {
    const { data, error } = await this.supabase.functions
      .invoke('mcp-server', {
        body: {
          method: 'tools/call',
          params: {
            name: 'optimize-seo',
            arguments: { content }
          }
        }
      })
    
    if (error) throw error
    return data
  }
}
```

#### 组件中使用
```typescript
// src/frontend/blog-web/src/components/PostEditor.vue
<script setup lang="ts">
import { MCPService } from '@/services/mcp'

const supabase = useSupabase()
const mcpService = new MCPService(supabase)

const generateTags = async () => {
  try {
    const result = await mcpService.generateTags(postContent.value)
    generatedTags.value = result.data.tags
  } catch (error) {
    console.error('Failed to generate tags:', error)
  }
}
</script>
```

### 3. MCP 工具最佳实践

#### 错误处理
```typescript
export const safeToolCall = async (toolName: string, params: any) => {
  try {
    const result = await mcpService.callTool(toolName, params)
    
    if (!result.success) {
      throw new Error(result.error || 'Tool call failed')
    }
    
    return result.data
  } catch (error) {
    console.error(`Error calling ${toolName}:`, error)
    // 重试逻辑
    return await retryToolCall(toolName, params)
  }
}
```

#### 性能优化
```typescript
export const batchToolCalls = async (calls: Array<{tool: string, params: any}>) => {
  const results = await Promise.allSettled(
    calls.map(call => mcpService.callTool(call.tool, call.params))
  )
  
  return results.map((result, index) => ({
    tool: calls[index].tool,
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value.data : null,
    error: result.status === 'rejected' ? result.reason : null
  }))
}
```

### 4. MCP 工具示例

#### 文章生成工具
```typescript
export const generatePostTool: MCPTool = {
  name: 'generate-post',
  description: 'Generate a blog post based on topic and keywords',
  inputSchema: {
    type: 'object',
    properties: {
      topic: { type: 'string', description: 'Post topic' },
      keywords: { type: 'array', items: { type: 'string' } },
      tone: { type: 'string', enum: ['formal', 'casual', 'professional'] },
      length: { type: 'number', description: 'Word count target' }
    },
    required: ['topic']
  }
}
```

#### 内容摘要工具
```typescript
export const generateSummaryTool: MCPTool = {
  name: 'generate-summary',
  description: 'Generate a concise summary of blog content',
  inputSchema: {
    type: 'object',
    properties: {
      content: { type: 'string' },
      maxLength: { type: 'number', default: 200 }
    },
    required: ['content']
  }
}
```

---

## 📞 联系方式

如有问题或建议，请联系：
- 开发团队：dev@blogsystem.com
- 项目管理：pm@blogsystem.com
- 技术支持：support@blogsystem.com

---

**最后更新：2024-01-01**  
**版本：1.0.0**  
**维护者：Blog System Team**