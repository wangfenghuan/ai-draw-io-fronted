# IntelliDraw - AI-Powered Collaborative Diagram Platform

<div align="center">

**AI-Powered Collaborative Diagram Creation Platform | AI 驱动的智能图表协作平台**

[English](#english) | [中文](#中文)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org/)
[![Yjs](https://img.shields.io/badge/Yjs-CRDT-purple)](https://github.com/yjs/yjs)

</div>

---

<a name="english"></a>
## 📖 English

### Overview

IntelliDraw is an AI-powered collaborative diagram creation platform built with Next.js. It integrates the draw.io editor and supports real-time collaboration, team spaces, and AI-assisted diagram generation through natural language.

[![Live Demo](./public/live-demo-button.svg)](https://www.intellidraw.top/)

### ✨ Key Features

#### 🤖 AI-Powered Diagram Generation
- **Natural Language to Diagram**: Create various diagram types (flowcharts, architecture diagrams, mind maps, UML, etc.) through conversational AI
- **Multi-Model Support**: Supports 15+ AI providers including Claude, GPT-4/5, Gemini, GLM, Qwen, Doubao, Kimi, DeepSeek, and more
- **Image Recognition**: Upload existing diagrams or images, AI automatically recognizes and generates editable diagrams
- **PDF/Document Parsing**: Extract content from PDF or text files to generate diagrams
- **Chain of Thought Display**: Supports AI reasoning process visualization (Claude o1/o3, Gemini, DeepSeek R1)
- **Cloud Architecture Icons**: AI models optimized for AWS, Azure, GCP architecture diagrams

#### 👥 Real-time Collaboration
- **Multi-user Editing**: Conflict-free real-time collaboration based on Yjs CRDT
- **WebSocket Communication**: Low-latency real-time synchronization
- **Role-based Permissions**: Editor/Viewer permission control
- **Cursor Position Sync**: Real-time display of collaborator cursor positions
- **Collaboration Rooms**: Create and join collaboration rooms, share links to invite others

#### 🏠 Space Management
- **Team Spaces**: Create team spaces for centralized diagram resource management
- **Member Management**: Invite members to spaces, assign role permissions
- **Permission Levels**: Multi-level permissions including Admin, Editor, Viewer
- **Space Quotas**: Flexible space-level and quota management

#### 📊 Diagram Marketplace
- **Public Diagram Library**: Browse and discover community-created public diagrams
- **One-click Reuse**: Quickly copy marketplace diagrams to your own space
- **Large Preview**: Support for diagram details and full preview

#### 📝 Version History
- **History Management**: Automatic recording of every edit, view and restore historical versions
- **Version Comparison**: Compare differences between versions
- **One-click Rollback**: Quick restore to any historical version

#### 🎨 Editor Features
- **Draw.io Integration**: Complete Draw.io editor functionality
- **Multi-format Export**: Support for PNG, SVG, XML and other formats
- **Dark Mode**: Support for light/dark theme switching
- **Auto-save**: Auto-save mechanism to prevent data loss

### 🚀 Quick Start

#### Online Demo

No installation required, visit the demo site directly:

[![Live Demo](./public/live-demo-button.svg)](https://www.intellidraw.top/)

> **Tip**: The demo site supports custom API Keys. Click the settings icon in the chat panel to configure.

#### Docker Deployment (Recommended)

```bash
docker run -d -p 6001:6001 \
  -e AI_PROVIDER=anthropic \
  -e AI_MODEL=claude-sonnet-4-5-20250514 \
  -e ANTHROPIC_API_KEY=your_api_key \
  -e NEXT_PUBLIC_API_BASE_URL=http://your-backend:8081/api \
  ghcr.io/wangfenghuan/w-next-ai-drawio:latest
```

Or use environment variable file:

```bash
cp env.example .env
# Edit .env file to configure your environment variables
docker run -d -p 6001:6001 --env-file .env ghcr.io/wangfenghuan/w-next-ai-drawio:latest
```

Visit [http://localhost:6001](http://localhost:6001) to use.

#### Local Development

1. **Clone Repository**

```bash
git clone https://github.com/wangfenghuan/w-next-ai-drawio.git
cd w-next-ai-drawio
```

2. **Install Dependencies**

```bash
npm install
```

3. **Configure Environment Variables**

```bash
cp env.example .env.local
```

Edit `.env.local` file, configure at least these required items:

```bash
# AI Provider Configuration
AI_PROVIDER=anthropic  # or openai, google, glm, qwen, etc.
AI_MODEL=claude-sonnet-4-5-20250514
ANTHROPIC_API_KEY=your_api_key

# Backend API URL (if using full features)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api

# WebSocket URL (collaboration feature)
NEXT_PUBLIC_WS_URL=ws://localhost:8081/api/yjs
```

4. **Start Development Server**

```bash
npm run dev
```

Visit [http://localhost:6002](http://localhost:6002) to view the app.

### 🎯 AI Model Support

| Provider | Models | Notes |
|----------|--------|-------|
| AWS Bedrock | Claude, Nova series | Enterprise deployment |
| OpenAI | GPT-4, GPT-5, o1/o3 reasoning models | Most popular choice |
| Anthropic | Claude Sonnet, Opus, Haiku | Best for draw.io diagrams |
| Google | Gemini 2.5/3 series | Strong reasoning capability |
| Azure OpenAI | OpenAI models via Azure | Enterprise compliance |
| 智谱 GLM | GLM-4 series | Excellent Chinese understanding |
| 阿里云通义千问 | Qwen series | Cost-effective |
| 火山引擎豆包 | Doubao series | ByteDance AI |
| 月之暗面 Kimi | Moonshot series | Long context support |
| DeepSeek | V3, R1 reasoning models | High cost-performance ratio |
| Ollama | Local models | Privacy-first, offline capable |
| OpenRouter | Multiple open-source models | Model aggregation platform |

### 🏗️ Tech Stack

- **Framework**: Next.js 16, React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Ant Design, Radix UI
- **Collaboration**: Yjs CRDT, WebSocket
- **AI Integration**: Vercel AI SDK
- **State Management**: Redux Toolkit

### 📂 Project Structure

```
├── app/                    # Next.js App Router
│   ├── diagram/           # Diagram pages (edit/view)
│   ├── diagram-marketplace/ # Diagram marketplace
│   ├── my-diagrams/       # My diagrams
│   ├── my-spaces/         # My spaces
│   └── user/              # User-related pages
├── components/            # React components
│   ├── chat-panel.tsx     # AI chat panel
│   ├── collaboration-panel.tsx # Collaboration panel
│   └── ui/                # UI components
├── lib/                   # Utilities
│   ├── ai-providers.ts    # AI provider config
│   └── websocket-collab.ts # WebSocket collaboration
└── api/                   # API definitions
```

### 📄 License

This project is open-sourced under the [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) license.

---

<a name="中文"></a>
## 📖 中文

### 项目简介

IntelliDraw 是一款基于 Next.js 的 AI 驱动智能图表协作平台。集成 draw.io 编辑器，支持自然语言生成图表、多人实时协作、团队空间管理、图表广场等丰富功能。

[![在线演示](./public/live-demo-button.svg)](https://www.intellidraw.top/)

### ✨ 核心功能

#### 🤖 AI 智能绘图
- **自然语言生成图表**：通过对话方式创建各种类型的图表（流程图、架构图、思维导图、UML 等）
- **多模型支持**：支持 15+ 种 AI 提供商，包括 Claude、GPT-4/5、Gemini、GLM、通义千问、豆包、Kimi、DeepSeek 等
- **图片识别绘图**：上传现有图片，AI 自动识别并生成可编辑的图表
- **PDF/文档解析**：上传 PDF 或文本文件，提取内容生成图表
- **思维链展示**：支持显示 AI 推理过程（Claude o1/o3、Gemini、DeepSeek R1 等）
- **云架构图标**：专为 AWS、Azure、GCP 云架构图优化的 AI 模型

#### 👥 实时协作
- **多人同时编辑**：基于 Yjs CRDT 的无冲突实时协作
- **WebSocket 通信**：低延迟的实时同步
- **角色权限管理**：支持编辑者/查看者权限控制
- **光标位置同步**：实时显示协作者的光标位置
- **协作房间管理**：创建和加入协作房间，分享链接邀请他人

#### 🏠 空间管理
- **团队空间**：创建团队空间，集中管理图表资源
- **成员管理**：邀请成员加入空间，分配角色权限
- **权限分级**：管理员、编辑者、查看者等多级权限
- **空间配额**：灵活的空间级别和配额管理

#### 📊 图表广场
- **公共图表库**：浏览和发现社区创作的公开图表
- **一键复用**：快速将广场图表复制到自己的空间
- **大图预览**：支持图表详情查看和完整预览

#### 📝 版本历史
- **历史版本管理**：自动记录每次编辑，支持查看和恢复历史版本
- **版本对比**：对比不同版本的差异
- **一键回滚**：快速恢复到任意历史版本

#### 🎨 编辑器功能
- **Draw.io 集成**：完整的 Draw.io 编辑器功能
- **多格式导出**：支持 PNG、SVG、XML 等格式导出
- **深色模式**：支持亮色/深色主题切换
- **自动保存**：防止数据丢失的自动保存机制

### 🚀 快速开始

#### 在线体验

无需安装，直接访问演示站点：

[![在线演示](./public/live-demo-button.svg)](https://www.intellidraw.top/)

> **提示**：演示站点支持自定义 API Key，点击聊天面板的设置图标即可配置。

#### Docker 部署（推荐）

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

#### 本地开发

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

### 🎯 AI 模型支持

| 提供商 | 模型 | 说明 |
|--------|------|------|
| AWS Bedrock | Claude、Nova 系列 | 企业级部署 |
| OpenAI | GPT-4、GPT-5、o1/o3 推理模型 | 最受欢迎 |
| Anthropic | Claude Sonnet、Opus、Haiku | 图表效果最佳 |
| Google | Gemini 2.5/3 系列 | 推理能力强 |
| Azure OpenAI | 通过 Azure 部署的 OpenAI 模型 | 企业合规 |
| 智谱 GLM | GLM-4 系列 | 中文理解优秀 |
| 阿里云通义千问 | Qwen 系列 | 性价比高 |
| 火山引擎豆包 | Doubao 系列 | 字节跳动 AI |
| 月之暗面 Kimi | Moonshot 系列 | 超长上下文 |
| DeepSeek | V3、R1 推理模型 | 国产性价比之王 |
| Ollama | 本地模型 | 隐私优先，可离线 |
| OpenRouter | 多种开源模型 | 模型聚合平台 |

### 🏗️ 技术架构

- **框架**：Next.js 16, React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS, Ant Design, Radix UI
- **协作**：Yjs CRDT, WebSocket
- **AI 集成**：Vercel AI SDK
- **状态管理**：Redux Toolkit

### 📂 项目结构

```
├── app/                    # Next.js App Router
│   ├── diagram/           # 图表页面（编辑/查看）
│   ├── diagram-marketplace/ # 图表广场
│   ├── my-diagrams/       # 我的图表
│   ├── my-spaces/         # 我的空间
│   └── user/              # 用户相关页面
├── components/            # React 组件
│   ├── chat-panel.tsx     # AI 聊天面板
│   ├── collaboration-panel.tsx # 协作面板
│   └── ui/                # UI 组件
├── lib/                   # 工具库
│   ├── ai-providers.ts    # AI 提供商配置
│   └── websocket-collab.ts # WebSocket 协作
└── api/                   # API 定义
```

### 📄 开源协议

本项目采用 [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) 协议开源。

---

## 📞 Contact | 联系方式

- **Issues**: [GitHub Issues](https://github.com/wangfenghuan/w-next-ai-drawio/issues)
- **Homepage**: [https://www.intellidraw.top](https://www.intellidraw.top)

## 🙏 Acknowledgements | 致谢

- [Draw.io](https://www.diagrams.net/) - Powerful open-source diagram editor
- [Yjs](https://github.com/yjs/yjs) - Excellent CRDT real-time collaboration framework
- [Vercel AI SDK](https://sdk.vercel.ai/) - Unified AI model integration solution
- [Next.js](https://nextjs.org/) - React full-stack framework

---

<div align="center">

**Made with ❤️ by the IntelliDraw Community**

[⭐ Star us on GitHub](https://github.com/wangfenghuan/w-next-ai-drawio) — it helps!

</div>