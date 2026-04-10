"use client"

import {
    ChevronDown,
    Code,
    Database,
    Download,
    FileCode,
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
import { parseSql, uploadAndAnalyzeSimple } from "@/api/codeParser"
import { listDiagramChatHistory } from "@/api/conversionController"
import { AIConfigDialog, useAIConfig } from "@/components/ai-config-dialog"
import { CodeBlock } from "@/components/code-block"
import { CollaborationPanel } from "@/components/collaboration-panel"
import { DownloadDialog } from "@/components/download-dialog"
import { FilePreviewList } from "@/components/file-preview-list"
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
import { parseXmlAndLoadDiagram } from "@/lib/utils"
import type { RootState } from "@/stores"

interface SimpleChatPanelProps {
    diagramId: string
    isVisible: boolean
    onToggleVisibility: () => void
    darkMode: boolean
    diagramTitle: string
    spaceId?: number | string
    /** 免费试用模式：无需登录，不加载历史，不显示保存/协作等功能 */
    freeTrial?: boolean
    onRequireLogin?: (featureName: string) => void
}

export default function SimpleChatPanel({
    diagramId,
    isVisible,
    onToggleVisibility,
    darkMode,
    diagramTitle,
    spaceId,
    freeTrial = false,
    onRequireLogin,
}: SimpleChatPanelProps) {
    const [input, setInput] = useState("")
    const [historyLoaded, setHistoryLoaded] = useState(false)
    const [configDialogOpen, setConfigDialogOpen] = useState(false)
    const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Helper: gate actions behind login
    const requireLogin = (featureName: string, action?: () => void): boolean => {
        if (onRequireLogin) {
            onRequireLogin(featureName)
            return true
        }
        action?.()
        return false
    }

    // File upload
    const { files, pdfData, handleFileChange, setFiles } = useFileProcessor()

    // AI config
    const [aiConfig, setAiConfig] = useAIConfig()

    // Diagram context
    const {
        loadDiagram,
        drawioRef,
        chartXML,
        registerExportCallback,
        handleExportWithoutHistory,
        resolverRef,
        setHasUnsavedChanges,
    } = useDiagram()

    // Diagram save
    const {
        saveDiagram: saveDiagramToServer,
        handleExportCallback,
        downloadDiagram,
    } = useDiagramSave(drawioRef)

    // Messages end ref
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const loginUser = useSelector((state: RootState) => state.loginUser)

    // Backend chat
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
        freeTrial,
        onMessageComplete: (fullContent) => {
            try {
                parseXmlAndLoadDiagram(fullContent, loadDiagram)
            } catch (err) {
                console.error("Failed to parse diagram XML:", err)
            }
        },
        onError: (err) => {
            console.error("Chat error:", err)
        },
    })

    // Load history (skip in free trial mode)
    useEffect(() => {
        // 免费试用模式不加载历史
        if (freeTrial) {
            setHistoryLoaded(true)
            return
        }

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
                            if (
                                conv.messageType !== "user" &&
                                (content.includes("✅ 图表已生成") ||
                                    content.includes("图表已生成")) &&
                                !content.includes("```xml") &&
                                chartXML
                            ) {
                                const mxfileMatch = chartXML.match(/<mxfile[\s\S]*?<\/mxfile>/)
                                if (mxfileMatch) {
                                    content = content.replace(
                                        /✅ 图表已生成|图表已生成/g,
                                        `\`\`\`xml\n${mxfileMatch[0]}\n\`\`\`\n\n✅ 图表已生成`,
                                    )
                                }
                            }
                            return {
                                id: `history-${conv.id}`,
                                role: conv.messageType === "user" ? "user" : "assistant",
                                content: content,
                                timestamp: new Date(conv.createTime || 0).getTime(),
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
    }, [diagramId, historyLoaded, setMessages, chartXML, freeTrial])

    // Auto scroll
    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
        return () => clearTimeout(timer)
    }, [messages])

    // Register export callback
    useEffect(() => {
        registerExportCallback(handleExportCallback)
        return () => registerExportCallback(null)
    }, [registerExportCallback, handleExportCallback])

    // Download handler
    const handleDownload = async (format: "xml" | "png" | "svg") => {
        try {
            await downloadDiagram({
                diagramId: diagramId,
                filename: diagramTitle || "diagram",
                format: format.toUpperCase() as "PNG" | "SVG" | "XML",
            })
        } catch (error) {
            console.error("下载失败:", error)
            toast.error(error instanceof Error ? error.message : "下载失败，请稍后重试")
        }
    }

    // File input refs
    const fileInputCodeRef = useRef<HTMLInputElement>(null)
    const fileInputSqlRef = useRef<HTMLInputElement>(null)

    // Handle code upload
    const handleCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const toastId = toast.loading("正在分析 Spring Boot 项目，请稍候...")
        try {
            const res = await uploadAndAnalyzeSimple({}, file)
            if (res.code === 0 && res.data) {
                const arch = res.data
                const prompt = `我上传了 Spring Boot 项目的架构数据。请生成 Draw.io XML 代码绘制系统架构图。\n\n\`\`\`json\n${JSON.stringify(arch, null, 2)}\n\`\`\``
                await sendMessage(prompt)
                toast.success(`分析完成！检测到 ${arch.components?.length ?? 0} 个组件`, { id: toastId })
            } else {
                toast.error(res.message || "项目解析失败", { id: toastId })
            }
        } catch (error) {
            console.error("代码上传错误:", error)
            toast.error("项目上传失败，请重试", { id: toastId })
        } finally {
            if (fileInputCodeRef.current) fileInputCodeRef.current.value = ""
        }
    }

    // Handle SQL upload
    const handleSqlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const toastId = toast.loading("正在解析 SQL DDL 文件，请稍候...")
        try {
            const res = await parseSql({}, file)
            if (res.code === 0 && res.data) {
                const tables = res.data
                const prompt = `我上传了数据库 DDL 解析数据。请生成 Draw.io XML 代码绘制 ER 图。\n\n\`\`\`json\n${JSON.stringify(tables, null, 2)}\n\`\`\``
                await sendMessage(prompt)
                toast.success(`解析完成！共 ${tables.length} 张表`, { id: toastId })
            } else {
                toast.error(res.message || "SQL 解析失败", { id: toastId })
            }
        } catch (error) {
            console.error("SQL上传错误:", error)
            toast.error("SQL 文件上传失败，请重试", { id: toastId })
        } finally {
            if (fileInputSqlRef.current) fileInputSqlRef.current.value = ""
        }
    }

    // Form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!input.trim() && files.length === 0) || isLoading) return
        // 免费试用模式不需要登录检查
        if (!freeTrial && requireLogin("AI 对话")) return

        let messageContent = input.trim()
        if (files.length > 0) {
            const filePrompts: string[] = []
            for (const file of files) {
                const data = pdfData.get(file)
                if (data && !data.isExtracting) {
                    filePrompts.push(`\n\n[文件上下文: ${file.name}]\n${data.text}\n`)
                } else if (data?.isExtracting) {
                    toast.warning(`正在处理文件 ${file.name}，请稍候...`)
                    return
                }
            }
            if (filePrompts.length > 0) {
                const combinedPrompt = filePrompts.join("\n")
                if (!messageContent) {
                    messageContent = "请分析上传的代码/文件内容。"
                }
                messageContent = `${messageContent}\n\n${combinedPrompt}`
            }
        }

        setInput("")
        setFiles([])
        await sendMessage(messageContent)
    }

    // Clear chat
    const handleClearChat = () => {
        // 免费试用模式不需要登录检查
        if (!freeTrial && requireLogin("清空对话")) return
        clearMessages()
    }

    // Save diagram
    const handleSaveDiagram = async () => {
        if (isSaving) return

        const isLogin = loginUser?.id && loginUser?.userRole !== "notLogin"
        if (!isLogin) {
            toast.error("请先登录后再保存图表")
            return
        }

        setIsSaving(true)

        try {
            toast.loading("正在获取最新图表数据...", { id: "save-diagram" })

            const latestXML = await Promise.race([
                new Promise<string>((resolve) => {
                    if (resolverRef && "current" in resolverRef) {
                        resolverRef.current = resolve
                    }
                    handleExportWithoutHistory()
                }),
                new Promise<string>((_, reject) =>
                    setTimeout(() => reject(new Error("导出超时（10秒）")), 10000),
                ),
            ])

            const saveResult = await Promise.race([
                saveDiagramToServer({
                    diagramId: diagramId,
                    userId: loginUser?.id || "",
                    title: diagramTitle,
                    xml: latestXML || "",
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("保存请求超时，请检查网络")), 15000),
                ),
            ])

            if (saveResult === false) {
                throw new Error("保存失败，请重试")
            }

            setHasUnsavedChanges(false)
        } catch (error) {
            console.error("保存图表异常:", error)
            toast.error(error instanceof Error ? error.message : "保存失败，请稍后重试")
        } finally {
            setTimeout(() => setIsSaving(false), 1000)
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
            {/* Top toolbar */}
            <div className="flex-shrink-0 flex items-center justify-between px-2 py-3 border-b border-white/10 bg-black/20 z-10">
                <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                    <MessageSquare className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <h2 className="text-sm font-semibold text-white whitespace-nowrap">AI 对话</h2>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* 协作面板 - 免费试用模式隐藏 */}
                    {!freeTrial && <CollaborationPanel spaceId={spaceId} />}

                    {/* 保存按钮 - 免费试用模式隐藏 */}
                    {!freeTrial && (
                        <button
                            onClick={() => { if (!requireLogin("保存图表")) handleSaveDiagram() }}
                            disabled={isSaving || !chartXML}
                            className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 border flex-shrink-0
                                ${isSaving || !chartXML
                                    ? "bg-gray-500/10 text-gray-500 border-transparent cursor-not-allowed opacity-50"
                                    : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 border-blue-500/30"}`}
                            title={isSaving ? "正在保存..." : "保存图表"}
                        >
                            {isSaving ? (
                                <span className="animate-spin h-4 w-4 block border-2 border-current border-t-transparent rounded-full text-blue-400" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                        </button>
                    )}

                    {/* AI 配置按钮 - 免费试用模式隐藏 */}
                    {!freeTrial && (
                        <button
                            onClick={() => { if (!requireLogin("AI 模型配置")) setConfigDialogOpen(true) }}
                            className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 flex-shrink-0 ${
                                aiConfig.mode === "custom"
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                            }`}
                            title={aiConfig.mode === "custom" ? "自定义AI已配置" : "配置AI模型"}
                        >
                            <Settings className="h-4 w-4" />
                        </button>
                    )}

                    {/* 下载按钮 - 免费试用模式显示但需要登录 */}
                    <button
                        onClick={() => { if (!requireLogin("下载图表")) setDownloadDialogOpen(true) }}
                        className="p-1.5 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 hover:scale-105 flex-shrink-0"
                        title="下载图表"
                    >
                        <Download className="h-4 w-4" />
                    </button>

                    {/* 清空对话按钮 */}
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

            {/* Messages list */}
            <div className="flex-1 relative min-h-0 w-full">
                <div className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-transparent to-black/20 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    <div className="p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full pt-10 px-4">
                                <div className="text-center mb-8">
                                    <h3 className="text-lg font-semibold text-white mb-2">AI 图表助手</h3>
                                    <p className="text-white/60 text-sm">选择下方示例或直接输入需求</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                                    <ExampleButton
                                        icon={<Database className="w-5 h-5" />}
                                        title="Ruoyi 架构图"
                                        description="生成标准的分层架构视图"
                                        onClick={() => sendMessage("请生成一个标准的 Ruoyi 框架架构图，包含表现层、业务层、数据层和基础层。请直接输出 Draw.io 支持的 XML 代码。")}
                                        colorClass="blue"
                                    />
                                    <ExampleButton
                                        icon={<FileCode className="w-5 h-5" />}
                                        title="用户登录流程"
                                        description="包含验证和Token生成的流程"
                                        onClick={() => sendMessage("请生成一个标准的用户登录流程图，包含输入账号密码、验证码校验、Token生成和返回用户信息等步骤。")}
                                        colorClass="purple"
                                    />
                                    <ExampleButton
                                        icon={<Send className="w-5 h-5" />}
                                        title="支付业务时序图"
                                        description="多服务交互的时序逻辑"
                                        onClick={() => sendMessage("请生成一个电商支付业务的时序图，包含用户、API网关、订单服务、支付服务和银行接口的交互。")}
                                        colorClass="green"
                                    />
                                </div>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[90%] rounded-xl px-4 py-3 shadow-lg ${
                                            message.role === "user"
                                                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                                                : "bg-white/10 backdrop-blur-sm text-white border border-white/10"
                                        }`}
                                    >
                                        <MessageContent message={message} />
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

            {/* Bottom input */}
            <div className="flex-shrink-0 border-t border-white/10 bg-black/20 z-10">
                {/* Smart analysis toolbar */}
                <div className="px-3 pt-3 pb-2">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Zap className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-white/40 font-medium">智能分析</span>
                    </div>
                    <div className="flex gap-2">
                        <SmartButton
                            icon={<FileCode className="h-3.5 w-3.5" />}
                            title="Spring Boot 架构图"
                            description="上传 .zip → 自动生成分层架构图"
                            disabled={isLoading}
                            onClick={() => {
                                if (freeTrial || !requireLogin("Spring Boot 架构图分析")) {
                                    fileInputCodeRef.current?.click()
                                }
                            }}
                            colorClass="emerald"
                        />
                        <SmartButton
                            icon={<Database className="h-3.5 w-3.5" />}
                            title="SQL ER 图"
                            description="上传 .sql → 自动生成实体关系图"
                            disabled={isLoading}
                            onClick={() => {
                                if (freeTrial || !requireLogin("SQL ER 图分析")) {
                                    fileInputSqlRef.current?.click()
                                }
                            }}
                            colorClass="violet"
                        />
                    </div>
                </div>

                <div className="px-3 pb-3">
                    {files.length > 0 && (
                        <div className="mb-2">
                            <FilePreviewList
                                files={files}
                                onRemoveFile={(file) => setFiles(files.filter((f) => f !== file))}
                                pdfData={pdfData}
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onFocus={() => {
                                // 免费试用模式不需要登录提示
                                if (!freeTrial && onRequireLogin) {
                                    onRequireLogin("AI 对话")
                                }
                            }}
                            placeholder={freeTrial ? "输入你的问题，体验 AI 绘图..." : (onRequireLogin ? "登录后即可使用 AI 对话..." : "输入你的问题...")}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 text-sm"
                        />
                        {isLoading ? (
                            <Button type="button" onClick={stop} className="px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl">
                                <Square className="h-4 w-4 mr-2" />
                                停止
                            </Button>
                        ) : (
                            <Button type="submit" disabled={!input.trim() && files.length === 0} className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg font-semibold">
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

            <input type="file" ref={fileInputCodeRef} className="hidden" accept=".zip" onChange={handleCodeUpload} />
            <input type="file" ref={fileInputSqlRef} className="hidden" accept=".sql" onChange={handleSqlUpload} />
        </div>
    )
}

// Example button component
function ExampleButton({
    icon,
    title,
    description,
    onClick,
    colorClass,
}: {
    icon: React.ReactNode
    title: string
    description: string
    onClick: () => void
    colorClass: "blue" | "purple" | "green"
}) {
    const colorMap = {
        blue: "bg-blue-500/20 text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-500/30 border-blue-500/30",
        purple: "bg-purple-500/20 text-purple-400 group-hover:text-purple-300 group-hover:bg-purple-500/30 border-purple-500/30",
        green: "bg-green-500/20 text-green-400 group-hover:text-green-300 group-hover:bg-green-500/30 border-green-500/30",
    }

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-${colorClass}-500/30 transition-all duration-200 text-left group"
        >
            <div className={`w-10 h-10 rounded-lg ${colorMap[colorClass]} flex items-center justify-center transition-colors`}>
                {icon}
            </div>
            <div>
                <div className={`text-sm font-medium text-white group-hover:text-${colorClass}-300 transition-colors`}>{title}</div>
                <div className="text-xs text-white/50 mt-0.5">{description}</div>
            </div>
        </button>
    )
}

// Smart button component
function SmartButton({
    icon,
    title,
    description,
    disabled,
    onClick,
    colorClass,
}: {
    icon: React.ReactNode
    title: string
    description: string
    disabled?: boolean
    onClick: () => void
    colorClass: "emerald" | "violet"
}) {
    const colorMap = {
        emerald: "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400/50 text-emerald-400",
        violet: "bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-400/50 text-violet-400",
    }

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 group ${colorMap[colorClass]} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
            <div className={`w-6 h-6 rounded-md bg-${colorClass}-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-${colorClass}-500/30 transition-colors`}>
                {icon}
            </div>
            <div className="text-left min-w-0">
                <div className="text-xs font-semibold leading-tight">{title}</div>
                <div className="text-[10px] text-white/40 leading-tight truncate">{description}</div>
            </div>
        </button>
    )
}

// Message content component
function MessageContent({ message }: { message: Message }) {
    if (!message.content) {
        return (
            <span className="text-white/40 italic flex items-center gap-2">
                <span className="text-sm">正在生成中，请稍候</span>
                <span className="flex gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse delay-75">●</span>
                    <span className="animate-pulse delay-150">●</span>
                </span>
            </span>
        )
    }

    return (
        <div className="text-sm leading-relaxed markdown-content">
            <ThinkingBlock content={message.content} defaultOpen={false} />
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "")
                        const language = match ? match[1] : "text"
                        if (!match) {
                            return (
                                <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-300 text-sm break-all" {...props}>
                                    {children}
                                </code>
                            )
                        }
                        const codeContent = String(children).replace(/\n$/, "")
                        const isLongCode = codeContent.length > 500
                        return (
                            <Collapsible defaultOpen={!isLongCode}>
                                <div className="my-2 rounded-lg overflow-hidden border border-white/10 bg-black/30">
                                    <CollapsibleTrigger className="w-full px-3 py-1.5 bg-black/40 border-b border-white/10 flex items-center justify-between hover:bg-black/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Code className="h-3.5 w-3.5 text-blue-400" />
                                            <span className="text-xs text-white/60 font-mono">{language}</span>
                                            {isLongCode && <span className="text-xs text-white/40">({codeContent.length} 字符)</span>}
                                        </div>
                                        {isLongCode && <ChevronDown className="h-4 w-4 text-white/60" />}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            <CodeBlock code={codeContent} language={language as "xml" | "json"} />
                                        </div>
                                    </CollapsibleContent>
                                </div>
                            </Collapsible>
                        )
                    },
                    p: ({ children }) => <p className="mb-2 text-white/90 break-words">{children}</p>,
                    a: ({ href, children }) => (
                        <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                            {children}
                        </a>
                    ),
                }}
            >
                {removeThinkingTags(message.content)}
            </ReactMarkdown>
        </div>
    )
}