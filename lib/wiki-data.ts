export interface WikiArticle {
    slug: string
    title: string
    description: string
    category: string
    content: string // Markdown content
    relatedTemplates: string[]
}

export const wikiArticles: Record<string, WikiArticle> = {
    "what-is-uml-diagram": {
        slug: "what-is-uml-diagram",
        title: "什么是 UML 图？UML 建模入门指南",
        description:
            "本文详细介绍了什么是统一建模语言 (UML)，UML 图的 14 种类型，以及如何使用 IntelliDraw 快速绘制标准的 UML 图。",
        category: "UML",
        relatedTemplates: ["uml-class", "uml-sequence"],
        content: `
# 什么是 UML 图？

**统一建模语言 (Unified Modeling Language, UML)** 是一种标准化的通用建模语言，主要用于软件工程领域。它可以帮助开发人员、架构师和业务分析师可视化、构建和文档化软件系统的构件。

## UML 图的分类

UML 2.5 标准定义了 14 种类型的图表，主要分为两大类：

### 1. 结构图 (Structure Diagrams)
展示系统的静态结构。
- **类图 (Class Diagram)**: 最常用的 UML 图，描述系统的类、属性、方法及其关系。
- **组件图 (Component Diagram)**: 描述组件及其相互依赖关系。
- **部署图 (Deployment Diagram)**: 描述硬件的拓扑结构以及软件在硬件上的部署。

### 2. 行为图 (Behavior Diagrams)
展示系统的动态行为。
- **用例图 (Use Case Diagram)**: 描述用户与系统的交互。
- **序列图/时序图 (Sequence Diagram)**: 展示对象之间交互的时间顺序。
- **状态图 (State Machine Diagram)**: 描述对象在生命周期中的状态变化。

## 为什么要使用 UML？

1. **标准化沟通**: 使用统一的符号，消除沟通歧义。
2. **可视化架构**: 帮助理清复杂的系统依赖关系。
3. **文档化**: 为后续维护提供清晰的文档支持。

## 如何使用 IntelliDraw 绘制 UML 图？

IntelliDraw 提供了完整的 UML 符号库和 AI 辅助功能：

1. 打开 [IntelliDraw 编辑器](/diagram/new)。
2. 在左侧图形库中勾选 "UML"。
3. 拖拽 "Class" 或 "Interface" 图形到画布。
4. 或者，使用 AI 功能，输入 "帮我生成一个电商系统的类图"，即可自动生成。

> [!TIP]
> 这里的 AI 生成功能是 IntelliDraw 的核心优势，能够极大提高建模效率。

`,
    },
    "how-to-draw-flowchart": {
        slug: "how-to-draw-flowchart",
        title: "流程图绘制最佳实践：从入门到精通",
        description:
            "学习如何绘制清晰、专业的流程图。包含标准符号说明、布局技巧以及常见错误规避。",
        category: "Flowchart",
        relatedTemplates: ["flow-swimlane", "flow-basic"],
        content: `
# 流程图绘制最佳实践

流程图是梳理业务逻辑、算法思路最有效的工具。一个好的流程图应该清晰、易读、逻辑严密。

## 标准符号指南

- **起止框 (椭圆)**: 表示流程的开始或结束。
- **处理框 (矩形)**: 表示一个具体的步骤或操作。
- **判断框 (菱形)**: 表示需要做决策的节点，通常有两个出口 (Yes/No)。
- **输入/输出 (平行四边形)**: 表示数据的输入或输出。

## 绘制技巧

1. **统一流向**: 尽量从左到右，从上到下。
2. **避免交叉**: 尽量减少连线的交叉，使用跨线或连接点。
3. **大小一致**: 相同类型的图形保持大小一致，视觉更整洁。

## 使用 IntelliDraw 快速绘图

在 IntelliDraw 中，你只需要：
- 拖拽图形，吸附对齐。
- 点击图形边缘的箭头，自动连接下一个图形。
- 使用 **"一键美化"** 功能自动整理混乱的连接线。

立即尝试 [免费绘制流程图](/diagram/new)！
`,
    },
    "er-diagram-guide": {
        slug: "er-diagram-guide",
        title: "ER 图设计指南：数据库建模从入门到精通",
        description:
            "深入学习 ER 图（实体关系图）的设计方法，包括实体、属性、关系的表示，以及如何从 SQL 语句自动生成 ER 图。",
        category: "Database",
        relatedTemplates: ["er-basic", "er-ecommerce"],
        content: `
# ER 图设计指南

**ER 图 (Entity-Relationship Diagram)** 是数据库设计的重要工具，用于描述实体、属性和实体之间的关系。

## ER 图基本元素

### 1. 实体 (Entity)
用矩形表示，代表现实世界中的对象。例如：用户、订单、商品。

### 2. 属性 (Attribute)
用椭圆表示，描述实体的特征。例如：用户的姓名、邮箱。

### 3. 关系 (Relationship)
用菱形表示，描述实体之间的联系。例如：用户"下"订单。

## 关系类型

- **一对一 (1:1)**: 一个用户对应一个档案
- **一对多 (1:N)**: 一个用户有多个订单
- **多对多 (M:N)**: 一个订单包含多个商品，一个商品可被多个订单包含

## 使用 IntelliDraw 从 SQL 生成 ER 图

IntelliDraw 支持 AI 智能分析 SQL 语句，自动生成 ER 图：

\`\`\`sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255)
);

CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
\`\`\`

将上述 SQL 粘贴到 IntelliDraw，即可自动生成包含表关系图的 ER 图。

立即尝试 [免费绘制 ER 图](/diagram/new)！
`,
    },
    "aws-architecture-design": {
        slug: "aws-architecture-design",
        title: "AWS 架构图设计最佳实践",
        description:
            "学习如何绘制专业的 AWS 云架构图，包括常用服务图标、架构设计原则、以及使用 IntelliDraw 快速绘制的方法。",
        category: "Cloud",
        relatedTemplates: ["aws-basic", "aws-microservice"],
        content: `
# AWS 架构图设计最佳实践

绘制清晰的 AWS 架构图是云架构师的基本技能。一张好的架构图能让团队快速理解系统设计。

## AWS 架构图基本原则

1. **分层展示**: 用户层、网络层、计算层、数据层
2. **清晰的边界**: VPC、子网、安全组用虚线框表示
3. **数据流向**: 用箭头表示数据流动方向

## 常用 AWS 服务图标

### 计算服务
- **EC2**: 虚拟服务器
- **Lambda**: 无服务器函数
- **ECS/EKS**: 容器服务

### 存储服务
- **S3**: 对象存储
- **EBS**: 块存储
- **RDS**: 关系数据库

### 网络服务
- **VPC**: 虚拟私有云
- **CloudFront**: CDN
- **Route 53**: DNS

## 使用 IntelliDraw 绘制 AWS 架构图

IntelliDraw 内置了 AWS 官方图标库：

1. 打开 [IntelliDraw 编辑器](/diagram/new)
2. 在左侧图形库中选择 "AWS"
3. 拖拽服务图标到画布
4. 使用连接线表示数据流

也可以使用 AI 功能，输入："帮我设计一个高可用的 Web 应用架构"，AI 会自动生成架构图。

立即尝试 [免费绘制 AWS 架构图](/diagram/new)！
`,
    },
    "spring-boot-architecture-analysis": {
        slug: "spring-boot-architecture-analysis",
        title: "Spring Boot 项目架构分析方法",
        description:
            "掌握 Spring Boot 项目架构分析技巧，理解 MVC 分层、依赖注入、模块划分等核心概念，使用工具自动生成架构图。",
        category: "Architecture",
        relatedTemplates: ["spring-basic", "microservice"],
        content: `
# Spring Boot 项目架构分析方法

理解一个 Spring Boot 项目的架构是开发协作的基础。本文介绍项目架构分析的核心维度和方法。

## Spring Boot 核心分层

### 1. Controller 层
处理 HTTP 请求，负责参数校验和响应封装。
- 使用 @RestController 注解
- 定义 API 端点

### 2. Service 层
业务逻辑处理，是应用的核心。
- 使用 @Service 注解
- 实现业务规则

### 3. Repository 层
数据访问层，与数据库交互。
- 使用 @Repository 注解
- 继承 JpaRepository

### 4. Entity 层
数据模型定义。
- 使用 @Entity 注解
- 映射数据库表

## 架构分析要点

1. **模块划分**: 识别功能模块边界
2. **依赖关系**: 分析层与层之间的调用关系
3. **配置管理**: 理解配置文件结构

## 使用 IntelliDraw 自动生成架构图

IntelliDraw 支持上传 Spring Boot 项目 ZIP 包，AI 自动分析并生成：

- 项目分层结构图
- 模块依赖关系图
- 核心类关系图

这极大降低了新成员理解项目的门槛。

立即尝试 [分析 Spring Boot 项目](/diagram/new)！
`,
    },
}

export const getWikiBySlug = (slug: string) => wikiArticles[slug] || null
