"use client"

/**
 * DemoChatPanel – wraps SimpleChatPanel for the public /demo page.
 *
 * Adds a thin "free trial" bar on top with Download/Save buttons that
 * trigger the LoginGateDialog instead of performing the real action.
 */

import { Cloud, Download } from "lucide-react"
import SimpleChatPanel from "@/components/simple-chat-panel"

interface DemoChatPanelProps {
    isVisible: boolean
    onToggleVisibility: () => void
    darkMode: boolean
    isMobile?: boolean
    onRequireLogin: (featureName: string) => void
}

export default function DemoChatPanel({
    isVisible,
    onToggleVisibility,
    darkMode,
    isMobile = false,
    onRequireLogin,
}: DemoChatPanelProps) {
    return (
        <div className="h-full flex flex-col">
            {/* Premium actions bar */}
            {isVisible && (
                <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20 shrink-0">
                    <span className="text-xs font-medium text-muted-foreground">
                        免费体验版 · 无需注册即可生成图表
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onRequireLogin("下载高清图表")}
                            className="h-7 px-2.5 text-xs font-medium inline-flex items-center gap-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <Download className="w-3.5 h-3.5" />
                            下载
                        </button>
                        <button
                            onClick={() => onRequireLogin("保存到我的空间")}
                            className="h-7 px-2.5 text-xs font-medium inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Cloud className="w-3.5 h-3.5" />
                            保存
                        </button>
                    </div>
                </div>
            )}

            {/* SimpleChatPanel – same as the diagram editor panel */}
            <div className="flex-1 min-h-0">
                <SimpleChatPanel
                    diagramId="demo"
                    isVisible={isVisible}
                    onToggleVisibility={onToggleVisibility}
                    darkMode={darkMode}
                    diagramTitle="免费体验 Demo"
                    onRequireLogin={onRequireLogin}
                />
            </div>
        </div>
    )
}
