import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"

// 移除硬编码，使用相对路径，由 Next.js Route Handler 处理 SSE 流
const API_BASE_URL = "/api"

// SSE 数据接收超时时间（毫秒），超过此时间没有任何新数据则认为连接异常
const SSE_DATA_TIMEOUT_MS = 120_000 // 120 秒

export interface Message {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp?: number
}

export interface AIConfig {
    mode: "system" | "custom"
    modelId?: string
    baseUrl?: string
    apiKey?: string
}

export interface UseBackendChatOptions {
    diagramId: string
    aiConfig?: AIConfig
    /** 免费试用模式：无需登录，使用 /chat/free/stream 接口 */
    freeTrial?: boolean
    onMessageComplete?: (message: string) => void
    onError?: (error: Error) => void
}

export function useBackendChat({
    diagramId,
    aiConfig,
    freeTrial = false,
    onMessageComplete,
    onError,
}: UseBackendChatOptions) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return

            // 添加用户消息
            const userMessage: Message = {
                id: `user-${Date.now()}`,
                role: "user",
                content: content.trim(),
                timestamp: Date.now(),
            }

            setMessages((prev) => [...prev, userMessage])
            setIsLoading(true)
            setError(null)

            // 创建 AI 助手消息占位符
            const assistantMessageId = `assistant-${Date.now()}`
            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMessageId,
                    role: "assistant",
                    content: "",
                    timestamp: Date.now(),
                },
            ])

            // 创建 AbortController 用于取消请求
            const abortController = new AbortController()
            abortControllerRef.current = abortController

            // 在 try 块外定义，这样 catch 块也能访问
            let fullContent = ""

            try {
                // 根据 aiConfig 和 freeTrial 选择 API 端点和请求体
                const isCustomMode = aiConfig?.mode === "custom"

                // 免费试用模式优先
                let endpoint: string
                let requestBody: {
                    message: string
                    diagramId?: string
                    modelId?: string
                    baseUrl?: string
                    apiKey?: string
                }

                if (freeTrial) {
                    // 免费试用模式：无需登录，使用 /chat/free/stream
                    endpoint = `${API_BASE_URL}/chat/free/stream`
                    requestBody = {
                        message: content.trim(),
                    }
                    console.log("[useBackendChat] Using free trial mode")
                } else if (isCustomMode) {
                    // 自定义模式：使用用户自定义的 AI 配置
                    endpoint = `${API_BASE_URL}/chat/custom/stream`
                    requestBody = {
                        message: content.trim(),
                        diagramId: diagramId,
                        modelId: aiConfig.modelId,
                        baseUrl: aiConfig.baseUrl,
                        apiKey: aiConfig.apiKey,
                    }
                    console.log("[useBackendChat] Using custom AI mode", {
                        modelId: aiConfig?.modelId,
                    })
                } else {
                    // 系统默认模式
                    endpoint = `${API_BASE_URL}/chat/stream`
                    requestBody = {
                        message: content.trim(),
                        diagramId: diagramId,
                    }
                    console.log("[useBackendChat] Using system AI mode")
                }

                // 使用原生 fetch API 调用后端 SSE 接口
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                    signal: abortController.signal,
                    credentials: "include", // 携带 cookie
                })

                // 检查是否返回了 JSON 格式的错误信息
                const contentType = response.headers.get("content-type")
                if (contentType?.includes("application/json")) {
                    const jsonRes = await response.json()
                    // 如果后端返回了业务错误（如 code !== 0 或特定错误码）
                    if (jsonRes.code && jsonRes.code !== 0) {
                        throw new Error(
                            jsonRes.message ||
                                `请求失败，错误码：${jsonRes.code}`,
                        )
                    }
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                // 处理 SSE 流
                const reader = response.body?.getReader()
                const decoder = new TextDecoder()

                if (!reader) {
                    throw new Error("Response body is null")
                }

                fullContent = "" // 初始化为空字符串
                let buffer = "" // 用于缓存不完整的数据块

                // 定义处理单个 SSE 事件的函数
                const processSseEvent = (event: string) => {
                    if (!event.trim()) return

                    // 聚合所有 data 行的数据，并检查 event 类型
                    let eventData = ""
                    let eventName = ""

                    const lines = event.trim().split(/\n/)

                    for (const line of lines) {
                        if (line.startsWith("event:")) {
                            eventName = line.substring(6).trim()
                        } else if (line.startsWith("data:")) {
                            const dataContent = line.substring(5).trim()
                            if (dataContent) {
                                eventData += dataContent
                            }
                        }
                    }

                    if (!eventData) return

                    // 每次收到有效数据时重置超时计时器
                    resetTimeoutTimer()

                    // 处理错误事件
                    if (eventName === "error") {
                        const errorMsg = eventData
                        console.error("[SSE] Received error event:", errorMsg)

                        // 更新助手消息为错误信息
                        const err = new Error(errorMsg)
                        setError(err)
                        onError?.(err)
                        toast.error(`AI 生成失败: ${errorMsg}`)

                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === assistantMessageId
                                    ? { ...msg, content: `⛔️ ${errorMsg}` }
                                    : msg,
                            ),
                        )
                        return
                    }

                    try {
                        // 解析 JSON
                        const parsed = JSON.parse(eventData)

                        // 处理不同类型的消息
                        if (parsed.type === "text" && parsed.content) {
                            // 文本消息：追加到内容中
                            fullContent += parsed.content

                            // 实时更新助手消息，实现打字机效果
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === assistantMessageId
                                        ? {
                                              ...msg,
                                              content: fullContent,
                                          }
                                        : msg,
                                ),
                            )
                        } else if (
                            (parsed.type === "too_call" ||
                                parsed.type === "tool_call") &&
                            parsed.content
                        ) {
                            // 工具调用消息：显示工具调用信息
                            console.log("[SSE] Tool call:", parsed.content)
                            const toolCallMessage = `\n🔧 ${parsed.content}\n`
                            fullContent += toolCallMessage

                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === assistantMessageId
                                        ? {
                                              ...msg,
                                              content: fullContent,
                                          }
                                        : msg,
                                ),
                            )
                        } else if (
                            parsed.type === "tool_call_result" &&
                            parsed.content
                        ) {
                            // 工具调用结果：包含生成的图表 XML
                            console.log(
                                "[SSE] Tool call result received, length:",
                                parsed.content.length,
                            )

                            // 尝试从 XML 中提取内容
                            const xmlContent = parsed.content

                            // 查找 <mxfile> 标签
                            const mxfileMatch = xmlContent.match(
                                /<mxfile[\s\S]*?<\/mxfile>/,
                            )
                            if (mxfileMatch) {
                                const fullXml = mxfileMatch[0]
                                console.log(
                                    "[SSE] Found mxfile XML, triggering diagram load...",
                                )

                                // 将 XML 格式化为 markdown 代码块
                                // 这样 ReactMarkdown 就能正确渲染为代码块
                                const xmlCodeBlock = `\n\n\`\`\`xml\n${fullXml}\n\`\`\`\n\n`

                                // 将 XML 代码块添加到 fullContent 中
                                fullContent += xmlCodeBlock

                                // 直接通过回调加载图表（使用 diagram-context 的 loadDiagram）
                                onMessageComplete?.(fullContent)

                                // 添加完成消息
                                const completionMessage = "✅ 图表已生成"
                                fullContent += completionMessage
                            } else {
                                console.warn(
                                    "[SSE] Tool call result did not contain valid mxfile XML",
                                )
                                const completionMessage = "\n\n⚠️ 图表生成失败"
                                fullContent += completionMessage
                            }

                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === assistantMessageId
                                        ? {
                                              ...msg,
                                              content: fullContent,
                                          }
                                        : msg,
                                ),
                            )
                        }
                    } catch (parseError) {
                        console.warn(
                            "Failed to parse SSE data:",
                            eventData,
                            parseError,
                        )
                    }
                }

                // SSE 数据超时处理：如果长时间没有收到任何数据，自动断开
                let dataTimeoutTimer: ReturnType<typeof setTimeout> | null =
                    null
                const clearTimeoutTimer = () => {
                    if (dataTimeoutTimer) {
                        clearTimeout(dataTimeoutTimer)
                        dataTimeoutTimer = null
                    }
                }
                const resetTimeoutTimer = () => {
                    clearTimeoutTimer()
                    dataTimeoutTimer = setTimeout(() => {
                        console.warn(
                            "[SSE] Data timeout - no data received for",
                            SSE_DATA_TIMEOUT_MS,
                            "ms",
                        )
                        abortController.abort()
                        const timeoutErr = new Error("AI 响应超时，请稍后重试")
                        setError(timeoutErr)
                        onError?.(timeoutErr)
                        toast.error("AI 响应超时，请稍后重试")
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.id === assistantMessageId
                                    ? {
                                          ...msg,
                                          content:
                                              fullContent ||
                                              "⏰ AI 响应超时，请稍后重试",
                                      }
                                    : msg,
                            ),
                        )
                        setIsLoading(false)
                    }, SSE_DATA_TIMEOUT_MS)
                }

                // 开始超时计时
                resetTimeoutTimer()

                while (true) {
                    const { done, value } = await reader.read()

                    if (done) {
                        clearTimeoutTimer()
                        console.log(
                            "[SSE] Stream complete. Buffer length:",
                            buffer.length,
                        )
                        // 处理剩余的 buffer
                        if (buffer.trim()) {
                            console.log(
                                "[SSE] Processing remaining buffer:",
                                buffer,
                            )
                            processSseEvent(buffer)
                        }

                        setIsLoading(false)
                        onMessageComplete?.(fullContent)
                        break
                    }

                    // 每次收到数据块时重置超时计时器
                    resetTimeoutTimer()

                    // 解码数据块
                    const chunk = decoder.decode(value, { stream: true })
                    console.log("[SSE] Received chunk size:", chunk.length)
                    buffer += chunk

                    // SSE 格式：每个事件用 \n\n 分隔
                    const events = buffer.split(/\n\n/)

                    // 保留最后一个可能不完整的事件
                    buffer = events.pop() || ""

                    for (const event of events) {
                        processSseEvent(event)
                    }
                }
            } catch (err) {
                const error = err as Error
                if (error.name === "AbortError") {
                    console.log("Request was aborted")
                    // 更新助手消息显示已停止
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? {
                                      ...msg,
                                      content:
                                          fullContent.trim() || "已停止生成",
                                  }
                                : msg,
                        ),
                    )
                } else {
                    setIsLoading(false)
                    setError(error)
                    onError?.(error)
                    toast.error(`AI 对话出错: ${error.message}`)

                    // 更新助手消息为错误信息
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? {
                                      ...msg,
                                      content: `⛔️ 出错了: ${error.message}`,
                                  }
                                : msg,
                        ),
                    )
                }
            } finally {
                setIsLoading(false)
            }
        },
        [diagramId, aiConfig, freeTrial, isLoading, onMessageComplete, onError],
    )

    const stop = useCallback(() => {
        abortControllerRef.current?.abort()
        setIsLoading(false)
    }, [])

    const clearMessages = useCallback(() => {
        setMessages([])
        setError(null)
    }, [])

    // 手动设置消息（用于加载历史记录）
    const setMessagesList = useCallback((messageList: Message[]) => {
        setMessages(messageList)
    }, [])

    return {
        messages,
        sendMessage,
        stop,
        clearMessages,
        setMessages: setMessagesList,
        isLoading,
        error,
    }
}
