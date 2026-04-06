"use client"

import type React from "react"
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import type { DrawIoEmbedRef } from "react-drawio"
import { useSelector } from "react-redux"
import { STORAGE_DIAGRAM_XML_KEY } from "@/components/chat-panel"
import type { ExportFormat } from "@/components/save-dialog"
import type { RootState } from "@/stores/index"
import { UserRole } from "../lib/collab-protocol"
import {
    deriveKeyFromRoomId,
    generateSecretKey,
    getSecretKeyFromHash,
} from "../lib/cryptoUtils"
import { usePersistence } from "../lib/use-persistence"
import { useYjsCollaboration } from "../lib/use-yjs-collaboration"
import { extractDiagramXML, validateAndFixXml } from "../lib/utils"
import type { OnlineUser } from "../lib/yjs-collab"

interface DiagramContextType {
    chartXML: string
    latestSvg: string
    diagramHistory: { svg: string; xml: string }[]
    loadDiagram: (chart: string, skipValidation?: boolean) => string | null
    handleExport: () => void
    handleExportWithoutHistory: () => void
    resolverRef: React.MutableRefObject<((value: string) => void) | null>
    drawioRef: React.RefObject<DrawIoEmbedRef | null>
    handleDiagramExport: (data: any) => void
    handleAutoSave: (data: any) => void
    clearDiagram: () => void
    saveDiagramToFile: (
        filename: string,
        format: ExportFormat,
        sessionId?: string,
    ) => void
    isDrawioReady: boolean
    onDrawioLoad: () => void
    resetDrawioReady: () => void
    // 新增：注册外部导出回调处理器
    registerExportCallback: (callback: ((data: string) => void) | null) => void
    // Yjs 协作相关
    collaborationEnabled: boolean
    collaborationConnected: boolean
    collaborationUserCount: number
    collaborationOnlineUsers: OnlineUser[]
    toggleCollaboration: (
        enabled: boolean,
        roomName?: string,
        isReadOnly?: boolean,
    ) => void
    // 未保存更改指示器
    hasUnsavedChanges: boolean
    setHasUnsavedChanges: (hasChanges: boolean) => void
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined)

