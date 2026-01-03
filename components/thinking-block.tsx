"use client"

import { Brain, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./ui/collapsible"

interface ThinkingBlockProps {
    content: string
    defaultOpen?: boolean
}

/**
 * 深度思考组件
 * 用于展示 AI 的思考过程，支持折叠/展开
 */
export function ThinkingBlock({
    content,
    defaultOpen = false,
}: ThinkingBlockProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    // 提取思考内容（如果包含在特定标签中）
    const thinkingContent = extractThinkingContent(content)

    if (!thinkingContent) {
        return null
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="my-3 rounded-lg border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm overflow-hidden">
                <CollapsibleTrigger className="w-full px-3 py-2 flex items-center gap-2 hover:bg-purple-500/10 transition-colors text-left">
                    <Brain className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-purple-300 flex-1">
                        深度思考
                    </span>
                    {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                    )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-3 pb-3 pt-1">
                        <div className="text-xs text-purple-200/90 leading-relaxed whitespace-pre-wrap font-mono bg-black/20 rounded p-2">
                            {thinkingContent}
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    )
}

/**
 * 从内容中提取思考内容
 * 支持的格式：
 * 1. <thinking>...</thinking> 标签
 * 2. [思考]...[/思考] 标签
 * 3. 【思考】...【思考结束】
 */
function extractThinkingContent(content: string): string | null {
    // 匹配 <thinking>...</thinking> 标签
    const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/)
    if (thinkingMatch) {
        return thinkingMatch[1].trim()
    }

    // 匹配 [思考]...[/思考] 标签
    const bracketMatch = content.match(/\[思考\]([\s\S]*?)\[\/思考\]/)
    if (bracketMatch) {
        return bracketMatch[1].trim()
    }

    // 匹配 【思考】...【思考结束】
    const chineseMatch = content.match(/【思考】([\s\S]*?)【思考结束】/)
    if (chineseMatch) {
        return chineseMatch[1].trim()
    }

    return null
}

/**
 * 从内容中移除思考标签，返回纯净的内容
 */
export function removeThinkingTags(content: string): string {
    return content
        .replace(/<thinking>([\s\S]*?)<\/thinking>/g, "")
        .replace(/\[思考\]([\s\S]*?)\[\/思考\]/g, "")
        .replace(/【思考】([\s\S]*?)【思考结束】/g, "")
        .trim()
}
