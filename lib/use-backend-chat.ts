import { useCallback, useRef, useState } from "react"

// 后端 API 地址
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api"

export interface Message {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp?: number
}

export interface UseBackendChatOptions {
    diagramId: string
    onMessageComplete?: (message: string) => void
    onError?: (error: Error) => void
}

export function useBackendChat({
    diagramId,
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

            try {
                // 使用原生 fetch API 调用后端 SSE 接口
                const response = await fetch(`${API_BASE_URL}/chat/stream`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: content.trim(),
                        diagramId: diagramId,
                    }),
                    signal: abortController.signal,
                    credentials: "include", // 携带 cookie
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                // 处理 SSE 流
                const reader = response.body?.getReader()
                const decoder = new TextDecoder()

                if (!reader) {
                    throw new Error("Response body is null")
                }

                let fullContent = ""
                let buffer = "" // 用于缓存不完整的数据块

                while (true) {
                    const { done, value } = await reader.read()

                    if (done) {
                        setIsLoading(false)
                        onMessageComplete?.(fullContent)
                        break
                    }

                    // 解码数据块
                    const chunk = decoder.decode(value, { stream: true })
                    buffer += chunk

                    // SSE 格式：每个事件用 \n\n 分隔
                    // 例如：data:{"type":"text","content":"我"}\n\ndata:{"type":"text","content":"将"}\n\n
                    const events = buffer.split(/\n\n/)

                    // 保留最后一个可能不完整的事件
                    buffer = events.pop() || ""

                    for (const event of events) {
                        if (!event.trim()) continue

                        // 每个事件格式：data:{"type":"text","content":"xxx"}
                        const lines = event.trim().split(/\n/)

                        for (const line of lines) {
                            if (!line.startsWith("data:")) continue

                            // 去掉 "data:" 前缀
                            const jsonData = line.substring(5).trim()

                            if (!jsonData) continue

                            try {
                                // 解析 JSON
                                const parsed = JSON.parse(jsonData)

                                // 提取 content 字段
                                if (parsed.type === "text" && parsed.content) {
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
                                }
                            } catch (parseError) {
                                console.warn(
                                    "Failed to parse SSE data:",
                                    jsonData,
                                    parseError,
                                )
                            }
                        }
                    }
                }
            } catch (err) {
                const error = err as Error
                if (error.name === "AbortError") {
                    console.log("Request was aborted")
                } else {
                    setIsLoading(false)
                    setError(error)
                    onError?.(error)

                    // 更新助手消息为错误信息
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? { ...msg, content: `错误: ${error.message}` }
                                : msg,
                        ),
                    )
                }
            } finally {
                setIsLoading(false)
            }
        },
        [diagramId, isLoading, onMessageComplete, onError],
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
