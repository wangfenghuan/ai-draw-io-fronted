"use client"

import {
    ChevronDown,
    Code,
    Download,
    FileCode,
    Database,
    MessageSquare,
    Save,
    Send,
    Settings,
    Square,
    Trash2,
    Zap,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useSelector } from "react-redux"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"
import { listDiagramChatHistory } from "@/api/conversionController"
import { uploadAndAnalyzeSimple, parseSql } from "@/api/codeParser"
import { AIConfigDialog, useAIConfig } from "@/components/ai-config-dialog"
import { CodeBlock } from "@/components/code-block"
import { CollaborationPanel } from "@/components/collaboration-panel"
import { DownloadDialog } from "@/components/download-dialog"
import { removeThinkingTags, ThinkingBlock } from "@/components/thinking-block"
import { Button } from "@/components/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useDiagram } from "@/contexts/diagram-context"
import { type Message, useBackendChat } from "@/lib/use-backend-chat"
import { useDiagramSave } from "@/lib/use-diagram-save"
import { useFileProcessor } from "@/lib/use-file-processor"

import { FilePreviewList } from "@/components/file-preview-list"
import { parseXmlAndLoadDiagram } from "@/lib/utils"
import type { RootState } from "@/stores"

interface SimpleChatPanelProps {
    diagramId: string
    isVisible: boolean
    onToggleVisibility: () => void
    darkMode: boolean
    diagramTitle: string
    spaceId?: number | string
    /** When provided (e.g. on demo page), all actions call this instead of executing. */
    onRequireLogin?: (featureName: string) => void
}

