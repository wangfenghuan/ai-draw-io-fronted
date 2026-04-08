"use client"

import {
    AlertTriangle,
    MessageSquarePlus,
    PanelRightClose,
    PanelRightOpen,
    Settings,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { FaGithub } from "react-icons/fa"
import { useSelector } from "react-redux"
import { Toaster, toast } from "sonner"
import { parseSql, uploadAndAnalyzeSimple } from "@/api/codeParser"
import { listDiagramChatHistory } from "@/api/conversionController"
import { ButtonWithTooltip } from "@/components/button-with-tooltip"
import { ChatInput } from "@/components/chat-input"
import { ResetWarningModal } from "@/components/reset-warning-modal"
import { SettingsDialog } from "@/components/settings-dialog"
import { useDiagram } from "@/contexts/diagram-context"
import { type Message, useBackendChat } from "@/lib/use-backend-chat"
import { useFileProcessor } from "@/lib/use-file-processor"
import { useQuotaManager } from "@/lib/use-quota-manager"
import { parseXmlAndLoadDiagram } from "@/lib/utils"
import type { RootState } from "@/stores"
import { ChatMessageDisplay } from "./chat-message-display"

// localStorage keys for persistence
const STORAGE_MESSAGES_KEY = "next-ai-draw-io-messages"
const STORAGE_XML_SNAPSHOTS_KEY = "next-ai-draw-io-xml-snapshots"
const STORAGE_SESSION_ID_KEY = "next-ai-draw-io-session-id"
export const STORAGE_DIAGRAM_XML_KEY = "next-ai-draw-io-diagram-xml"

// Type for message parts
interface MessagePart {
    type: string
    text?: string
    state?: string
    toolName?: string
    input?: { xml?: string; operations?: any[]; [key: string]: unknown }
    output?: string
    toolCallId?: string
    [key: string]: unknown
}

interface UIMessage {
    id: string
    role: "user" | "assistant" | "system"
    parts?: MessagePart[]
    content?: string
    createTime?: string
}

interface ChatPanelProps {
    isVisible: boolean
    onToggleVisibility: () => void
    drawioUi: "min" | "sketch"
    onToggleDrawioUi: () => void
    darkMode: boolean
    onToggleDarkMode: () => void
    isMobile?: boolean
    onCloseProtectionChange?: (enabled: boolean) => void
    diagramId?: string
}

const _DEBUG = process.env.NODE_ENV === "development"

export default function ChatPanel({
    isVisible,
    onToggleVisibility,
    drawioUi,
    onToggleDrawioUi,
    darkMode,
    onToggleDarkMode,
    isMobile = false,
    onCloseProtectionChange,
    diagramId,
}: ChatPanelProps) {
    const {
        loadDiagram: onDisplayChart,
        handleExport: onExport,
        handleExportWithoutHistory,
        resolverRef,
        chartXML,
        clearDiagram,
        isDrawioReady,
    } = useDiagram()

    // File input refs for Code/SQL analysis
    const fileInputCodeRef = useRef<HTMLInputElement>(null)
    const fileInputSqlRef = useRef<HTMLInputElement>(null)

    const handleCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const toastId = toast.loading("Analyzing Spring Boot project...")
        try {
            const res = await uploadAndAnalyzeSimple({}, file)
            if (res.code === 0 && res.data) {
                const prompt = `I have uploaded a Spring Boot project. Here is the simplified architecture analysis in JSON format:\n\n\`\`\`json\n${JSON.stringify(res.data, null, 2)}\n\`\`\`\n\nPlease analyze this architecture and generate **Draw.io compatible XML code** for an architecture diagram or class diagram. Ensure the XML code can be directly loaded and displayed by Draw.io. Focus on the Controller, Service, and Repository layers. Please wrap the XML code in \`\`\`xml and \`\`\` code blocks.`
                await sendMessage(prompt)
                toast.success("Analysis complete, generating diagram...", {
                    id: toastId,
                })
            } else {
                toast.error(res.message || "Analysis failed", { id: toastId })
            }
        } catch (error) {
            console.error("Code upload error:", error)
            toast.error("Failed to upload project", { id: toastId })
        } finally {
            if (fileInputCodeRef.current) fileInputCodeRef.current.value = ""
        }
    }

    const handleSqlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const toastId = toast.loading("Parsing SQL file...")
        try {
            const res = await parseSql({}, file)
            if (res.code === 0 && res.data) {
                const prompt = `I have uploaded a SQL DDL file. Here is the parsed schema structure in JSON format:\n\n\`\`\`json\n${JSON.stringify(res.data, null, 2)}\n\`\`\`\n\nPlease analyze this schema and generate **Draw.io compatible XML code** for an Entity Relationship (ER) diagram. Include all tables, columns, primary keys, and inferred relationships. Please wrap the XML code in \`\`\`xml and \`\`\` code blocks.`
                await sendMessage(prompt)
                toast.success("Parsing complete, generating ER diagram...", {
                    id: toastId,
                })
            } else {
                toast.error(res.message || "Parsing failed", { id: toastId })
            }
        } catch (error) {
            console.error("SQL upload error:", error)
            toast.error("Failed to upload SQL file", { id: toastId })
        } finally {
            if (fileInputSqlRef.current) fileInputSqlRef.current.value = ""
        }
    }

    // 获取当前用户ID
    const loginUser = useSelector((state: RootState) => state.loginUser)
    const userId = loginUser?.id

    const _onFetchChart = (saveToHistory = true) => {
        return Promise.race([
            new Promise<string>((resolve) => {
                if (resolverRef && "current" in resolverRef) {
                    resolverRef.current = resolve
                }
                if (saveToHistory) {
                    onExport()
                } else {
                    handleExportWithoutHistory()
                }
            }),
            new Promise<string>((_, reject) =>
                setTimeout(
                    () =>
                        reject(
                            new Error(
                                "Chart export timed out after 10 seconds",
                            ),
                        ),
                    10000,
                ),
            ),
        ])
    }

    // File processing using extracted hook
    const { files, pdfData, handleFileChange, setFiles } = useFileProcessor()

    const [showHistory, setShowHistory] = useState(false)
    const [showSettingsDialog, setShowSettingsDialog] = useState(false)
    const [dailyRequestLimit, setDailyRequestLimit] = useState(0)
    const [dailyTokenLimit, setDailyTokenLimit] = useState(0)
    const [tpmLimit, setTpmLimit] = useState(0)
    const [showNewChatDialog, setShowNewChatDialog] = useState(false)
    const [minimalStyle, setMinimalStyle] = useState(false)
    const [input, setInput] = useState("")

    // Check config on mount
    useEffect(() => {
        fetch("/api/config")
            .then((res) => res.json())
            .then((data) => {
                setDailyRequestLimit(data.dailyRequestLimit || 0)
                setDailyTokenLimit(data.dailyTokenLimit || 0)
                setTpmLimit(data.tpmLimit || 0)
            })
            .catch(() => {})
    }, [])

    // Quota management using extracted hook
    const quotaManager = useQuotaManager({
        dailyRequestLimit,
        dailyTokenLimit,
        tpmLimit,
    })

    // Generate a unique session ID
    const [sessionId, setSessionId] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(STORAGE_SESSION_ID_KEY)
            if (saved) return saved
        }
        return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    })

    // Store XML snapshots for each user message
    const xmlSnapshotsRef = useRef<Map<number, string>>(new Map())

    // Flag to track if we've restored from localStorage
    const hasRestoredRef = useRef(false)

    // Ref to track latest chartXML for use in callbacks
    const chartXMLRef = useRef(chartXML)
    useEffect(() => {
        chartXMLRef.current = chartXML
    }, [chartXML])

    // Debounce timeout for localStorage writes
    const localStorageDebounceRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null)
    const xmlStorageDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    )
    const LOCAL_STORAGE_DEBOUNCE_MS = 1000

    // Convert Message[] to UIMessage[] for display
    const convertToUIMessages = (messages: Message[]): UIMessage[] => {
        return messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            parts: [{ type: "text", text: msg.content }],
            content: msg.content,
        }))
    }

    // Convert UIMessage[] to Message[] for storage
    const _convertFromUIMessages = (uiMessages: UIMessage[]): Message[] => {
        return uiMessages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content:
                msg.parts?.find((p) => p.type === "text")?.text ||
                msg.content ||
                "",
            timestamp: Date.now(),
        }))
    }

    // Use backend chat hook
    const {
        messages: backendMessages,
        sendMessage: backendSendMessage,
        stop,
        isLoading,
        error,
        setMessages: setBackendMessages,
    } = useBackendChat({
        diagramId: diagramId || "default",
        onMessageComplete: (fullContent) => {
            try {
                parseXmlAndLoadDiagram(fullContent, onDisplayChart)
            } catch (err) {
                console.error("Failed to parse diagram XML:", err)
            }
        },
        onError: (err) => {
            console.error("Chat error:", err)
        },
    })

    // Convert messages for display
    const messages = convertToUIMessages(backendMessages)
    const status = isLoading ? "streaming" : "ready"

    // Simple sendMessage wrapper
    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return

        // Check quota
        if (!checkAllQuotaLimits()) return

        // Process files if any
        let messageContent = content.trim()
        if (files.length > 0) {
            for (const file of files) {
                const data = pdfData.get(file)
                if (data && !data.isExtracting && data.text) {
                    messageContent += `\n\n[File: ${file.name}]\n${data.text}`
                }
            }
            setFiles([])
        }

        setInput("")
        await backendSendMessage(messageContent)
        quotaManager.incrementRequestCount()
    }

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Restore messages and XML snapshots from backend on mount
    useEffect(() => {
        if (hasRestoredRef.current) return
        hasRestoredRef.current = true

        if (diagramId) {
            loadHistoryFromBackend(diagramId)
        } else {
            restoreFromLocalStorage()
        }
    }, [diagramId])

    // Load chat history from backend API
    const loadHistoryFromBackend = async (id: string) => {
        try {
            const response = await listDiagramChatHistory({
                diagramId: id,
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
                    .map((conv: API.Conversion) => ({
                        id: `msg-${conv.id}`,
                        role:
                            conv.messageType === "user" ? "user" : "assistant",
                        content: conv.message || "",
                        timestamp: new Date(conv.createTime || 0).getTime(),
                    }))

                if (historyMessages.length > 0) {
                    setBackendMessages(historyMessages)
                }
            }
        } catch (error) {
            console.error("Failed to load history from backend:", error)
        }
    }

    // Fallback: Restore from localStorage
    const restoreFromLocalStorage = () => {
        try {
            const savedMessages = localStorage.getItem(STORAGE_MESSAGES_KEY)
            if (savedMessages) {
                const parsed = JSON.parse(savedMessages)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setBackendMessages(parsed)
                }
            }

            const savedSnapshots = localStorage.getItem(
                STORAGE_XML_SNAPSHOTS_KEY,
            )
            if (savedSnapshots) {
                const parsed = JSON.parse(savedSnapshots)
                xmlSnapshotsRef.current = new Map(parsed)
            }
        } catch (error) {
            console.error("Failed to restore from localStorage:", error)
        }
    }

    // Restore diagram XML when DrawIO becomes ready
    const hasDiagramRestoredRef = useRef(false)
    const [canSaveDiagram, setCanSaveDiagram] = useState(false)
    useEffect(() => {
        if (!isDrawioReady) {
            hasDiagramRestoredRef.current = false
            setCanSaveDiagram(false)
            return
        }
        if (hasDiagramRestoredRef.current) return
        hasDiagramRestoredRef.current = true

        try {
            const savedDiagramXml = localStorage.getItem(
                STORAGE_DIAGRAM_XML_KEY,
            )
            if (savedDiagramXml) {
                onDisplayChart(savedDiagramXml, true)
                chartXMLRef.current = savedDiagramXml
            }
        } catch (error) {
            console.error("Failed to restore diagram from localStorage:", error)
        }

        setTimeout(() => {
            setCanSaveDiagram(true)
        }, 500)
    }, [isDrawioReady, onDisplayChart])

    // Save messages to localStorage
    useEffect(() => {
        if (!hasRestoredRef.current) return

        if (localStorageDebounceRef.current) {
            clearTimeout(localStorageDebounceRef.current)
        }

        localStorageDebounceRef.current = setTimeout(() => {
            try {
                localStorage.setItem(
                    STORAGE_MESSAGES_KEY,
                    JSON.stringify(backendMessages),
                )
            } catch (error) {
                console.error("Failed to save messages to localStorage:", error)
            }
        }, LOCAL_STORAGE_DEBOUNCE_MS)

        return () => {
            if (localStorageDebounceRef.current) {
                clearTimeout(localStorageDebounceRef.current)
            }
        }
    }, [backendMessages])

    // Save diagram XML to localStorage
    useEffect(() => {
        if (!canSaveDiagram) return
        if (!chartXML || chartXML.length <= 300) return

        if (xmlStorageDebounceRef.current) {
            clearTimeout(xmlStorageDebounceRef.current)
        }

        xmlStorageDebounceRef.current = setTimeout(() => {
            localStorage.setItem(STORAGE_DIAGRAM_XML_KEY, chartXML)
        }, LOCAL_STORAGE_DEBOUNCE_MS)

        return () => {
            if (xmlStorageDebounceRef.current) {
                clearTimeout(xmlStorageDebounceRef.current)
            }
        }
    }, [chartXML, canSaveDiagram])

    // Save session ID to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_SESSION_ID_KEY, sessionId)
    }, [sessionId])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    // Save state right before page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            try {
                localStorage.setItem(
                    STORAGE_MESSAGES_KEY,
                    JSON.stringify(backendMessages),
                )
                const xml = chartXMLRef.current
                if (xml && xml.length > 300) {
                    localStorage.setItem(STORAGE_DIAGRAM_XML_KEY, xml)
                }
                localStorage.setItem(STORAGE_SESSION_ID_KEY, sessionId)
            } catch (error) {
                console.error("Failed to persist state before unload:", error)
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [sessionId, backendMessages])

    const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const isProcessing = isLoading
        if (input.trim() && !isProcessing) {
            let messageContent = input.trim()

            // Process files if any
            if (files.length > 0) {
                for (const file of files) {
                    const data = pdfData.get(file)
                    if (data && !data.isExtracting && data.text) {
                        messageContent += `\n\n[File: ${file.name}]\n${data.text}`
                    }
                }
                setFiles([])
            }

            setInput("")
            await sendMessage(messageContent)
        }
    }

    const handleNewChat = useCallback(() => {
        setBackendMessages([])
        clearDiagram()
        handleFileChange([])
        const newSessionId = `session-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`
        setSessionId(newSessionId)
        xmlSnapshotsRef.current.clear()
        try {
            localStorage.removeItem(STORAGE_MESSAGES_KEY)
            localStorage.removeItem(STORAGE_XML_SNAPSHOTS_KEY)
            localStorage.removeItem(STORAGE_DIAGRAM_XML_KEY)
            localStorage.setItem(STORAGE_SESSION_ID_KEY, newSessionId)
            toast.success("Started a fresh chat")
        } catch (error) {
            console.error("Failed to clear localStorage:", error)
        }

        setShowNewChatDialog(false)
    }, [clearDiagram, handleFileChange])

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setInput(e.target.value)
    }

    // Check all quota limits
    const checkAllQuotaLimits = (): boolean => {
        const limitCheck = quotaManager.checkDailyLimit()
        if (!limitCheck.allowed) {
            quotaManager.showQuotaLimitToast()
            return false
        }

        const tokenLimitCheck = quotaManager.checkTokenLimit()
        if (!tokenLimitCheck.allowed) {
            quotaManager.showQuotaLimitToast()
            return false
        }

        const tpmCheck = quotaManager.checkTPMLimit()
        if (!tpmCheck.allowed) {
            quotaManager.showTPMLimitToast()
            return false
        }

        return true
    }

    // Regenerate handler (simplified)
    const handleRegenerate = async (messageIndex: number) => {
        if (isLoading) return

        let userMessageIndex = messageIndex - 1
        while (
            userMessageIndex >= 0 &&
            messages[userMessageIndex].role !== "user"
        ) {
            userMessageIndex--
        }

        if (userMessageIndex < 0) return

        const userMessage = messages[userMessageIndex]
        const userText = userMessage.parts?.find((p) => p.type === "text")?.text
        if (!userText) return

        // Remove messages after user message
        const newMessages = backendMessages.slice(0, userMessageIndex)
        setBackendMessages(newMessages)

        // Resend
        if (!checkAllQuotaLimits()) return
        await backendSendMessage(userText)
    }

    // Edit message handler
    const handleEditMessage = async (messageIndex: number, newText: string) => {
        if (isLoading) return

        const message = messages[messageIndex]
        if (!message || message.role !== "user") return

        // Remove messages from this point
        const newMessages = backendMessages.slice(0, messageIndex)
        setBackendMessages(newMessages)

        if (!checkAllQuotaLimits()) return
        await backendSendMessage(newText)
    }

    // Processed tool calls ref for ChatMessageDisplay
    const processedToolCallsRef = useRef<Set<string>>(new Set())

    // Collapsed view (desktop only)
    if (!isVisible && !isMobile) {
        return (
            <div className="h-full flex flex-col items-center pt-4 bg-card border border-border/30 rounded-xl">
                <ButtonWithTooltip
                    tooltipContent="Show chat panel (Ctrl+B)"
                    variant="ghost"
                    size="icon"
                    onClick={onToggleVisibility}
                    className="hover:bg-accent transition-colors"
                >
                    <PanelRightOpen className="h-5 w-5 text-muted-foreground" />
                </ButtonWithTooltip>
                <div
                    className="text-sm font-medium text-muted-foreground mt-8 tracking-wide"
                    style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                    }}
                >
                    AI Chat
                </div>
            </div>
        )
    }

    // Full view
    return (
        <div className="h-full flex flex-col bg-card shadow-soft animate-slide-in-right rounded-xl border border-border/30 relative">
            <Toaster
                position="bottom-center"
                richColors
                expand
                style={{ position: "absolute" }}
                toastOptions={{
                    style: {
                        maxWidth: "480px",
                    },
                    duration: 2000,
                }}
            />
            {/* Header */}
            <header
                className={`${isMobile ? "px-3 py-2" : "px-5 py-4"} border-b border-border/50`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/favicon.ico"
                                alt="W-Next AI Drawio"
                                width={isMobile ? 24 : 28}
                                height={isMobile ? 24 : 28}
                                className="rounded"
                            />
                            <h1
                                className={`${isMobile ? "text-sm" : "text-base"} font-semibold tracking-tight whitespace-nowrap`}
                            >
                                W-Next AI Drawio
                            </h1>
                        </div>
                        {!isMobile && (
                            <Link
                                href="/about"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-2"
                            >
                                About
                            </Link>
                        )}
                        {!isMobile && (
                            <Link
                                href="/about"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ButtonWithTooltip
                                    tooltipContent="Due to high usage, I have changed the model to minimax-m2 and added some usage limits. See About page for details."
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-amber-500 hover:text-amber-600"
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                </ButtonWithTooltip>
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <ButtonWithTooltip
                            tooltipContent="Start fresh chat"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowNewChatDialog(true)}
                            className="hover:bg-accent"
                        >
                            <MessageSquarePlus
                                className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-muted-foreground`}
                            />
                        </ButtonWithTooltip>
                        <div className="w-px h-5 bg-border mx-1" />
                        <a
                            href="https://github.com/DayuanJiang/next-ai-draw-io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                            <FaGithub
                                className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`}
                            />
                        </a>
                        <ButtonWithTooltip
                            tooltipContent="Settings"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSettingsDialog(true)}
                            className="hover:bg-accent"
                        >
                            <Settings
                                className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-muted-foreground`}
                            />
                        </ButtonWithTooltip>
                        {!isMobile && (
                            <ButtonWithTooltip
                                tooltipContent="Hide chat panel (Ctrl+B)"
                                variant="ghost"
                                size="icon"
                                onClick={onToggleVisibility}
                                className="hover:bg-accent"
                            >
                                <PanelRightClose className="h-5 w-5 text-muted-foreground" />
                            </ButtonWithTooltip>
                        )}
                    </div>
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 w-full overflow-hidden">
                <ChatMessageDisplay
                    messages={messages}
                    setInput={setInput}
                    setFiles={handleFileChange}
                    processedToolCallsRef={processedToolCallsRef}
                    sessionId={sessionId}
                    onRegenerate={handleRegenerate}
                    status={status}
                    onEditMessage={handleEditMessage}
                />
            </main>

            {/* Input */}
            <footer
                className={`${isMobile ? "p-2" : "p-4"} border-t border-border/50 bg-card/50`}
            >
                <ChatInput
                    input={input}
                    status={status}
                    onSubmit={onFormSubmit}
                    onChange={handleInputChange}
                    onClearChat={handleNewChat}
                    onStop={stop}
                    isManuallyStopped={false}
                    files={files}
                    onFileChange={handleFileChange}
                    pdfData={pdfData}
                    showHistory={showHistory}
                    onToggleHistory={setShowHistory}
                    sessionId={sessionId}
                    error={error}
                    minimalStyle={minimalStyle}
                    onMinimalStyleChange={setMinimalStyle}
                    userId={userId}
                    diagramId={diagramId}
                    onUploadCode={() => fileInputCodeRef.current?.click()}
                    onUploadSql={() => fileInputSqlRef.current?.click()}
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
            </footer>

            <SettingsDialog
                open={showSettingsDialog}
                onOpenChange={setShowSettingsDialog}
                onCloseProtectionChange={onCloseProtectionChange}
                drawioUi={drawioUi}
                onToggleDrawioUi={onToggleDrawioUi}
                darkMode={darkMode}
                onToggleDarkMode={onToggleDarkMode}
            />

            <ResetWarningModal
                open={showNewChatDialog}
                onOpenChange={setShowNewChatDialog}
                onClear={handleNewChat}
            />
        </div>
    )
}
