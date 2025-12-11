"use client"

import { Coffee, X } from "lucide-react"
import Link from "next/link"
import type React from "react"
import { FaGithub } from "react-icons/fa"

interface QuotaLimitToastProps {
    type?: "request" | "token"
    used: number
    limit: number
    onDismiss: () => void
}

export function QuotaLimitToast({
    type = "request",
    used,
    limit,
    onDismiss,
}: QuotaLimitToastProps) {
    const isTokenLimit = type === "token"
    const formatNumber = (n: number) =>
        n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString()
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault()
            onDismiss()
        }
    }

    return (
        <div
            role="alert"
            aria-live="polite"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="relative w-[400px] overflow-hidden rounded-xl border border-border/50 bg-card p-5 shadow-soft animate-message-in"
        >
            {/* Close button */}
            <button
                onClick={onDismiss}
                className="absolute right-3 top-3 p-1.5 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Title row with icon */}
            <div className="flex items-center gap-2.5 mb-3 pr-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <Coffee
                        className="w-4 h-4 text-accent-foreground"
                        strokeWidth={2}
                    />
                </div>
                <h3 className="font-semibold text-foreground text-sm">
                    {isTokenLimit ? "已达到每日 Token 限额" : "已达到每日限额"}
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-muted-foreground">
                    {isTokenLimit
                        ? `${formatNumber(used)}/${formatNumber(limit)} tokens`
                        : `${used}/${limit}`}
                </span>
            </div>

            {/* Message */}
            <div className="text-sm text-muted-foreground leading-relaxed mb-4 space-y-2">
                <p>
                    哎呀 - 您已达到此演示的每日 {isTokenLimit ? "token" : "API"}{" "}
                    限额！作为独立开发者，我需要自行承担所有 API
                    费用，因此必须设置这些限制以保持可持续性。{" "}
                    <Link
                        href="/about"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-amber-600 font-medium hover:text-amber-700 hover:underline"
                    >
                        了解更多 →
                    </Link>
                </p>
                <p>
                    <strong>提示：</strong>您可以使用自己的 API
                    密钥（点击设置图标）或自行托管项目以绕过这些限制。
                </p>
                <p>您的限额将在明天重置。感谢您的理解！</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
                <a
                    href="https://github.com/wangfenghuan/w-next-ai-drawio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <FaGithub className="w-3.5 h-3.5" />
                    自行托管
                </a>
                <a
                    href="https://github.com/sponsors/wangfenghuan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                    <Coffee className="w-3.5 h-3.5" />
                    赞助
                </a>
            </div>
        </div>
    )
}
