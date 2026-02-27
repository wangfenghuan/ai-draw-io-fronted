"use client"

import { useEffect, useRef, useState, memo } from "react"
import MaterialViewer from "./MaterialViewer"

interface LazyMaterialViewerProps {
    xml?: string
    style?: React.CSSProperties
    className?: string
    /** 图片URL，优先显示图片 */
    pictureUrl?: string
    /** SVG URL，次优先显示 */
    svgUrl?: string
    /** 是否强制使用图表渲染器（即使有图片） */
    forceUseViewer?: boolean
    /** 懒加载阈值，距离视口多少像素开始加载 */
    rootMargin?: string
    /** 占位符高度 */
    placeholderHeight?: number | string
}

/**
 * 懒加载的素材查看器
 * - 使用 Intersection Observer 实现懒加载
 * - 优先显示图片（pictureUrl > svgUrl）
 * - 没有图片时才使用 MaterialViewer 渲染图表
 * - 渲染时显示骨架屏占位
 */
function LazyMaterialViewer({
    xml,
    style,
    className,
    pictureUrl,
    svgUrl,
    forceUseViewer = false,
    rootMargin = "100px",
    placeholderHeight = "100%",
}: LazyMaterialViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)

    // 决定使用哪种渲染方式
    const shouldUseImage = !forceUseViewer && (pictureUrl || svgUrl)
    const imageUrl = pictureUrl || svgUrl

    useEffect(() => {
        const element = containerRef.current
        if (!element) return

        // 如果已经有图片且不需要强制使用 viewer，直接标记为已加载
        if (shouldUseImage && imageUrl) {
            setIsVisible(true)
            return
        }

        // 没有图表代码，不需要加载
        if (!xml) {
            return
        }

        // 使用 Intersection Observer 实现懒加载
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true)
                        observer.unobserve(entry.target)
                    }
                })
            },
            {
                rootMargin,
                threshold: 0.01,
            }
        )

        observer.observe(element)

        return () => {
            observer.disconnect()
        }
    }, [xml, shouldUseImage, imageUrl, rootMargin])

    // 图片加载完成回调
    const handleImageLoad = () => {
        setHasLoaded(true)
    }

    // 图片加载失败回调
    const handleImageError = () => {
        setHasError(true)
        // 图片加载失败，尝试使用图表渲染器
        if (xml) {
            setHasLoaded(false)
        }
    }

    // MaterialViewer 加载完成回调
    const handleViewerLoad = () => {
        setHasLoaded(true)
    }

    // 渲染骨架屏
    const renderSkeleton = () => (
        <div
            className="animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 rounded-lg"
            style={{
                width: "100%",
                height: placeholderHeight,
                ...style,
            }}
        >
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-300/50"></div>
            </div>
        </div>
    )

    // 渲染空状态
    const renderEmpty = () => (
        <div
            className="flex items-center justify-center text-slate-400"
            style={{
                width: "100%",
                height: placeholderHeight,
                ...style,
            }}
        >
            <span className="text-sm">暂无预览</span>
        </div>
    )

    return (
        <div
            ref={containerRef}
            className={`lazy-material-viewer ${className || ""}`}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* 未可见时显示骨架屏 */}
            {!isVisible && !shouldUseImage && renderSkeleton()}

            {/* 可见后渲染内容 */}
            {isVisible && (
                <>
                    {/* 有图片时优先显示图片 */}
                    {shouldUseImage && imageUrl && !hasError && (
                        <div className="relative w-full h-full">
                            {/* 图片加载中显示骨架屏 */}
                            {!hasLoaded && renderSkeleton()}
                            <img
                                src={imageUrl}
                                alt="素材预览"
                                className={`w-full h-full object-contain transition-opacity duration-300 ${
                                    hasLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
                                }`}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* 图片加载失败或强制使用 viewer */}
                    {((shouldUseImage && hasError) || !shouldUseImage) && xml && (
                        <div className="w-full h-full">
                            <MaterialViewer
                                xml={xml}
                                style={{ ...style, width: "100%", height: "100%" }}
                                className={className}
                            />
                        </div>
                    )}

                    {/* 既没有图片也没有图表代码 */}
                    {!imageUrl && !xml && renderEmpty()}
                </>
            )}
        </div>
    )
}

// 使用 memo 优化性能，避免不必要的重渲染
export default memo(LazyMaterialViewer)