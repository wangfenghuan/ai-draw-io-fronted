export interface SolutionData {
    slug: string
    title: string
    description: string
    keywords: string[]
    heroTitle: string
    heroSubtitle: string
    features: {
        title: string
        desc: string
        icon: string
    }[]
    faq: {
        question: string
        answer: string
    }[]
}

export const solutions: Record<string, SolutionData> = {
    "uml-diagram": {
        slug: "uml-diagram",
        title: "免费在线 UML 类图工具 - IntelliDraw",
        description:
            "IntelliDraw 是最好的免费在线 UML 绘图工具。支持类图、时序图、用例图等所有 UML 2.5 标准图形。无需安装，打开浏览器即可使用，支持 AI 辅助生成代码。",
        keywords: ["UML工具", "在线UML", "类图", "时序图", "IntelliDraw"],
        heroTitle: "专业级在线 UML 建模工具",
        heroSubtitle:
            "专为开发者设计。支持从代码生成 UML，或从 UML 生成代码。完美支持 UML 2.5 标准。",
        features: [
            {
                title: "标准 UML图库",
                desc: "内置完整的 UML 符号库，轻松绘制类图、时序图、状态图等。",
                icon: "Code",
            },
            {
                title: "PlantUML 支持",
                desc: "支持导入和编辑 PlantUML 代码，实现代码即图表。",
                icon: "Terminal",
            },
            {
                title: "团队实时协作",
                desc: "邀请团队成员实时协作编辑同一个 UML 图，架构评审更高效。",
                icon: "Users",
            },
        ],
        faq: [
            {
                question: "IntelliDraw 是否支持从代码生成 UML？",
                answer: "是的，IntelliDraw 的 AI 功能可以分析您的代码片段并自动生成相应的 UML 类图或时序图。",
            },
            {
                question: "生成的图表可以导出吗？",
                answer: "支持导出为 HD PNG, SVG, PDF 以及 XML 等多种格式。",
            },
        ],
    },
    flowchart: {
        slug: "flowchart",
        title: "免费在线流程图制作软件 - IntelliDraw",
        description:
            "IntelliDraw 简单好用的在线流程图工具。海量流程图模板，拖拽式操作，一键美化。适合产品经理、项目经理使用。",
        keywords: ["流程图", "在线流程图", "Flowchart", "IntelliDraw"],
        heroTitle: "简单高效的流程图制作工具",
        heroSubtitle:
            "用最简单的方式梳理复杂的业务逻辑。IntelliDraw 让流程图绘制变得前所未有的简单。",
        features: [
            {
                title: "海量模板",
                desc: "提供泳道图、业务流程图、数据流程图等多种场景模板。",
                icon: "Layout",
            },
            {
                title: "智能排版",
                desc: "一键自动整理布局，让混乱的线条瞬间清晰有序。",
                icon: "Wand2",
            },
            {
                title: "Visio 兼容",
                desc: "完美支持导入和导出 Visio (.vsdx) 文件，无缝迁移工作成果。",
                icon: "FileInput",
            },
        ],
        faq: [
            {
                question: "可以免费使用吗？",
                answer: "IntelliDraw 提供功能强大的免费版本，满足绝大多数日常绘图需求。",
            },
            {
                question: "支持哪些导出格式？",
                answer: "支持 PNG、SVG、PDF、XML、VSDX 等多种格式导出。",
            },
        ],
    },
    "db-diagram": {
        slug: "db-diagram",
        title: "在线 ER 图设计工具 - 数据库建模神器 - IntelliDraw",
        description:
            "IntelliDraw 提供专业的 ER 图绘制工具，支持从 SQL 语句自动生成数据库关系图，帮助开发者快速进行数据库设计和文档化。",
        keywords: ["ER图", "数据库设计", "实体关系图", "SQL转图表", "IntelliDraw"],
        heroTitle: "智能数据库设计工具",
        heroSubtitle:
            "输入 SQL 语句，AI 自动生成 ER 图。支持 MySQL、PostgreSQL、Oracle 等主流数据库。",
        features: [
            {
                title: "SQL 转 ER 图",
                desc: "粘贴 CREATE TABLE 语句，一键生成标准的实体关系图。",
                icon: "Database",
            },
            {
                title: "关系自动识别",
                desc: "智能识别外键关系，自动绘制表之间的连线。",
                icon: "GitBranch",
            },
            {
                title: "多种数据库支持",
                desc: "支持 MySQL、PostgreSQL、SQL Server、Oracle 等主流数据库语法。",
                icon: "Server",
            },
        ],
        faq: [
            {
                question: "支持哪些数据库的 SQL 语法？",
                answer: "目前支持 MySQL、PostgreSQL、SQL Server、Oracle、SQLite 等主流数据库的 DDL 语法。",
            },
            {
                question: "可以从现有数据库生成 ER 图吗？",
                answer: "可以导出数据库的 CREATE TABLE 语句，然后粘贴到 IntelliDraw 中自动生成 ER 图。",
            },
        ],
    },
    topology: {
        slug: "topology",
        title: "网络拓扑图绘制工具 - 架构图设计 - IntelliDraw",
        description:
            "IntelliDraw 提供丰富的网络拓扑图标库，支持绘制 AWS、Azure、GCP 云架构图，网络拓扑图，系统架构图等。",
        keywords: ["网络拓扑图", "架构图", "AWS架构图", "云架构", "IntelliDraw"],
        heroTitle: "专业的网络拓扑图绘制工具",
        heroSubtitle:
            "内置 AWS、Azure、GCP、Kubernetes 等图标库，轻松绘制专业的云架构图和网络拓扑图。",
        features: [
            {
                title: "云厂商图标库",
                desc: "内置 AWS、Azure、GCP、阿里云等官方图标，绘制标准架构图。",
                icon: "Cloud",
            },
            {
                title: "网络设备图标",
                desc: "路由器、交换机、防火墙、服务器等网络设备图标一应俱全。",
                icon: "Network",
            },
            {
                title: "AI 生成架构图",
                desc: "描述系统架构，AI 自动生成专业的架构图。",
                icon: "Sparkles",
            },
        ],
        faq: [
            {
                question: "图标库是否持续更新？",
                answer: "是的，我们会定期更新各大云厂商的最新图标，确保您的架构图始终保持专业。",
            },
            {
                question: "可以自定义图标吗？",
                answer: "支持上传自定义图标，满足个性化需求。",
            },
        ],
    },
    "mind-map": {
        slug: "mind-map",
        title: "在线思维导图工具 - 头脑风暴神器 - IntelliDraw",
        description:
            "IntelliDraw 提供简洁高效的思维导图绘制功能，支持 AI 辅助扩展，帮助您整理思路、头脑风暴、知识梳理。",
        keywords: ["思维导图", "脑图", "Mind Map", "头脑风暴", "IntelliDraw"],
        heroTitle: "智能思维导图工具",
        heroSubtitle:
            "从中心主题出发，快速展开思维分支。AI 助手帮你扩展思路，让创意无限延伸。",
        features: [
            {
                title: "快速创建",
                desc: "输入主题，AI 自动生成思维导图框架，节省大量时间。",
                icon: "Zap",
            },
            {
                title: "丰富样式",
                desc: "多种配色方案和布局样式，让你的思维导图更美观。",
                icon: "Palette",
            },
            {
                title: "导出分享",
                desc: "支持导出为高清图片，方便分享和演示。",
                icon: "Share2",
            },
        ],
        faq: [
            {
                question: "AI 生成的思维导图可以编辑吗？",
                answer: "完全可以，AI 生成的内容可以自由编辑、添加、删除节点。",
            },
            {
                question: "支持多人协作吗？",
                answer: "支持实时协作，邀请团队成员一起编辑思维导图。",
            },
        ],
    },
    "springboot-architecture": {
        slug: "springboot-architecture",
        title: "Spring Boot 架构图生成工具 - 代码可视化 - IntelliDraw",
        description:
            "上传 Spring Boot 项目源码，AI 自动分析并生成项目架构图、模块依赖图、类关系图。帮助开发者快速理解项目结构。",
        keywords: ["Spring Boot", "架构图", "代码分析", "项目结构", "IntelliDraw"],
        heroTitle: "Spring Boot 项目架构可视化",
        heroSubtitle:
            "上传项目 ZIP 包，AI 自动分析 Controller、Service、Repository 层结构，生成清晰的架构图。",
        features: [
            {
                title: "自动分析",
                desc: "识别 Spring Boot 项目分层结构，自动提取关键组件。",
                icon: "Search",
            },
            {
                title: "依赖关系",
                desc: "分析 Bean 依赖关系，绘制组件间的调用关系图。",
                icon: "GitMerge",
            },
            {
                title: "快速理解",
                desc: "新成员快速理解项目结构，降低上手难度。",
                icon: "Rocket",
            },
        ],
        faq: [
            {
                question: "支持哪些项目类型？",
                answer: "目前支持 Spring Boot 项目，后续会支持更多框架。",
            },
            {
                question: "代码会上传到服务器吗？",
                answer: "代码仅用于本地分析，不会存储或泄露您的源码。",
            },
        ],
    },
}

export const getSolutionBySlug = (slug: string) => solutions[slug] || null