export default function SimpleChatPanel({
    diagramId,
    isVisible,
    onToggleVisibility,
    darkMode,
    diagramTitle,
    spaceId,
    onRequireLogin,
}: SimpleChatPanelProps) {
    const [input, setInput] = useState("")
    const [historyLoaded, setHistoryLoaded] = useState(false)
    const [configDialogOpen, setConfigDialogOpen] = useState(false)
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Helper: gate any action behind login on demo page
    const requireLogin = (featureName: string, action?: () => void): boolean => {
        if (onRequireLogin) {
            onRequireLogin(featureName)
            return true // blocked
        }
        action?.()
        return false // not blocked
    }

    // File upload state and hooks
    const { files, pdfData, handleFileChange, setFiles } = useFileProcessor()


    const [aiConfig, setAiConfig] = useAIConfig()
    const {
        loadDiagram,
        drawioRef,
        chartXML,
        registerExportCallback,
        handleExportWithoutHistory,
        resolverRef,
        setHasUnsavedChanges,
    } = useDiagram()
    const {
        saveDiagram: saveDiagramToServer,
        handleExportCallback,
        downloadDiagram,
    } = useDiagramSave(drawioRef)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const loginUser = useSelector((state: RootState) => state.loginUser)

    const {
        messages,
        sendMessage,
        stop,
        clearMessages,
        isLoading,
        error,
        setMessages,
    } = useBackendChat({
        diagramId,
        aiConfig,
        onMessageComplete: (fullContent) => {
            try {
                parseXmlAndLoadDiagram(fullContent, loadDiagram)
            } catch (err) {
                console.error("Failed to parse diagram XML:", err)
            }
        },
        onError: (err) => {
            console.error("Chat error:", err)
            // toast 提示已在 use-backend-chat.ts 中处理
        },
    })

    // 加载历史记录
    useEffect(() => {
        const loadHistory = async () => {
            if (!diagramId || historyLoaded) return
            try {
                const response = await listDiagramChatHistory({
                    diagramId: diagramId,
                    pageSize: 100,
                })
                if (response?.code === 0 && response?.data?.records) {
                    const conversions = response.data.records
                    const historyMessages: Message[] = conversions
                        .filter((conv: API.Conversion) => !conv.isDelete)
                        .sort(
                            (a: API.Conversion, b: API.Conversion) =>
                                new Date(a.createTime || 0).getTime() -
                                new Date(b.createTime || 0).getTime(),
                        )
                        .map((conv: API.Conversion) => {
                            let content = conv.message || ""
                            // 修复：如果消息包含"图表已生成"标记，但缺少XML代码块，则尝试补充
                            if (
                                conv.messageType !== "user" &&
                                (content.includes("✅ 图表已生成") ||
                                    content.includes("图表已生成")) &&
                                !content.includes("```xml") &&
                                chartXML
                            ) {
                                // 从当前图表XML中提取内容
                                const mxfileMatch = chartXML.match(
                                    /<mxfile[\s\S]*?<\/mxfile>/,
                                )
                                if (mxfileMatch) {
                                    // 将XML代码块添加到消息内容中
                                    content = content.replace(
                                        /✅ 图表已生成|图表已生成/g,
                                        `\`\`\`xml\n${mxfileMatch[0]}\n\`\`\`\n\n✅ 图表已生成`,
                                    )
                                }
                            }
                            return {
                                id: `history-${conv.id}`,
                                role:
                                    conv.messageType === "user"
                                        ? "user"
                                        : "assistant",
                                content: content,
                                timestamp: new Date(
                                    conv.createTime || 0,
                                ).getTime(),
                            }
                        })

                    if (historyMessages.length > 0) {
                        setMessages(historyMessages)
                    }
                }
            } catch (err) {
                console.error("[SimpleChatPanel] Failed to load history:", err)
            } finally {
                setHistoryLoaded(true)
            }
        }
        loadHistory()
    }, [diagramId, historyLoaded, setMessages, chartXML])

    // 自动滚动
    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
        return () => clearTimeout(timer)
    }, [messages])

    // 这样 handleDiagramExport 才能调用 handleExportCallback，从而 resolve exportDiagram 的 Promise
    useEffect(() => {
        registerExportCallback(handleExportCallback)
        return () => {
            registerExportCallback(null) // 清理回调
        }
    }, [registerExportCallback, handleExportCallback])

    // 下载处理函数
    const handleDownload = async (format: "xml" | "png" | "svg") => {
        try {
            await downloadDiagram({
                diagramId: diagramId,
                filename: diagramTitle || "diagram",
                format: format.toUpperCase() as "PNG" | "SVG" | "XML",
            })
        } catch (error) {
            console.error("下载失败:", error)
            toast.error(
                error instanceof Error ? error.message : "下载失败，请稍后重试",
            )
        }
    }

    // File input refs for Code/SQL analysis
    const fileInputCodeRef = useRef<HTMLInputElement>(null)
    const fileInputSqlRef = useRef<HTMLInputElement>(null)

    const handleCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const toastId = toast.loading("正在分析 Spring Boot 项目，请稍候...")
        try {
            const res = await uploadAndAnalyzeSimple({}, file)
            if (res.code === 0 && res.data) {
                const arch = res.data
                const layerList = Array.from(arch.layers || []).join("、")
                const componentCount = arch.components?.length ?? 0
                const linkCount = arch.links?.length ?? 0
                const externalList = (arch.externalSystems || []).join("、") || "无"

                const prompt = `你现在是一位资深的软件架构师。我使用 AST 解析器提取了 Spring Boot 项目的架构元数据（包含组件节点、架构层级、角色定义和真实的调用链路）。

请根据我提供的 JSON 数据，使用 drawio 语法绘制一张高视角的【系统架构图（类似 C4 模型的容器/组件图）】。

【绘图严格要求】
1. 图表类型：使用 \`drawio可以识别的xml代码\`（从上到下的有向图布局）。
2. 架构分层：将节点按照 \`layer\` 字段进行逻辑分组。自上而下的视觉排版顺序应严格为：
   - API 层（网关/控制器层）
   - BIZ 层（核心业务逻辑层）
   - DATA 层（数据持久层）
   - INFRA 层（基础设施/配置层）
3. 中间件与外部依赖：将 \`layer\` 为 "MIDDLEWARE" 的节点放在业务系统图表的外部边缘，或者归类到一个单独的 [外部系统/中间件] Subgraph 中，凸显系统与外部组件（如 Redis, Kafka, DB）的边界。
4. 节点信息展示：
   - 节点核心文本必须使用节点的 \`name\`。
   - 如果节点有 \`description\`，请在节点换行追加其简短描述。
   - 如果节点角色是 "CONTROLLER" 且包含 \`apiRoutes\`，请在节点上显著标注 \`[HTTP API]\`。
   - 如果节点角色是 "ENTITY" 且包含 \`tableName\`，请以 \`[(表: xxx)]\` 的圆柱体或其他合适的数据库形状展示。
5. 关系连线绘制：
   - 严格按照 \`relationships\` 数组中的定义连线，从 \`sourceId\` 指向 \`targetId\`。
   - 决不能臆造不存在的关系。
   - 可以在连线上标注 \`type\` 的值（如 DEPENDS_ON, USES）。
6. 可视化美化：请根据 \`layer\` 或 \`role\` 使用 \`classDef\` 为节点上色（例如 API 层用淡蓝色，DATA 层用淡绿色，MIDDLEWARE 用醒目的橙色或紫色），使架构图更加清晰专业。

【架构摘要】
- 项目名称：${arch.name}
- 检测到的层次：${layerList}
- 组件总数：${componentCount} 个
- 组件间关系：${linkCount} 条
- 外部中间件：${externalList}

【项目架构 JSON 数据如下】
\`\`\`json
${JSON.stringify(arch, null, 2)}
\`\`\``

                await sendMessage(prompt)
                toast.success(`分析完成！检测到 ${componentCount} 个组件，正在生成架构图...`, { id: toastId })
            } else {
                toast.error(res.message || "项目解析失败，请检查是否上传了有效的 Spring Boot ZIP", { id: toastId })
            }
        } catch (error) {
            console.error("代码上传错误:", error)
            toast.error("项目上传失败，请重试", { id: toastId })
        } finally {
            if (fileInputCodeRef.current) fileInputCodeRef.current.value = ""
        }
    }

    const handleSqlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const toastId = toast.loading("正在解析 SQL DDL 文件，请稍候...")
        try {
            const res = await parseSql({}, file)
            if (res.code === 0 && res.data) {
                const tables = res.data
                const tableCount = tables.length
                const tableNames = tables.map((t: any) => t.tableName).join("、")

                const prompt = `你现在是一位资深的数据库架构师。我使用 SQL DDL 解析器提取了数据库的结构元数据（包含表定义、字段信息、主外键约束和索引信息）。

请根据我提供的 JSON 数据，使用 drawio 语法绘制一张专业的【数据库实体关系图（ER 图 / ERD）】。

【绘图严格要求】
1. 图表类型：使用 \`drawio可以识别的xml代码\`（自动布局，避免连线交叉）。
2. 表格样式：每张表使用 Draw.io 内置的 **table/tableRow** 样式（shape=table），严格展示：
   - 表名（加粗，作为表头）
   - 每列：列名 | 数据类型 | 约束标注（PK 用 🔑 标注，FK 用 🔗 标注，NOT NULL 用 * 标注，UNIQUE 用 ◇ 标注）
   - 如有表注释（comment），在表头下方以斜体副标题展示。
3. 关系连线绘制：
   - 根据语义推断 JSON 数据中的外键（foreignKey）定义连线，从外键所在表指向被引用表。
   - 决不能臆造不存在的外键关系。
   - 使用 Draw.io 的 ERone / ERmany 连接端样式体现一对一、一对多关系。
   - 在连线上标注外键字段名。
4. 表分类着色（根据表的角色/被引用程度进行区分）：
   - 主表（被多张表通过外键引用）→ 表头填充 #d5e8d4（绿色），绿色边框 #82b366
   - 关联/中间表（同时拥有多个外键）→ 表头填充 #fff2cc（黄色），橙色边框 #d6b656
   - 普通业务表 → 表头填充 #dae8fc（蓝色），蓝色边框 #6c8ebf
5. 布局原则：有直接外键关联的表靠近排列；每张表宽度 220px，行高 28px。

【数据库摘要】
- 共 ${tableCount} 张表：${tableNames}

【SQL 解析 JSON 数据如下】
\`\`\`json
${JSON.stringify(tables, null, 2)}
\`\`\``

                await sendMessage(prompt)
                toast.success(`解析完成！共 ${tableCount} 张表，正在生成 ER 图...`, { id: toastId })
            } else {
                toast.error(res.message || "SQL 解析失败，请检查文件格式是否为标准 DDL", { id: toastId })
            }
        } catch (error) {
            console.error("SQL上传错误:", error)
            toast.error("SQL 文件上传失败，请重试", { id: toastId })
        } finally {
            if (fileInputSqlRef.current) fileInputSqlRef.current.value = ""
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!input.trim() && files.length === 0) || isLoading) return
        if (requireLogin("AI 对话")) return
        
        let messageContent = input.trim()
        
        // Process files if any
        if (files.length > 0) {
            const filePrompts: string[] = []
            
            for (const file of files) {
                const data = pdfData.get(file)
                if (data && !data.isExtracting) {

                    filePrompts.push(`\n\n[文件上下文: ${file.name}]\n${data.text}\n`)
                } else if (data && data.isExtracting) {
                    toast.warning(`正在处理文件 ${file.name}，请稍候...`)
                    return
                }
            }
            
            if (filePrompts.length > 0) {
                const combinedPrompt = filePrompts.join("\n")
                // If user didn't type anything, use a default prompt
                if (!messageContent) {
                    messageContent = "请分析上传的代码/文件内容。"
                }
                messageContent = `${messageContent}\n\n${combinedPrompt}`
            }
        }

        setInput("")
        setFiles([]) // Clear files after sending
        await sendMessage(messageContent)
    }

    const handleClearChat = () => {
        if (requireLogin("清空对话")) return
        clearMessages()
    }

    // --- 修复后的保存逻辑 ---
    const handleSaveDiagram = async () => {
        if (isSaving) return

        const isLogin = loginUser?.id && loginUser?.userRole !== "notLogin"
        if (!isLogin) {
            toast.error("请先登录后再保存图表")
            return
        }

        setIsSaving(true)

        try {
            // 🔧 关键修复：先导出最新的 XML，而不是使用缓存的 chartXML
            // 这样才能获取 Draw.io 中的最新修改
            toast.loading("正在获取最新图表数据...", { id: "save-diagram" })

            const latestXML = await Promise.race([
                new Promise<string>((resolve) => {
                    // 设置 resolver 来接收导出结果
                    if (resolverRef && "current" in resolverRef) {
                        resolverRef.current = resolve
                    }
                    // 触发导出（不保存到历史记录）
                    handleExportWithoutHistory()
                }),
                new Promise<string>((_, reject) =>
                    setTimeout(
                        () => reject(new Error("导出超时（10秒）")),
                        10000,
                    ),
                ),
            ])

            console.log(
                "[handleSaveDiagram] 获取到最新 XML:",
                latestXML?.substring(0, 100),
            )

            // 构造超时 Promise (15秒)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error("保存请求超时，请检查网络"))
                }, 15000)
            })

            // 竞速：保存逻辑 vs 超时
            const saveResult = await Promise.race([
                saveDiagramToServer({
                    diagramId: diagramId,
                    userId: loginUser?.id || "",
                    title: diagramTitle,
                    xml: latestXML || "", // ✅ 使用最新导出的 XML
                }),
                timeoutPromise,
            ])

            // saveDiagramToServer 内部已经显示了 toast.success，这里只需要重置状态
            // 但如果返回 false（保存失败但未抛出错误），需要额外处理
            if (saveResult === false) {
                throw new Error("保存失败，请重试")
            }

            // 保存成功，重置未保存状态
            setHasUnsavedChanges(false)
        } catch (error) {
            console.error("保存图表异常:", error)
            toast.error(
                error instanceof Error ? error.message : "保存失败，请稍后重试",
            )
        } finally {
            // 无论成功失败，1秒后恢复按钮
            setTimeout(() => {
                setIsSaving(false)
            }, 1000)
        }
    }

    if (!isVisible) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm border-l border-white/10">
                <button
                    onClick={onToggleVisibility}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110"
                    title="显示聊天面板"
                >
                    <MessageSquare className="h-5 w-5 text-white" />
                </button>
                <div className="text-xs text-white/70 mt-2 font-medium">AI</div>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 rounded-r-2xl overflow-hidden relative">
            {/* 顶部工具栏 */}
            <div className="flex-shrink-0 flex items-center justify-between px-2 py-3 border-b border-white/10 bg-black/20 z-10">
                <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                    <MessageSquare className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <h2 className="text-sm font-semibold text-white whitespace-nowrap">
                        AI 对话
                    </h2>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <CollaborationPanel spaceId={spaceId} />

                    <button
                        onClick={() => { if (!requireLogin("保存图表")) handleSaveDiagram() }}
                        disabled={isSaving || !chartXML}
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 border flex-shrink-0
                            ${
                                isSaving || !chartXML
                                    ? "bg-gray-500/10 text-gray-500 border-transparent cursor-not-allowed opacity-50"
                                    : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 border-blue-500/30"
                            }`}
                        title={isSaving ? "正在保存..." : "保存图表"}
                    >
                        {isSaving ? (
                            <span className="animate-spin h-4 w-4 block border-2 border-current border-t-transparent rounded-full text-blue-400" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                    </button>

                    <button
                        onClick={() => { if (!requireLogin("AI 模型配置")) setConfigDialogOpen(true) }}
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 flex-shrink-0 ${
                            aiConfig.mode === "custom"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                        }`}
                        title={
                            aiConfig.mode === "custom"
                                ? "自定义AI已配置"
                                : "配置AI模型"
                        }
                    >
                        <Settings className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => { if (!requireLogin("下载图表")) setDownloadDialogOpen(true) }}
                        className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 hover:scale-105 flex-shrink-0"
                        title="下载图表"
                    >
                        <Download className="h-4 w-4" />
                    </button>

                    <button
                        onClick={handleClearChat}
                        disabled={messages.length === 0}
                        className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                        title="清空对话"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="w-px h-5 bg-white/10 flex-shrink-0"></div>

                    <button
                        onClick={onToggleVisibility}
                        className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 hover:scale-105 flex-shrink-0"
                        title="隐藏面板"
                    >
                        <Square className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 relative min-h-0 w-full">
                <div className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-transparent to-black/20 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    <div className="p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full pt-10 px-4">
                                <div className="text-center mb-8">
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        AI 图表助手
                                    </h3>
                                    <p className="text-white/60 text-sm">
                                        选择下方示例或直接输入需求
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                                    <button
                                        onClick={() =>
                                            sendMessage(
                                                "请帮我生成一个标准的 Ruoyi 框架架构图，包含表现层、业务层、数据层和基础层。请直接输出 Draw.io 支持的 XML 代码。",
                                            )
                                        }
                                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-200 text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-500/30 transition-colors">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                                                Ruoyi 架构图
                                            </div>
                                            <div className="text-xs text-white/50 mt-0.5">
                                                生成标准的分层架构视图
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() =>
                                            sendMessage(
                                                "请生成一个标准的用户登录流程图，包含输入账号密码、验证码校验、Token生成和返回用户信息等步骤。",
                                            )
                                        }
                                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-200 text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:text-purple-300 group-hover:bg-purple-500/30 transition-colors">
                                            <FileCode className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                                                用户登录流程
                                            </div>
                                            <div className="text-xs text-white/50 mt-0.5">
                                                包含验证和Token生成的流程
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() =>
                                            sendMessage(
                                                "请生成一个电商支付业务的时序图，包含用户、API网关、订单服务、支付服务和银行接口的交互。",
                                            )
                                        }
                                        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-green-500/30 transition-all duration-200 text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 group-hover:text-green-300 group-hover:bg-green-500/30 transition-colors">
                                            <Send className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white group-hover:text-green-300 transition-colors">
                                                支付业务时序图
                                            </div>
                                            <div className="text-xs text-white/50 mt-0.5">
                                                多服务交互的时序逻辑
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        message.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[90%] rounded-xl px-4 py-3 shadow-lg ${
                                            message.role === "user"
                                                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                                                : "bg-white/10 backdrop-blur-sm text-white border border-white/10"
                                        }`}
                                    >
                                        <div className="text-xs font-medium mb-1.5 opacity-70">
                                            {message.role === "user"
                                                ? "你"
                                                : "AI 助手"}
                                        </div>
                                        <div className="text-sm leading-relaxed markdown-content">
                                            {message.content ? (
                                                <>
                                                    {/* 渲染深度思考模块 */}
                                                    <ThinkingBlock
                                                        content={
                                                            message.content
                                                        }
                                                        defaultOpen={false}
                                                    />
                                                    {/* 渲染主要消息内容（移除思考标签后的内容） */}
                                                    <ReactMarkdown
                                                        remarkPlugins={[
                                                            remarkGfm,
                                                        ]}
                                                        components={{
                                                            code({
                                                                node,
                                                                className,
                                                                children,
                                                                ...props
                                                            }: any) {
                                                                const { inline } = props
                                                                const match =
                                                                    /language-(\w+)/.exec(
                                                                        className ||
                                                                            "",
                                                                    )
                                                                const language =
                                                                    match
                                                                        ? match[1]
                                                                        : "text"
                                                                if (
                                                                    !inline &&
                                                                    match
                                                                ) {
                                                                    const codeContent =
                                                                        String(
                                                                            children,
                                                                        ).replace(
                                                                            /\n$/,
                                                                            "",
                                                                        )
                                                                    const isLongCode =
                                                                        codeContent.length >
                                                                        500
                                                                    return (
                                                                        <Collapsible
                                                                            defaultOpen={
                                                                                !isLongCode
                                                                            }
                                                                        >
                                                                            <div className="my-2 rounded-lg overflow-hidden border border-white/10 bg-black/30">
                                                                                <CollapsibleTrigger className="w-full px-3 py-1.5 bg-black/40 border-b border-white/10 flex items-center justify-between hover:bg-black/50 transition-colors">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Code className="h-3.5 w-3.5 text-blue-400" />
                                                                                        <span className="text-xs text-white/60 font-mono">
                                                                                            {
                                                                                                language
                                                                                            }
                                                                                        </span>
                                                                                        {isLongCode && (
                                                                                            <span className="text-xs text-white/40">
                                                                                                (
                                                                                                {
                                                                                                    codeContent.length
                                                                                                }{" "}
                                                                                                字符)
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    {isLongCode && (
                                                                                        <div className="flex items-center gap-1 text-white/60">
                                                                                            <ChevronDown className="h-4 w-4" />
                                                                                        </div>
                                                                                    )}
                                                                                </CollapsibleTrigger>
                                                                                <CollapsibleContent>
                                                                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                                                        <CodeBlock
                                                                                            code={
                                                                                                codeContent
                                                                                            }
                                                                                            language={
                                                                                                language as
                                                                                                    | "xml"
                                                                                                    | "json"
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                </CollapsibleContent>
                                                                            </div>
                                                                        </Collapsible>
                                                                    )
                                                                }
                                                                return (
                                                                    <code
                                                                        className="bg-white/10 px-1.5 py-0.5 rounded text-blue-300 text-sm break-all"
                                                                        {...props}
                                                                    >
                                                                        {
                                                                            children
                                                                        }
                                                                    </code>
                                                                )
                                                            },
                                                            p: ({
                                                                children,
                                                            }) => (
                                                                <p className="mb-2 text-white/90 break-words">
                                                                    {children}
                                                                </p>
                                                            ),
                                                            a: ({
                                                                href,
                                                                children,
                                                            }) => (
                                                                <a
                                                                    href={href}
                                                                    className="text-blue-400 hover:text-blue-300 underline"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {children}
                                                                </a>
                                                            ),
                                                        }}
                                                    >
                                                        {removeThinkingTags(
                                                            message.content,
                                                        )}
                                                    </ReactMarkdown>
                                                </>
                                            ) : (
                                                <span className="text-white/40 italic flex items-center gap-2">
                                                    <span className="text-sm">正在生成中，请稍候</span>
                                                    <span className="flex gap-1">
                                                        <span className="animate-pulse">●</span>
                                                        <span className="animate-pulse delay-75">●</span>
                                                        <span className="animate-pulse delay-150">●</span>
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        {error && (
                            <div className="bg-red-500/20 backdrop-blur-sm text-red-200 border border-red-500/30 p-4 rounded-xl">
                                <p className="text-sm">{error.message}</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>
                </div>
            </div>

            {/* 底部输入框 */}
            <div className="flex-shrink-0 border-t border-white/10 bg-black/20 z-10">
                {/* 智能分析快捷工具条 */}
                <div className="px-3 pt-3 pb-2">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Zap className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-white/40 font-medium">智能分析</span>
                    </div>
                    <div className="flex gap-2">
                        {/* Spring Boot 架构图按钮 */}
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => { if (!requireLogin("Spring Boot 架构图分析")) fileInputCodeRef.current?.click() }}
                            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 group
                                bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400/50
                                disabled:opacity-40 disabled:cursor-not-allowed"
                            title="上传 Spring Boot ZIP 压缩包，自动分析并生成架构图"
                        >
                            <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                                <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            <div className="text-left min-w-0">
                                <div className="text-xs font-semibold text-emerald-300 leading-tight">Spring Boot 架构图</div>
                                <div className="text-[10px] text-white/40 leading-tight truncate">上传 .zip → 自动生成分层架构图</div>
                            </div>
                        </button>

                        {/* SQL ER 图按钮 */}
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => { if (!requireLogin("SQL ER 图分析")) fileInputSqlRef.current?.click() }}
                            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 group
                                bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-400/50
                                disabled:opacity-40 disabled:cursor-not-allowed"
                            title="上传 SQL DDL 文件，自动解析并生成 ER 图"
                        >
                            <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/30 transition-colors">
                                <Database className="h-3.5 w-3.5 text-violet-400" />
                            </div>
                            <div className="text-left min-w-0">
                                <div className="text-xs font-semibold text-violet-300 leading-tight">SQL ER 图</div>
                                <div className="text-[10px] text-white/40 leading-tight truncate">上传 .sql → 自动生成实体关系图</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="px-3 pb-3">
                    {/* File Previews */}
                    {files.length > 0 && (
                        <div className="mb-2">
                            <FilePreviewList
                                files={files}
                                onRemoveFile={(file) => setFiles(files.filter(f => f !== file))}
                                pdfData={pdfData}
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onFocus={() => { if (onRequireLogin) onRequireLogin("AI 对话") }}
                            placeholder={onRequireLogin ? "登录后即可使用 AI 对话..." : "输入你的问题..."}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 text-sm"
                        />
                        {isLoading ? (
                            <Button
                                type="button"
                                onClick={stop}
                                className="px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                            >
                                <Square className="h-4 w-4 mr-2" />
                                停止
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={!input.trim() && files.length === 0}
                                className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg font-semibold"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                发送
                            </Button>
                        )}
                    </form>
                </div>
            </div>

            <AIConfigDialog
                open={configDialogOpen}
                onOpenChange={setConfigDialogOpen}
                config={aiConfig}
                onConfigChange={setAiConfig}
            />

            <DownloadDialog
                open={downloadDialogOpen}
                onOpenChange={setDownloadDialogOpen}
                onDownload={handleDownload}
                defaultFilename={diagramTitle}
            />

            {/* Hidden file inputs for Code/SQL analysis */}
            <input
                type="file"
                ref={fileInputCodeRef}
                className="hidden"
                accept=".zip"
                onChange={handleCodeUpload}
            />
            <input
                type="file"
                ref={fileInputSqlRef}
                className="hidden"
                accept=".sql"
                onChange={handleSqlUpload}
            />
        </div>
    )
}
