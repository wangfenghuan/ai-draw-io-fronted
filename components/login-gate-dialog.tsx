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
                className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    animation: "loginGateIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
            >
                {/* Top accent bar */}
                <div
                    style={{
                        height: 3,
                        background: "linear-gradient(90deg, #475569, #94a3b8, #475569)",
                    }}
                />

                {/* Close button */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="px-8 py-8">
                    {/* Icon + title */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                            style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.12)",
                            }}
                        >
                            <Lock className="w-7 h-7 text-white/70" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">
                            一步解锁完整功能
                        </h2>
                        <p className="text-sm text-white/50">
                            <span className="text-white/80 font-medium">{featureName}</span>
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
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                }}
                            >
                                <span className="text-white/50">{f.icon}</span>
                                <span className="text-sm text-white/75">{f.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleLogin}
                            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] flex items-center justify-center gap-2"
                            style={{
                                background: "linear-gradient(135deg, #334155, #475569)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                            }}
                        >
                            立即登录
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRegister}
                            className="w-full py-3 rounded-xl font-medium text-white/70 text-sm transition-all duration-200 hover:text-white hover:bg-white/10"
                            style={{
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                        >
                            没有账号？免费注册
                        </button>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-full py-2 text-xs text-white/30 hover:text-white/50 transition-colors"
                        >
                            稍后再说，继续试用
                        </button>
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
