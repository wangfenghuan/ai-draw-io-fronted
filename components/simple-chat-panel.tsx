"use client"

import { Button } from "antd"
import { MessageSquare, Send, Square } from "lucide-react"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import { listDiagramChatHistory } from "@/api/conversionController"
import type { API } from "@/api/typings"
import { useDiagram } from "@/contexts/diagram-context"
import { type Message, useBackendChat } from "@/lib/use-backend-chat"
import { parseXmlAndLoadDiagram } from "@/lib/utils"
import "highlight.js/styles/github-dark.css"

interface SimpleChatPanelProps {
    diagramId: string
    isVisible: boolean
    onToggleVisibility: () => void
    darkMode: boolean
}

export default function SimpleChatPanel({
    diagramId,
    isVisible,
    onToggleVisibility,
    darkMode,
}: SimpleChatPanelProps) {
    const [input, setInput] = useState("")
    const [historyLoaded, setHistoryLoaded] = useState(false)
    const { loadDiagram } = useDiagram()

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
        onMessageComplete: (fullContent) => {
            // 消息完成后，尝试解析 XML 并加载图表
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

    // 加载历史对话记录
    useEffect(() => {
        const loadHistory = async () => {
            if (!diagramId || historyLoaded) return

            try {
                console.log(
                    "[SimpleChatPanel] Loading history for diagram:",
                    diagramId,
                )
                const response = await listDiagramChatHistory({
                    diagramId: diagramId,
                    pageSize: "100",
                })

                if (response?.code === 0 && response?.data?.records) {
                    const conversions = response.data.records
                    console.log(
                        "[SimpleChatPanel] Loaded",
                        conversions.length,
                        "history records",
                    )

                    // 转换为前端消息格式
                    const historyMessages: Message[] = conversions
                        .filter((conv: API.Conversion) => !conv.isDelete)
                        .sort(
                            (a: API.Conversion, b: API.Conversion) =>
                                new Date(a.createTime || 0).getTime() -
                                new Date(b.createTime || 0).getTime(),
                        )
                        .map((conv: API.Conversion) => ({
                            id: `history-${conv.id}`,
                            role:
                                conv.messageType === "user"
                                    ? "user"
                                    : "assistant",
                            content: conv.message || "",
                            timestamp: new Date(conv.createTime || 0).getTime(),
                        }))

                    if (historyMessages.length > 0) {
                        setMessages(historyMessages)
                        console.log(
                            "[SimpleChatPanel] Restored",
                            historyMessages.length,
                            "messages",
                        )
                    }
                }
            } catch (err) {
                console.error("[SimpleChatPanel] Failed to load history:", err)
            } finally {
                setHistoryLoaded(true)
            }
        }

        loadHistory()
    }, [diagramId, historyLoaded, setMessages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput("")
        await sendMessage(userMessage)
    }

    const handleClearChat = () => {
        clearMessages()
    }

    // 简化的折叠视图
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
        <div className="h-full w-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 rounded-r-2xl">
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <h2 className="text-base font-semibold text-white">
                        AI 对话
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="small"
                        onClick={handleClearChat}
                        disabled={messages.length === 0}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 text-xs px-3 py-1 h-auto"
                    >
                        清空
                    </Button>
                    <button
                        onClick={onToggleVisibility}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200"
                        title="隐藏聊天面板"
                    >
                        <Square className="h-3.5 w-3.5 text-white/70 hover:text-white" />
                    </button>
                </div>
            </div>

            {/* 消息列表 - 可滚动区域 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gradient-to-b from-transparent to-black/20">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-3" />
                            <p className="text-white/60 text-sm">
                                开始与 AI 对话来生成图表
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-xl px-4 py-3 shadow-lg ${
                                    message.role === "user"
                                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                                        : "bg-white/10 backdrop-blur-sm text-white border border-white/10"
                                }`}
                            >
                                <div className="text-xs font-medium mb-1.5 opacity-70">
                                    {message.role === "user" ? "你" : "AI 助手"}
                                </div>
                                <div className="text-sm leading-relaxed markdown-content">
                                    {message.content ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeHighlight]}
                                            components={{
                                                // 代码块样式
                                                code({
                                                    node,
                                                    inline,
                                                    className,
                                                    children,
                                                    ...props
                                                }) {
                                                    const match =
                                                        /language-(\w+)/.exec(
                                                            className || "",
                                                        )
                                                    return !inline && match ? (
                                                        <code
                                                            className={
                                                                className
                                                            }
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    ) : (
                                                        <code
                                                            className="bg-white/10 px-1.5 py-0.5 rounded text-blue-300 text-sm"
                                                            {...props}
                                                        >
                                                            {children}
                                                        </code>
                                                    )
                                                },
                                                // 标题样式
                                                h1: ({ children }) => (
                                                    <h1 className="text-xl font-bold mt-4 mb-2 text-white">
                                                        {children}
                                                    </h1>
                                                ),
                                                h2: ({ children }) => (
                                                    <h2 className="text-lg font-bold mt-3 mb-2 text-white">
                                                        {children}
                                                    </h2>
                                                ),
                                                h3: ({ children }) => (
                                                    <h3 className="text-base font-bold mt-2 mb-1 text-white">
                                                        {children}
                                                    </h3>
                                                ),
                                                // 段落样式
                                                p: ({ children }) => (
                                                    <p className="mb-2 text-white/90">
                                                        {children}
                                                    </p>
                                                ),
                                                // 列表样式
                                                ul: ({ children }) => (
                                                    <ul className="list-disc list-inside mb-2 text-white/90">
                                                        {children}
                                                    </ul>
                                                ),
                                                ol: ({ children }) => (
                                                    <ol className="list-decimal list-inside mb-2 text-white/90">
                                                        {children}
                                                    </ol>
                                                ),
                                                li: ({ children }) => (
                                                    <li className="mb-1">
                                                        {children}
                                                    </li>
                                                ),
                                                // 引用样式
                                                blockquote: ({ children }) => (
                                                    <blockquote className="border-l-4 border-blue-400 pl-4 my-2 text-white/80 italic">
                                                        {children}
                                                    </blockquote>
                                                ),
                                                // 链接样式
                                                a: ({ href, children }) => (
                                                    <a
                                                        href={href}
                                                        className="text-blue-400 hover:text-blue-300 underline"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {children}
                                                    </a>
                                                ),
                                                // 表格样式
                                                table: ({ children }) => (
                                                    <div className="overflow-x-auto my-2">
                                                        <table className="min-w-full border border-white/20">
                                                            {children}
                                                        </table>
                                                    </div>
                                                ),
                                                thead: ({ children }) => (
                                                    <thead className="bg-white/10">
                                                        {children}
                                                    </thead>
                                                ),
                                                th: ({ children }) => (
                                                    <th className="border border-white/20 px-3 py-1 text-left text-white">
                                                        {children}
                                                    </th>
                                                ),
                                                td: ({ children }) => (
                                                    <td className="border border-white/20 px-3 py-1 text-white/90">
                                                        {children}
                                                    </td>
                                                ),
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    ) : (
                                        <span className="text-white/40 italic">
                                            正在生成...
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {error && (
                    <div className="bg-red-500/20 backdrop-blur-sm text-red-200 border border-red-500/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2">
                            <Square className="h-4 w-4" />
                            <span className="font-medium text-sm">错误</span>
                        </div>
                        <p className="text-sm mt-1">{error.message}</p>
                    </div>
                )}
            </div>

            {/* 输入框 */}
            <div className="p-4 border-t border-white/10 bg-black/20 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="输入你的问题..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 text-sm"
                    />
                    {isLoading ? (
                        <Button
                            type="button"
                            onClick={stop}
                            danger
                            className="px-5 bg-red-600 hover:bg-red-700 border-red-700 text-white rounded-xl"
                        >
                            <Square className="h-4 w-4 mr-2" />
                            停止
                        </Button>
                    ) : (
                        <Button
                            type="primary"
                            htmlType="submit"
                            disabled={!input.trim()}
                            className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg font-semibold border-blue-700"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            发送
                        </Button>
                    )}
                </form>
            </div>
        </div>
    )
}
