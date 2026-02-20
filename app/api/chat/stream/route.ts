import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8081"
        : "http://47.95.35.178:8081"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // 转发请求头中的 cookie 以保持用户认证
        const cookie = request.headers.get("cookie") || ""

        const backendResponse = await fetch(`${BACKEND_URL}/api/chat/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie,
            },
            body: JSON.stringify(body),
        })

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text().catch(() => "Unknown error")
            return NextResponse.json(
                { error: errorText },
                { status: backendResponse.status },
            )
        }

        if (!backendResponse.body) {
            return NextResponse.json(
                { error: "No response body from backend" },
                { status: 502 },
            )
        }

        // 将后端的 SSE 流直接透传给前端，不缓冲
        const stream = new ReadableStream({
            async start(controller) {
                const reader = backendResponse.body!.getReader()
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
                "X-Accel-Buffering": "no", // 禁用 Nginx 缓冲（如果用了 Nginx）
            },
        })
    } catch (error) {
        console.error("[SSE Proxy] Error:", error)
        return NextResponse.json(
            { error: "Failed to connect to backend" },
            { status: 502 },
        )
    }
}
