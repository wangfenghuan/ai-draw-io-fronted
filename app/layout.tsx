import type { Metadata, Viewport } from "next"
import { Providers } from "./providers"
import "./globals.css"
import "../styles/markdown.css"

export const viewport: Viewport = {
    themeColor: "#1677ff",
    width: "device-width",
    initialScale: 1,
}

export const metadata: Metadata = {
    title: {
        template: "%s | CloudGraph 智能绘图",
        default: "CloudGraph - AI 驱动的智能绘图平台",
    },
    description:
        "新一代在线绘图工具，支持流程图、思维导图、UML 等多种图形。AI 辅助生成，实时团队协作，让创意即刻落地。",
    keywords: [
        "draw.io",
        "diagram",
        "flowchart",
        "mind map",
        "UML",
        "AI drawing",
        "online whiteboard",
        "online diagram",
        "流程图",
        "思维导图",
        "在线绘图",
        "AI绘图",
    ],
    authors: [{ name: "CloudGraph Team" }],
    creator: "CloudGraph",
    publisher: "CloudGraph",
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        type: "website",
        locale: "zh_CN",
        url: "https://next-ai-drawio.jiang.jp",
        siteName: "CloudGraph 智能绘图",
        title: "CloudGraph - AI 驱动的智能绘图平台",
        description:
            "新一代在线绘图工具，支持流程图、思维导图、UML 等多种图形。AI 辅助生成，实时团队协作。",
        images: [
            {
                url: "/og-image.png", // Make sure this exists or replace
                width: 1200,
                height: 630,
                alt: "CloudGraph Preview",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "CloudGraph - AI 驱动的智能绘图平台",
        description:
            "新一代在线绘图工具，支持流程图、思维导图、UML 等多种图形。AI 辅助生成，实时团队协作。",
        images: ["/og-image.png"],
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="zh">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