export function DiagramProvider({ children }: { children: React.ReactNode }) {
    const [chartXML, setChartXML] = useState<string>("")
    const [latestSvg, setLatestSvg] = useState<string>("")
    const [diagramHistory, setDiagramHistory] = useState<
        { svg: string; xml: string }[]
    >([])
    const [isDrawioReady, setIsDrawioReady] = useState(false)
    const hasCalledOnLoadRef = useRef(false)
    const drawioRef = useRef<DrawIoEmbedRef | null>(null)
    const resolverRef = useRef<((value: string) => void) | null>(null)
    // Track if we're expecting an export for history (user-initiated)
    const expectHistoryExportRef = useRef<boolean>(false)

    // 获取当前用户信息
    const loginUser = useSelector((state: RootState) => state.loginUser)
    const currentUserId = loginUser?.id?.toString()
    const currentUserName = loginUser?.userName || "Anonymous"

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // WebSocket 协作状态
    const [collaborationEnabled, setCollaborationEnabled] = useState(false)
    const [collaborationRoomName, setCollaborationRoomName] =
        useState<string>("")
    const [secretKey, setSecretKey] = useState<string>("")
    const [isReadOnly, setIsReadOnly] = useState(false) // 是否只读模式
    const isUpdatingFromRemoteRef = useRef(false) // 防止循环更新

    // 使用 ref 存储最新的协作状态，避免闭包陷阱
    const collaborationStateRef = useRef({
        enabled: collaborationEnabled,
        connected: false,
    })

    // 更新 ref 当状态变化时
    useEffect(() => {
        collaborationStateRef.current.enabled = collaborationEnabled
    }, [collaborationEnabled])

    // 初始化密钥: 基于房间 ID 生成固定密钥（多人协作共享密钥）
    useEffect(() => {
        const initKey = async () => {
            if (collaborationRoomName) {
                // 如果有房间 ID，使用房间 ID 生成固定密钥
                // 这样同一房间的所有用户都会使用相同的密钥
                const roomBasedKey = await deriveKeyFromRoomId(
                    collaborationRoomName,
                )
                console.log(
                    "[DiagramContext] 🔑 Generated room-based secret key for room:",
                    collaborationRoomName,
                )
                setSecretKey(roomBasedKey)
            } else {
                // 没有房间时，从 URL hash 获取或生成新密钥
                const key = getSecretKeyFromHash()
                if (key) {
                    console.log(
                        "[DiagramContext] 🔑 Loaded secret key from URL hash",
                    )
                    setSecretKey(key)
                } else {
                    const newKey = generateSecretKey()
                    console.log(
                        "[DiagramContext] 🔑 Generated new random secret key",
                    )
                    setSecretKey(newKey)
                    // 将密钥添加到 URL hash(如果启用了协作)
                    if (collaborationEnabled) {
                        window.location.hash = `key=${newKey}`
                    }
                }
            }
        }

        initKey()
    }, [collaborationRoomName, collaborationEnabled])

    // 创建稳定的 onRemoteChange 回调，避免频繁重建协作实例
    const handleRemoteChange = useCallback((xml: string) => {
        // 远程更新：应用到 Draw.io
        console.log("[DiagramContext] 🔔 onRemoteChange called!", {
            hasXml: !!xml,
            xmlLength: xml?.length,
            isUpdatingFromRemote: isUpdatingFromRemoteRef.current,
        })

        // 打印XML的前200个字符，方便调试
        if (xml) {
            console.log(
                "[DiagramContext] 📄 XML preview (first 200 chars):",
                xml.substring(0, 200),
            )
        }

        if (!isUpdatingFromRemoteRef.current && xml) {
            isUpdatingFromRemoteRef.current = true
            console.log("[DiagramContext] 📥 Loading remote XML to Draw.io...")

            // 直接加载到 Draw.io，不触发 WebSocket 推送
            setChartXML(xml)

            if (drawioRef.current) {
                try {
                    drawioRef.current.load({
                        xml: xml,
                    })
                    console.log(
                        "[DiagramContext] ✅ Remote XML loaded to Draw.io",
                    )

                    // 延迟重置标志，确保 Draw.io 完成渲染
                    setTimeout(() => {
                        isUpdatingFromRemoteRef.current = false
                        console.log(
                            "[DiagramContext] 🔓 Remote update flag cleared",
                        )
                    }, 500)
                } catch (error) {
                    console.error(
                        "[DiagramContext] ❌ Failed to load XML:",
                        error,
                    )
                    isUpdatingFromRemoteRef.current = false
                }
            } else {
                console.warn(
                    "[DiagramContext] ⚠️ drawioRef.current is null, cannot load XML",
                )
                isUpdatingFromRemoteRef.current = false
            }
        } else {
            console.log(
                "[DiagramContext] ⏭️ Skipping remote change (updating or no xml)",
            )
        }
    }, []) // 空依赖数组，确保引用稳定

    // 获取 WebSocket URL
    const getWSUrl = () => {
        // 优先使用环境变量，否则强制使用线上地址
        const wsUrl =
            process.env.NEXT_PUBLIC_WS_URL || "wss://ws.intellidraw.top:1234"
        return wsUrl.replace(/\/$/, "")
    }

    // 初始化 Yjs 协作 Hook
    const {
        isConnected: collaborationConnected,
        userCount: collaborationUserCount,
        onlineUsers: collaborationOnlineUsers,
        pushUpdate,
        // sendPointer,
        getDocument,
    } = useYjsCollaboration({
        roomName: collaborationRoomName,
        serverUrl: getWSUrl(), // Hocuspocus 需要完整的 WebSocket URL
        userRole: isReadOnly ? UserRole.VIEW : UserRole.EDIT, // 根据只读状态设置角色
        userId: currentUserId || "anonymous", // 用户ID
        userName: currentUserName || "Anonymous", // 用户名
        token: loginUser?.token, // 传递 Token
        enabled: collaborationEnabled && !!collaborationRoomName, // 移除 secretKey 依赖
        onRemoteChange: handleRemoteChange,
    })

    // 更新 ref 当连接状态变化时
    useEffect(() => {
        collaborationStateRef.current.connected = collaborationConnected
    }, [collaborationConnected])

    // HTTP 持久化 (Excalidraw 风格)
    // 只在协作模式下启用,与 WebSocket 广播分离
    const { flush: flushPersistence } = usePersistence({
        roomId: collaborationRoomName,
        secretKey: secretKey,
        xml: chartXML,
        enabled: collaborationEnabled && !!collaborationRoomName && !!secretKey,
        debounceMs: 2000,
        onSaveSuccess: () => {
            console.log("[DiagramContext] 💾 Auto-saved to backend")
        },
        onSaveError: (error) => {
            console.error("[DiagramContext] ❌ Auto-save failed:", error)
        },
    })

    // 组件卸载时刷新未保存的更改
    useEffect(() => {
        return () => {
            if (collaborationEnabled) {
                console.log(
                    "[DiagramContext] 💾 Flushing persistence on unmount...",
                )
                flushPersistence()
            }
        }
    }, [collaborationEnabled, flushPersistence])

    const onDrawioLoad = () => {
        console.log(
            "[DiagramContext] ========== onDrawioLoad 被调用 ==========",
            {
                hasCalledBefore: hasCalledOnLoadRef.current,
                isReady: isDrawioReady,
            },
        )

        // 智能逻辑：
        // 1. 如果 isDrawioReady 已经是 true，说明组件已经加载过了，直接返回
        // 2. 如果 isDrawioReady 是 false，设置为 true（无论 ref 是什么）
        // 这样可以避免跨页面时的状态污染问题
        if (isDrawioReady) {
            console.log(
                "[DiagramContext] ⚠️ isDrawioReady 已经是 true，跳过设置",
            )
            return
        }

        console.log("[DiagramContext] ✅ 正在设置 isDrawioReady = true")
        hasCalledOnLoadRef.current = true
        setIsDrawioReady(true)
        console.log("[DiagramContext] ✅ isDrawioReady 设置完成")
    }

    const resetDrawioReady = () => {
        // console.log("[DiagramContext] Resetting DrawIO ready state")
        hasCalledOnLoadRef.current = false
        setIsDrawioReady(false)
    }

    // Track if we're expecting an export for file save (stores raw export data)
    const saveResolverRef = useRef<{
        resolver: ((data: string) => void) | null
        format: ExportFormat | null
    }>({ resolver: null, format: null })

    // 外部导出回调（用于 useDiagramSave 等其他模块）
    const externalExportCallbackRef = useRef<((data: string) => void) | null>(
        null,
    )

    // 注册外部导出回调
    const registerExportCallback = useCallback(
        (callback: ((data: string) => void) | null) => {
            externalExportCallbackRef.current = callback
        },
        [],
    )

    const handleExport = () => {
        if (drawioRef.current) {
            // Mark that this export should be saved to history
            expectHistoryExportRef.current = true
            drawioRef.current.exportDiagram({
                format: "xmlsvg",
            })
        }
    }

    const handleExportWithoutHistory = () => {
        if (drawioRef.current) {
            // Export without saving to history (for edit_diagram fetching current state)
            drawioRef.current.exportDiagram({
                format: "xmlsvg",
            })
        }
    }

    const loadDiagram = (
        chart: string,
        skipValidation?: boolean,
    ): string | null => {
        console.time("perf:loadDiagram")
        let xmlToLoad = chart

        // Validate XML structure before loading (unless skipped for internal use)
        if (!skipValidation) {
            console.time("perf:loadDiagram-validation")
            const validation = validateAndFixXml(chart)
            console.timeEnd("perf:loadDiagram-validation")
            if (!validation.valid) {
                console.warn(
                    "[loadDiagram] Validation error:",
                    validation.error,
                )
                console.timeEnd("perf:loadDiagram")
                return validation.error
            }
            // Use fixed XML if auto-fix was applied
            if (validation.fixed) {
                xmlToLoad = validation.fixed
            }
        }

        // Keep chartXML in sync even when diagrams are injected (e.g., display_diagram tool)
        setChartXML(xmlToLoad)

        if (drawioRef.current) {
            console.time("perf:drawio-iframe-load")
            drawioRef.current.load({
                xml: xmlToLoad,
            })
            console.timeEnd("perf:drawio-iframe-load")
        }

        console.timeEnd("perf:loadDiagram")
        return null
    }

    // 处理 Draw.io autosave 事件（用于实时协作）
    const handleAutoSave = useCallback(
        (data: any) => {
            const currentEnabled = collaborationStateRef.current.enabled
            const currentConnected = collaborationStateRef.current.connected

            console.log("[DiagramContext] 🎨 handleAutoSave called:", {
                currentEnabled,
                currentConnected,
                isUpdatingFromRemote: isUpdatingFromRemoteRef.current,
                hasXml: !!data.xml,
            })

            // 提取 XML
            const xml = data.xml || ""
            if (!xml) {
                console.log("[DiagramContext] ⚠️ No XML in autosave data")
                return
            }

            // 更新本地状态 (无论是否协作，都要更新)
            setChartXML(xml)
            if (!isUpdatingFromRemoteRef.current) {
                setHasUnsavedChanges(true)
            }

            // 仅在协作模式且已连接时处理推送
            if (
                !currentEnabled ||
                !currentConnected ||
                isUpdatingFromRemoteRef.current
            ) {
                return
            }

            // 推送到 Yjs（协作服务器）
            console.log("[DiagramContext] 🚀 Calling pushUpdate...")
            pushUpdate(xml)
        },
        [pushUpdate],
    )

    const handleDiagramExport = useCallback(
        (data: any) => {
            // 首先调用外部回调（useDiagramSave 等）
            if (externalExportCallbackRef.current) {
                externalExportCallbackRef.current(data.data)
            }

            // Handle save to file if requested (process raw data before extraction)
            if (saveResolverRef.current.resolver) {
                const format = saveResolverRef.current.format
                saveResolverRef.current.resolver(data.data)
                saveResolverRef.current = { resolver: null, format: null }
                // For non-xmlsvg formats, skip XML extraction as it will fail
                // Only drawio (which uses xmlsvg internally) has the content attribute
                if (format === "png" || format === "svg") {
                    return
                }
            }

            // Check if the data is PNG or SVG (not xmlsvg), skip XML extraction
            // PNG starts with data:image/png
            // SVG starts with <svg or data:image/svg+xml but doesn't have content attribute
            const dataStr = data.data || ""
            if (
                dataStr.startsWith("data:image/png") ||
                (dataStr.startsWith("<svg") && !dataStr.includes("content="))
            ) {
                // This is a raw PNG or SVG export, don't try to extract XML
                return
            }

            const extractedXML = extractDiagramXML(data.data)
            setChartXML(extractedXML)
            setLatestSvg(data.data)

            // Yjs 协作：推送本地更新到服务器（如果不是远程更新触发的）
            // 使用 ref.current 读取最新状态，避免闭包陷阱
            const currentEnabled = collaborationStateRef.current.enabled
            const currentConnected = collaborationStateRef.current.connected

            if (
                currentEnabled &&
                currentConnected &&
                !isUpdatingFromRemoteRef.current
            ) {
                pushUpdate(extractedXML)
            }

            // Only add to history if this was a user-initiated export
            // Limit to 20 entries to prevent memory leaks during long sessions
            const MAX_HISTORY_SIZE = 20
            if (expectHistoryExportRef.current) {
                setDiagramHistory((prev) => {
                    const newHistory = [
                        ...prev,
                        {
                            svg: data.data,
                            xml: extractedXML,
                        },
                    ]
                    // Keep only the last MAX_HISTORY_SIZE entries (circular buffer)
                    return newHistory.slice(-MAX_HISTORY_SIZE)
                })
                expectHistoryExportRef.current = false
            }

            if (resolverRef.current) {
                resolverRef.current(extractedXML)
                resolverRef.current = null
            }
        },
        [pushUpdate], // 只依赖 pushUpdate，状态从 ref 读取
    )

    const clearDiagram = () => {
        const emptyDiagram = `<mxfile><diagram name="Page-1" id="page-1"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>`
        // Skip validation for trusted internal template (loadDiagram also sets chartXML)
        loadDiagram(emptyDiagram, true)
        setLatestSvg("")
        setDiagramHistory([])
    }

    const saveDiagramToFile = (
        filename: string,
        format: ExportFormat,
        sessionId?: string,
    ) => {
        if (!drawioRef.current) {
            console.warn("Draw.io editor not ready")
            return
        }

        // Map format to draw.io export format
        const drawioFormat = format === "drawio" ? "xmlsvg" : format

        // Set up the resolver before triggering export
        saveResolverRef.current = {
            resolver: (exportData: string) => {
                let fileContent: string | Blob
                let mimeType: string
                let extension: string

                if (format === "drawio") {
                    // Extract XML from SVG for .drawio format
                    const xml = extractDiagramXML(exportData)
                    let xmlContent = xml
                    if (!xml.includes("<mxfile")) {
                        xmlContent = `<mxfile><diagram name="Page-1" id="page-1">${xml}</diagram></mxfile>`
                    }
                    fileContent = xmlContent
                    mimeType = "application/xml"
                    extension = ".drawio"

                    // Save to localStorage when user manually saves
                    localStorage.setItem(STORAGE_DIAGRAM_XML_KEY, xmlContent)
                } else if (format === "png") {
                    // PNG data comes as base64 data URL
                    fileContent = exportData
                    mimeType = "image/png"
                    extension = ".png"
                } else {
                    // SVG format
                    fileContent = exportData
                    mimeType = "image/svg+xml"
                    extension = ".svg"
                }

                // Log save event to Langfuse (flags the trace)
                logSaveToLangfuse(filename, format, sessionId)

                // Handle download
                let url: string
                if (
                    typeof fileContent === "string" &&
                    fileContent.startsWith("data:")
                ) {
                    // Already a data URL (PNG)
                    url = fileContent
                } else {
                    const blob = new Blob([fileContent], { type: mimeType })
                    url = URL.createObjectURL(blob)
                }

                const a = document.createElement("a")
                a.href = url
                a.download = `${filename}${extension}`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)

                // Delay URL revocation to ensure download completes
                if (!url.startsWith("data:")) {
                    setTimeout(() => URL.revokeObjectURL(url), 100)
                }
            },
            format,
        }

        // Export diagram - callback will be handled in handleDiagramExport
        drawioRef.current.exportDiagram({ format: drawioFormat })
    }

    // Log save event to Langfuse (just flags the trace, doesn't send content)
    const logSaveToLangfuse = async (
        filename: string,
        format: string,
        sessionId?: string,
    ) => {
        try {
            await fetch("/api/log-save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename, format, sessionId }),
            })
        } catch (error) {
            console.warn("Failed to log save to Langfuse:", error)
        }
    }

    // 切换协作模式
    const toggleCollaboration = useCallback(
        (enabled: boolean, roomName?: string, isReadOnly?: boolean) => {
            console.log("[DiagramContext] toggleCollaboration called:", {
                enabled,
                roomName,
                isReadOnly,
            })

            if (enabled && !roomName) {
                console.warn(
                    "[DiagramContext] Cannot enable collaboration without roomName",
                )
                return
            }

            // 设置只读模式
            if (isReadOnly !== undefined) {
                setIsReadOnly(isReadOnly)
                console.log(
                    "[DiagramContext] Setting isReadOnly to:",
                    isReadOnly,
                )
            }

            console.log(
                "[DiagramContext] Setting collaborationEnabled to:",
                enabled,
            )
            console.log(
                "[DiagramContext] Setting collaborationRoomName to:",
                roomName || "",
            )

            setCollaborationEnabled(enabled)
            setCollaborationRoomName(roomName || "")
        },
        [],
    )

    return (
        <DiagramContext.Provider
            value={{
                chartXML,
                latestSvg,
                diagramHistory,
                loadDiagram,
                handleExport,
                handleExportWithoutHistory,
                resolverRef,
                drawioRef,
                handleDiagramExport,
                handleAutoSave,
                clearDiagram,
                saveDiagramToFile,
                isDrawioReady,
                onDrawioLoad,
                resetDrawioReady,
                registerExportCallback,
                // Yjs 协作
                collaborationEnabled,
                collaborationConnected,
                collaborationUserCount,
                collaborationOnlineUsers,
                toggleCollaboration,
                hasUnsavedChanges,
                setHasUnsavedChanges,
            }}
        >
            {children}
        </DiagramContext.Provider>
    )
}

export function useDiagram() {
    const context = useContext(DiagramContext)
    if (context === undefined) {
        throw new Error("useDiagram must be used within a DiagramProvider")
    }
    return context
}
