"use client"

import { Lock, Sparkles, Download, Cloud, Edit3, ChevronRight, X } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"

interface LoginGateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    featureName?: string
    returnPath?: string
}

const PREMIUM_FEATURES = [
    { icon: <Download className="w-4 h-4" />, label: "高清无水印下载（PNG / SVG / XML）" },
    { icon: <Cloud className="w-4 h-4" />, label: "保存到云端，随时访问" },
    { icon: <Edit3 className="w-4 h-4" />, label: "在专业编辑器中继续编辑" },
    { icon: <Sparkles className="w-4 h-4" />, label: "不限次数 AI 智能生成" },
]

export function LoginGateDialog({
    open,
    onOpenChange,
    featureName = "此功能",
    returnPath,
}: LoginGateDialogProps) {
    const router = useRouter()

    if (!open) return null

    const handleLogin = () => {
        const redirect = returnPath || window.location.pathname
        router.push(`/user/login?redirect=${encodeURIComponent(redirect)}`)
    }

    const handleRegister = () => {
        const redirect = returnPath || window.location.pathname
        router.push(`/user/register?redirect=${encodeURIComponent(redirect)}`)
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* Dialog */}
            <div
                className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl bg-white"
                style={{
                    border: "1px solid rgba(0,0,0,0.05)",
                    animation: "loginGateIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
            >
                {/* Decorative background geometry */}
                <svg style={{ position: "absolute", top: "-5%", right: "-10%", zIndex: 0, opacity: 0.1 }} width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="58" stroke="#1677ff" strokeWidth="2" strokeDasharray="10 10" />
                </svg>
                <div style={{ position: "absolute", bottom: "-20%", left: "-20%", width: 200, height: 200, background: "rgba(22, 119, 255, 0.08)", filter: "blur(40px)", borderRadius: "50%", zIndex: 0 }} />
                
                {/* Content Container (z-index above backgrounds) */}
                <div className="relative z-10 flex flex-col h-full">
                {/* Top accent bar */}
                <div
                    style={{
                        height: 4,
                        background: "linear-gradient(90deg, #1677ff, #69b1ff, #1677ff)",
                    }}
                />

                {/* Close button */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="px-8 py-8">
                    {/* Icon + title */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                            style={{
                                background: "rgba(22, 119, 255, 0.08)",
                                border: "1px solid rgba(22, 119, 255, 0.15)",
                                boxShadow: "0 4px 12px rgba(22, 119, 255, 0.1)",
                            }}
                        >
                            <Lock className="w-7 h-7 text-blue-500" style={{ color: "#1677ff" }} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-1">
                            一步解锁完整功能
                        </h2>
                        <p className="text-sm text-slate-500">
                            <span className="text-slate-700 font-medium">{featureName}</span>
                            {" "}需要登录，完全免费
                        </p>
                    </div>

                    {/* Feature list */}
                    <div className="mb-6 space-y-2">
                        {PREMIUM_FEATURES.map((f, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                                style={{
                                    background: "#f8fafc",
                                    border: "1px solid #f1f5f9",
                                }}
                            >
                                <span style={{ color: "#1677ff" }}>{f.icon}</span>
                                <span className="text-sm text-slate-600">{f.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleLogin}
                            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] flex items-center justify-center gap-2"
                            style={{
                                background: "linear-gradient(135deg, #1677ff, #4096ff)",
                                boxShadow: "0 4px 14px rgba(22, 119, 255, 0.3)",
                                border: "none",
                            }}
                        >
                            立即登录
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRegister}
                            className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:bg-gray-50"
                            style={{
                                color: "#1677ff",
                                border: "1px solid #91caff",
                                background: "white",
                            }}
                        >
                            没有账号？免费注册
                        </button>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            稍后再说，继续试用
                        </button>
                    </div>
                </div>
                </div>
            </div>

            <style>{`
                @keyframes loginGateIn {
                    from { opacity: 0; transform: scale(0.9) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    )
}
