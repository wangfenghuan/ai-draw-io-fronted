"use client"

import { useCallback, useRef } from "react"
import type { DrawIoEmbedRef } from "react-drawio"
import { toast } from "sonner"
import { editDiagram } from "@/api/diagramController"

// 辅助函数：睡眠/延时
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface SaveOptions {
    diagramId: string
    userId: string
    title: string
    xml: string
}

export interface DownloadOptions {
    diagramId: string
    filename: string
    format: "PNG" | "SVG" | "XML"
}

export function useDiagramSave(drawioRef: React.Ref<DrawIoEmbedRef | null>) {
    // 用于暂存导出操作的 Promise 控制器
    const exportPromiseRef = useRef<{
        resolve: (data: string) => void
        reject: (error: Error) => void
        format: string
    } | null>(null)

    /**
     * 导出图表为指定格式（返回 Promise）
     */
    const exportDiagram = useCallback(
        (format: "xml" | "png" | "svg"): Promise<string> => {
            return new Promise((resolve, reject) => {
                if (!drawioRef.current) {
                    reject(new Error("Draw.io 编辑器未就绪"))
                    return
                }

                if (exportPromiseRef.current) {
                    console.warn("上一次导出尚未完成，正在重置...")
                    exportPromiseRef.current = null
                }

                exportPromiseRef.current = {
                    resolve,
                    reject,
                    format,
                }

                try {
                    // xml 使用 xmlsvg，其他对应格式
                    const drawioFormat =
                        format === "xml"
                            ? "xmlsvg"
                            : format === "png"
                              ? "png"
                              : "xmlsvg"
                    drawioRef.current.exportDiagram({
                        format: drawioFormat,
                    })
                } catch (error) {
                    exportPromiseRef.current = null
                    reject(error)
                }
            })
        },
        [drawioRef],
    )

    /**
     * 处理 Draw.io 导出回调
     */
    const handleExportCallback = useCallback((data: string) => {
        if (exportPromiseRef.current) {
            console.log(
                `[useDiagramSave] 接收到导出数据 (${exportPromiseRef.current.format})`,
            )
            exportPromiseRef.current.resolve(data)
            exportPromiseRef.current = null
        }
    }, [])

    /**
     * 上传文件到后端 (适配 @RequestPart)
     */
    const uploadFile = useCallback(
        async (
            file: File,
            diagramId: string,
            userId: string,
            bizType: "png" | "svg",
        ): Promise<string | null> => {
            try {
                const formData = new FormData()

                // 1. 添加文件
                formData.append("file", file)

                // 2. 添加请求参数 (适配后端 @RequestPart("diagramUploadRequest"))
                // 必须使用 Blob 并指定 type: application/json，后端才能正确解析 JSON
                const requestBody = {
                    biz: bizType, // 确保后端枚举能匹配 "png" 或 "svg"
                    diagramId: diagramId,
                    userId: userId,
                }

                const jsonBlob = new Blob([JSON.stringify(requestBody)], {
                    type: "application/json",
                })

                formData.append("diagramUploadRequest", jsonBlob)

                console.log(
                    `[useDiagramSave] 开始上传 ${bizType.toUpperCase()} 文件...`,
                )

                const API_BASE_URL =
                    process.env.NEXT_PUBLIC_API_BASE_URL ||
                    "http://localhost:8081/api"

                const response = await fetch(`${API_BASE_URL}/diagram/upload`, {
                    method: "POST",
                    // fetch 自动设置 multipart/form-data boundary，不要手动设置 Content-Type
                    body: formData,
                    credentials: "include",
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const result = await response.json()

                if (result?.code === 0 && result?.data) {
                    console.log(
                        `[useDiagramSave] ${bizType} 上传成功:`,
                        result.data,
                    )
                    return result.data
                } else {
                    console.error(
                        `[useDiagramSave] ${bizType} 上传失败:`,
                        result,
                    )
                    return null
                }
            } catch (error) {
                console.error(`[useDiagramSave] ${bizType} 上传异常:`, error)
                return null
            }
        },
        [],
    )

    /**
     * 保存图表到后端 (串行流程)
     */
    const saveDiagram = useCallback(
        async ({
            diagramId,
            userId,
            title,
            xml,
        }: SaveOptions): Promise<boolean> => {
            try {
                toast.loading("正在保存图表...", { id: "save-diagram" })
                let pngUrl: string | null = null
                let svgUrl: string | null = null

                // 1. 处理 PNG
                try {
                    const pngData = await exportDiagram("png")
                    const pngFile = base64ToFile(
                        pngData,
                        `${title}.png`,
                        "image/png",
                    )
                    pngUrl = await uploadFile(pngFile, diagramId, userId, "png")
                } catch (e) {
                    console.error("PNG 处理失败:", e)
                }

                await sleep(100) // 缓冲

                // 2. 处理 SVG
                try {
                    const svgData = await exportDiagram("svg")
                    const svgFile = base64ToFile(
                        svgData,
                        `${title}.svg`,
                        "image/svg+xml",
                    )
                    svgUrl = await uploadFile(svgFile, diagramId, userId, "svg")
                } catch (e) {
                    console.error("SVG 处理失败:", e)
                }

                // 3. 更新图表信息 (XML)
                const response = await editDiagram({
                    id: diagramId,
                    title: title,
                    diagramCode: xml,
                    pictureUrl: pngUrl || svgUrl || undefined,
                })

                if (response?.code === 0) {
                    toast.success("图表保存成功！", { id: "save-diagram" })
                    return true
                } else {
                    throw new Error(response?.message || "保存接口返回错误")
                }
            } catch (error) {
                console.error("[useDiagramSave] 保存流程致命错误:", error)
                toast.error(
                    `保存失败: ${error instanceof Error ? error.message : "未知错误"}`,
                    {
                        id: "save-diagram",
                    },
                )
                return false
            }
        },
        [exportDiagram, uploadFile],
    )

    /**
     * 下载图表
     */
    const downloadDiagram = useCallback(
        async ({
            diagramId,
            filename,
            format,
        }: DownloadOptions): Promise<void> => {
            try {
                toast.loading("正在准备下载...", { id: "download-diagram" })

                const API_BASE_URL =
                    process.env.NEXT_PUBLIC_API_BASE_URL ||
                    "http://localhost:8081/api"

                // 适配后端的 downloadRemoteFile 参数: fileName, type, diagramId
                const params = new URLSearchParams({
                    type: format.toUpperCase(), // SVG, PNG, XML
                    diagramId: String(diagramId),
                    fileName: filename,
                })

                const response = await fetch(
                    `${API_BASE_URL}/diagram/stream-download?${params.toString()}`,
                    {
                        method: "GET",
                        credentials: "include",
                    },
                )

                if (!response.ok) {
                    throw new Error(`下载失败: ${response.statusText}`)
                }

                const blob = await response.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                // 根据 format 决定后缀
                const ext = format === "xml" ? "drawio" : format.toLowerCase()
                a.download = `${filename}.${ext}`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)

                toast.success("下载完成！", { id: "download-diagram" })
            } catch (error) {
                console.error("下载异常:", error)
                toast.error(
                    `下载失败: ${error instanceof Error ? error.message : "未知错误"}`,
                    {
                        id: "download-diagram",
                    },
                )
            }
        },
        [],
    )

    return {
        exportDiagram,
        handleExportCallback,
        saveDiagram,
        downloadDiagram,
    }
}

// 完整的 Base64 转 File 函数
function base64ToFile(
    base64: string,
    filename: string,
    mimeType: string,
): File {
    try {
        if (!base64) return new File([""], filename, { type: mimeType })
        const base64Data = base64.includes(",") ? base64.split(",")[1] : base64
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        return new File([new Blob([byteArray], { type: mimeType })], filename, {
            type: mimeType,
        })
    } catch (e) {
        console.error("Base64 conversion error", e)
        return new File([""], filename, { type: mimeType })
    }
}
