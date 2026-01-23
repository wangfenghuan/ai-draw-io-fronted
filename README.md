# Next AI Draw.io

<div align="center">

**AI-Powered Collaborative Diagram Creation Platform**

智能图表创作平台 - 支持实时协作、空间管理、AI 辅助绘图

English | [中文](./docs/README_CN.md)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://react.dev/)
[![Yjs](https://img.shields.io/badge/Yjs-CRDT-purple)](https://github.com/yjs/yjs)

一个基于 Next.js 的 AI 驱动图表创建平台，集成 draw.io 编辑器，支持多人实时协作、空间管理、图表广场等功能。

[![Live Demo](./public/live-demo-button.svg)](https://next-ai-drawio.jiang.jp/)

</div>

## ✨ 核心功能

### 🤖 AI 智能绘图
- **自然语言生成图表**：通过对话方式创建各种类型的图表（流程图、架构图、思维导图等）
- **多模型支持**：支持 Claude、GPT、Gemini、GLM、通义千问、豆包、Kimi 等主流 AI 模型
- **图片识别绘图**：上传现有图片，AI 自动识别并生成可编辑的图表
- **PDF/文档解析**：上传 PDF 或文本文件，提取内容生成图表
- **思维链展示**：支持显示 AI 推理过程（Claude o1/o3、Gemini、DeepSeek R1 等）
- **云架构图标**：专为 AWS、Azure、GCP 云架构图优化的 AI 模型

### 👥 实时协作
- **多人同时编辑**：基于 Yjs CRDT 的无冲突实时协作
- **WebSocket 通信**：低延迟的实时同步
- **角色权限管理**：支持编辑者/查看者权限控制
- **光标位置同步**：实时显示协作者的光标位置
- **协作房间管理**：创建和加入协作房间，分享链接邀请他人

### 🏠 空间管理
- **团队空间**：创建团队空间，集中管理图表资源
- **成员管理**：邀请成员加入空间，分配角色权限
- **权限分级**：管理员、编辑者、查看者等多级权限
- **空间配额**：灵活的空间级别和配额管理

### 📊 图表广场
- **公共图表库**：浏览和发现社区创作的公开图表
- **一键复用**：快速将广场图表复制到自己的空间
- **大图预览**：支持图表详情查看和完整预览

### 📝 版本历史
- **历史版本管理**：自动记录每次编辑，支持查看和恢复历史版本
- **版本对比**：对比不同版本的差异
- **一键回滚**：快速恢复到任意历史版本

### 🎨 编辑器功能
- **Draw.io 集成**：完整的 Draw.io 编辑器功能
- **多格式导出**：支持 PNG、SVG、XML 等格式导出
- **深色模式**：支持亮色/深色主题切换
- **自动保存**：防止数据丢失的自动保存机制

## 🚀 快速开始

### 在线体验

无需安装，直接访问演示站点：

[![Live Demo](./public/live-demo-button.svg)](https://next-ai-drawio.jiang.jp/)

> **提示**：演示站点支持自定义 API Key，点击聊天面板的设置图标即可配置。

### Docker 部署（推荐）

```bash
docker run -d -p 6001:6001 \
  -e AI_PROVIDER=anthropic \
  -e AI_MODEL=claude-sonnet-4-5-20250514 \
  -e ANTHROPIC_API_KEY=your_api_key \
  -e NEXT_PUBLIC_API_BASE_URL=http://your-backend:8081/api \
  ghcr.io/wangfenghuan/w-next-ai-drawio:latest
```

或使用环境变量文件：

```bash
cp env.example .env
# 编辑 .env 文件配置你的环境变量
docker run -d -p 6001:6001 --env-file .env ghcr.io/wangfenghuan/w-next-ai-drawio:latest
```

访问 [http://localhost:6001](http://localhost:6001) 即可使用。

### 本地开发

1. **克隆仓库**

```bash
git clone https://github.com/wangfenghuan/w-next-ai-drawio.git
cd w-next-ai-drawio
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，至少配置以下必要项：

```bash
# AI 提供商配置
AI_PROVIDER=anthropic  # 或 openai, google, glm, qwen 等
AI_MODEL=claude-sonnet-4-5-20250514
ANTHROPIC_API_KEY=your_api_key

# 后端 API 地址（如果使用完整功能）
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api

# WebSocket 地址（协作功能）
NEXT_PUBLIC_WS_URL=ws://localhost:8081/api/yjs
```

4. **启动开发服务器**

```bash
npm run dev
```

访问 [http://localhost:6002](http://localhost:6002) 查看应用。

5. **构建生产版本**

```bash
npm run build
npm run start
```

## 📦 部署

### Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new?clone_url=https%3A%2F%2Fgithub.com%2Fwangfenghuan%2Fw-next-ai-drawio)

**重要**：部署前需在 Vercel 控制台配置环境变量。

### Docker Compose（完整部署）

包含前端、后端、Redis 的完整部署方案：

```bash
docker-compose up -d
```

## 🎯 AI 模型支持

### 完整提供商列表

- **AWS Bedrock**：Claude、Nova 系列
- **OpenAI**：GPT-4、GPT-5、o1/o3 推理模型
- **Anthropic**：Claude Sonnet、Opus、Haiku
- **Google**：Gemini 2.5/3 系列
- **Azure OpenAI**：通过 Azure 部署的 OpenAI 模型
- **智谱 GLM**：GLM-4 系列
- **阿里云通义千问**：Qwen 系列
- **火山引擎豆包**：Doubao 系列
- **月之暗面 Kimi**：Moonshot 系列
- **七牛云**：Qiniu AI
- **DeepSeek**：V3、R1 推理模型
- **SiliconFlow**：多种开源模型
- **Ollama**：本地部署模型
- **OpenRouter**：模型聚合平台
- **Minimax**：国内 AI 服务

### 模型选择建议

| 用途 | 推荐模型 | 说明 |
|------|---------|------|
| 通用图表 | Claude Sonnet 4.5 | 训练数据包含 draw.io，效果最佳 |
| 云架构图 | Claude Sonnet/Opus | 专门训练过 AWS/Azure/GCP 图标 |
| 中文场景 | GLM-4、Qwen、DeepSeek | 中文理解能力强 |
| 推理任务 | GPT-5 o1、Claude o3、DeepSeek R1 | 支持思维链展示 |
| 成本优先 | DeepSeek V3、硅基流动 | 性价比高 |

详细配置请参考 [AI Provider 配置指南](./docs/ai-providers.md)

## 🏗️ 技术架构

### 前端技术栈

- **Next.js 16**：React 全栈框架
- **React 19**：UI 库
- **TypeScript**：类型安全
- **Tailwind CSS**：样式框架
- **Radix UI**：无样式组件库
- **Draw.io Embed**：图表编辑器
- **Yjs**：CRDT 实时协作引擎
- **Redux Toolkit**：状态管理
- **Vercel AI SDK**：AI 集成

### 协作架构

```
┌─────────────────┐     WebSocket     ┌──────────────┐
│   Browser A     │ ◄──────────────► │   Backend    │
│   (Yjs CRDT)    │                   │   (Redis)    │
└─────────────────┘                   └──────────────┘
                                              │
                                              │ Pub/Sub
                                              ▼
                                     ┌──────────────┐
                                     │   Browser B  │
                                     │   (Yjs CRDT)  │
                                     └──────────────┘
```

- **协议格式**：`[idLen: 1 byte][senderId: N bytes][OpCode: 1 byte][Payload]`
- **OpCode 定义**：
  - `0x01`：POINTER（光标位置）
  - `0x02`：ELEMENTS_UPDATE（Yjs 二进制更新）
- **加解密**：AES-GCM 加密（可选）
- **冲突解决**：Yjs CRDT 自动处理

### 后端集成

如果启用完整功能，需要部署后端服务：

```bash
# 后端 API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api

# WebSocket 服务
NEXT_PUBLIC_WS_URL=ws://localhost:8081/api/yjs
```

后端功能包括：
- 用户认证和授权
- 图表存储（S3 + 数据库）
- 协作房间管理
- WebSocket 消息转发
- Redis Pub/Sub 消息广播

## 📂 项目结构

```
├── app/                          # Next.js App Router
│   ├── page.tsx                 # 首页
│   ├── diagram/                 # 图表相关页面
│   │   ├── edit/[id]/           # 图表编辑页
│   │   │   └── room/[roomId]/   # 协作房间
│   │   └── view/[id]/           # 图表查看页
│   ├── diagram-marketplace/     # 图表广场
│   ├── my-diagrams/             # 我的图表
│   ├── my-spaces/               # 我的空间
│   ├── team-spaces/             # 团队空间
│   ├── user/                    # 用户相关
│   │   ├── login/               # 登录
│   │   ├── register/            # 注册
│   │   └── profile/             # 个人资料
│   └── admin/                   # 管理后台
├── components/                   # React 组件
│   ├── chat-panel.tsx           # AI 聊天面板
│   ├── collaboration-panel.tsx  # 协作面板
│   ├── diagram-toolbar.tsx      # 图表工具栏
│   ├── history-dialog.tsx       # 历史版本
│   └── ui/                      # UI 组件
├── contexts/                     # Context 状态管理
│   └── diagram-context.tsx      # 图表全局状态
├── lib/                         # 工具库
│   ├── ai-providers.ts          # AI 提供商配置
│   ├── websocket-collab.ts      # WebSocket 协作
│   ├── yjs-collab-wrapper.ts    # Yjs 封装
│   ├── use-diagram-save.ts      # 图表保存
│   └── utils.ts                 # 通用工具
├── api/                         # API 接口定义
│   ├── diagramController.ts
│   ├── spaceController.ts
│   ├── roomController.ts
│   └── typings.d.ts
└── public/                      # 静态资源
```

## 🔧 配置说明

### 必要配置

```bash
# AI 提供商（选择一个）
AI_PROVIDER=anthropic  # openai, google, glm, qwen, doubao, kimi 等
AI_MODEL=claude-sonnet-4-5-20250514

# 对应的 API Key
ANTHROPIC_API_KEY=sk-ant-xxx
# 或
OPENAI_API_KEY=sk-xxx
# 或
GLM_API_KEY=xxx
```

### 可选配置

```bash
# 访问控制（建议生产环境设置）
ACCESS_CODE_LIST=your-secret-code

# Draw.io 地址（国内可配置镜像）
NEXT_PUBLIC_DRAWIO_BASE_URL=https://embed.diagrams.net

# 温度参数（0-2，越低越确定）
TEMPERATURE=0

# PDF 上传功能
ENABLE_PDF_INPUT=true
NEXT_PUBLIC_MAX_EXTRACTED_CHARS=150000

# Langfuse 可观测性
LANGFUSE_PUBLIC_KEY=pk-lf-xxx
LANGFUSE_SECRET_KEY=sk-lf-xxx

# 后端集成（可选，用于用户系统、协作等功能）
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api
NEXT_PUBLIC_WS_URL=ws://localhost:8081/api/yjs
```

详细配置请参考 [完整配置文档](./docs/configuration.md)

## 📖 使用指南

### 创建图表

1. 点击"新建图表"按钮
2. 在聊天面板输入描述，例如：
   ```
   创建一个 AWS 架构图，包含 ELB、EC2、RDS
   ```
3. AI 自动生成图表
4. 通过对话继续修改和优化

### 邀请协作

1. 在图表编辑页点击"协作"按钮
2. 创建协作房间
3. 复制房间链接分享给他人
4. 协作者通过链接加入房间

### 空间管理

1. 创建团队空间
2. 邀请成员加入
3. 分配角色权限（管理员/编辑者/查看者）
4. 在空间中集中管理图表

### 版本历史

1. 点击"历史记录"按钮
2. 查看所有历史版本
3. 预览任意版本
4. 一键恢复到选定的历史版本

## 🌟 特色示例

### 示例 1：云架构图

**提示词**：
```
创建一个高可用的 Web 应用架构图，包含：
- CloudFront CDN
- Application Load Balancer
- 2 个 EC2 实例（Auto Scaling）
- Amazon RDS Multi-AZ
- ElastiCache Redis
```

### 示例 2：流程图

**提示词**：
```
画一个用户注册流程图，包括：
1. 用户填写注册表单
2. 验证邮箱格式
3. 发送验证邮件
4. 用户点击验证链接
5. 激活账户
```

### 示例 3：思维导图

**提示词**：
```
创建一个关于"机器学习"的思维导图，包含：
- 监督学习
- 无监督学习
- 强化学习
每个分支展开 2-3 个关键概念
```

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

本项目采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 协议开源。

## 💖 赞助支持

如果这个项目对你有帮助，请考虑：

- ⭐ 给项目点个 Star
- 💬 在社区分享使用经验
- 🐛 提交 Bug 或建议
- 💰 [赞助项目](https://github.com/sponsors/DayuanJiang) 帮助维持演示站点运行

## 📞 联系方式

- **Issues**：[GitHub Issues](https://github.com/wangfenghuan/w-next-ai-drawio/issues)
- **Email**：me[at]jiang.jp

## 🙏 致谢

- [Draw.io](https://www.diagrams.net/)：强大的开源图表编辑器
- [Yjs](https://github.com/yjs/yjs)：优秀的 CRDT 实时协作框架
- [Vercel AI SDK](https://sdk.vercel.ai/)：统一的 AI 模型集成方案
- [Next.js](https://nextjs.org/)：React 全栈框架

---

<div align="center">

**Made with ❤️ by the Next AI Draw.io Community**

[⭐ Star us on GitHub](https://github.com/wangfenghuan/w-next-ai-drawio) — it helps!

</div>
