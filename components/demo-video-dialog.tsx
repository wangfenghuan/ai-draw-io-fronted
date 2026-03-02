"use client"

import { X, Play } from "lucide-react"
import { useEffect, useState } from "react"

interface DemoGif {
    key: string
    label: string
    src: string
    description: string
}

const DEMO_GIFS: DemoGif[] = [
    {
        key: "springboot",
        label: "Spring Boot 架构图",
        src: "/生成SpringBoot架构图.gif",
        description: "上传 Spring Boot 项目 ZIP，AI 自动解析并生成分层架构图",
    },
    {
        key: "sql",
        label: "SQL → ER 图",
        src: "/生成ER图.gif",
        description: "上传 SQL DDL 文件，一键生成专业实体关系图（ERD）",
    },
    {
        key: "flow",
        label: "AI 生成流程图",
        src: "/ai生成流程图.gif",
        description: "用自然语言描述业务流程，AI 即刻生成标准流程图",
    },
]

interface DemoVideoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DemoVideoDialog({ open, onOpenChange }: DemoVideoDialogProps) {
    const [activeKey, setActiveKey] = useState(DEMO_GIFS[0].key)

    // Reset to first tab whenever dialog opens
    useEffect(() => {
        if (open) {
            setActiveKey(DEMO_GIFS[0].key)
        }
    }, [open])

    // Close on Escape key
    useEffect(() => {
        if (!open) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onOpenChange(false)
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [open, onOpenChange])

    if (!open) return null

    const activeGif = DEMO_GIFS.find((g) => g.key === activeKey)!

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* Dialog */}
            <div
                className="relative w-full mx-4 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                    maxWidth: 880,
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    animation: "demoVideoIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                    <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-white/60" />
                        <span className="text-white font-semibold text-sm">功能演示</span>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tab bar */}
                <div
                    className="flex gap-1 px-6 pt-4 pb-0"
                >
                    {DEMO_GIFS.map((gif) => {
                        const isActive = gif.key === activeKey
                        return (
                            <button
                                key={gif.key}
                                onClick={() => setActiveKey(gif.key)}
                                className="px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200"
                                style={{
                                    background: isActive
                                        ? "rgba(255,255,255,0.08)"
                                        : "transparent",
                                    color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                                    borderBottom: isActive
                                        ? "2px solid rgba(255,255,255,0.5)"
                                        : "2px solid transparent",
                                }}
                            >
                                {gif.label}
                            </button>
                        )
                    })}
                </div>

                {/* GIF area */}
                <div className="px-6 pb-6 pt-3">
                    {/* Description */}
                    <p className="text-white/50 text-xs mb-3">{activeGif.description}</p>

                    {/* GIF display */}
                    <div
                        className="w-full overflow-hidden rounded-xl"
                        style={{
                            background: "#000",
                            aspectRatio: "16/9",
                            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                        }}
                    >
                        <img
                            key={activeKey}
                            src={activeGif.src}
                            alt={activeGif.label}
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes demoVideoIn {
                    from { opacity: 0; transform: scale(0.95) translateY(12px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    )
}
