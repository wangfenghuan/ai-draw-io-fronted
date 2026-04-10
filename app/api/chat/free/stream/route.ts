import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8081"
        : "http://47.95.35.178:8081"

/**
 * 免费试用 AI 绘图接口
 * 无需登录，IP 级别限流（每天 3 次）
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // 免费试用接口不需要认证，不转发 cookie
        const backendResponse = await fetch(
            `${BACKEND_URL}/api/chat/free/stream`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            },
        )

        if (!backendResponse.ok) {
            const errorText = await backendResponse
                .text()
                .catch(() => "Unknown error")
            try {
                const errorJson = JSON.parse(errorText)
                return NextResponse.json(errorJson, {
                    status: backendResponse.status,
                })
            } catch {
                return NextResponse.json(
                    { error: errorText },
                    { status: backendResponse.status },
                )
            }
        }

        // 检查后端是否返回了 JSON（例如业务异常）
        const contentType = backendResponse.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
            const jsonResponse = await backendResponse.json().catch(() => ({}))
            return NextResponse.json(jsonResponse, {
                status: backendResponse.status,
            })
        }

        if (!backendResponse.body) {
            return NextResponse.json(
                { error: "No response body from backend" },
                { status: 502 },
            )
        }

        const responseBody = backendResponse.body
        // 将后端的 SSE 流直接透传给前端，不缓冲
        const stream = new ReadableStream({
            async start(controller) {
                const reader = responseBody.getReader()
                try {
                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) {
                            controller.close()
                            break
                        }
                        controller.enqueue(value)
                    }
                } catch (error) {
                    controller.error(error)
                }
            },
        })

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
                "X-Accel-Buffering": "no", // 禁用 Nginx 缓冲
            },
        })
    } catch (error) {
        console.error("[Free Trial SSE Proxy] Error:", error)
        return NextResponse.json(
            { error: "Failed to connect to backend" },
            { status: 502 },
        )
    }
}