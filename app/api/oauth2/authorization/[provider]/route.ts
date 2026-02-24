import { NextRequest } from "next/server"

const BACKEND_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8081"
        : "http://47.95.35.178:8081"

export async function GET(
    request: NextRequest,
    { params }: { params: { provider: string } }
) {
    const { provider } = params
    
    // 获取当前请求的原始 Host 和协议，以便传递给后端，让后端生成正确的 redirect_uri
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "www.intellidraw.top"
    const proto = request.headers.get("x-forwarded-proto") || "https"
    
    // 构建访问后端的绝对 URL
    const backendEndpoint = `${BACKEND_URL}/api/oauth2/authorization/${provider}`

    try {
        const backendResponse = await fetch(backendEndpoint, {
            method: "GET",
            headers: {
                // 强制携带源 Host
                "Host": host,
                "X-Forwarded-Host": host,
                "X-Forwarded-Proto": proto,
                // 透传 Cookie
                "Cookie": request.headers.get("cookie") || ""
            },
            // 重要：不要跟随 302 重定向，我们要把 302 原样返回给浏览器
            redirect: "manual",
        })

        // 创建需要返回的 Headers
        const responseHeaders = new Headers()
        
        // 将后端的响应头（特别是 Set-Cookie 和 Location）完全透传
        backendResponse.headers.forEach((value, key) => {
            responseHeaders.append(key, value)
        })

        return new Response(backendResponse.body, {
            status: backendResponse.status,
            headers: responseHeaders,
        })
    } catch (error) {
        console.error(`[OAuth2 Proxy] Error initiating login for ${provider}:`, error)
        return new Response("Failed to initiate OAuth2 login", { status: 502 })
    }
}
