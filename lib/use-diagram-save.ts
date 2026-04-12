"use client"

import { useCallback, useRef } from "react"
import type { DrawIoEmbedRef } from "react-drawio"
import { toast } from "sonner"
import { editDiagram } from "@/api/diagramController"

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

export function useDiagramSave(drawioRef: React.RefObject<DrawIoEmbedRef | null>) {
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
                    // xml 使用 xmlsvg，其他格式（png、svg）直接使用
                    const drawioFormat = format === "xml" ? "xmlsvg" : format
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
                    process.env.NEXT_PUBLIC_API_BASE_URL || "/api"

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
     * 保存图表到后端 (并行优化)
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

                // 并行导出和上传 PNG/SVG
                const [pngResult, svgResult] = await Promise.allSettled([
                    exportDiagram("png").then((pngData) => {
                        const pngFile = dataToFile(
                            pngData,
                            `${title}.png`,
                            "image/png",
                        )
                        return uploadFile(pngFile, diagramId, userId, "png")
                    }),
                    exportDiagram("svg").then((svgData) => {
                        const svgFile = dataToFile(
                            svgData,
                            `${title}.svg`,
                            "image/svg+xml",
                        )
                        return uploadFile(svgFile, diagramId, userId, "svg")
                    }),
                ])

                // 处理结果
                if (pngResult.status === "fulfilled" && pngResult.value) {
                    pngUrl = pngResult.value
                } else {
                    console.warn("PNG 处理失败:", pngResult)
                }

                if (svgResult.status === "fulfilled" && svgResult.value) {
                    svgUrl = svgResult.value
                } else {
                    console.warn("SVG 处理失败:", svgResult)
                }

                // 更新图表信息 (XML)
                console.log(
                    "[useDiagramSave] 📤 准备调用 editDiagram API，参数:",
                    {
                        id: diagramId,
                        title: title,
                        xmlLength: xml.length,
                        pictureUrl: pngUrl || svgUrl || undefined,
                    },
                )

                const response = await editDiagram({
                    id: diagramId,
                    name: title,
                    diagramCode: xml,
                    pictureUrl: pngUrl || svgUrl || undefined,
                })

                console.log(
                    "[useDiagramSave] 📥 editDiagram API 响应:",
                    response,
                )

                if (response?.code === 0) {
                    // 根据结果给出不同提示
                    if (pngUrl && svgUrl) {
                        toast.success("图表保存成功！", { id: "save-diagram" })
                    } else if (pngUrl || svgUrl) {
                        toast.success("图表保存成功（预览图部分生成失败）", {
                            id: "save-diagram",
                        })
                    } else {
                        toast.success("图表保存成功（无预览图）", {
                            id: "save-diagram",
                        })
                    }
                    console.log("[useDiagramSave] ✅ 图表保存成功")
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

                // 1. 直接从编辑器导出最新数据 (Client-side)
                // 这样可以确保下载的是当前正在编辑的内容，不需要先保存到后端
                const data = await exportDiagram(
                    format.toLowerCase() as "xml" | "png" | "svg",
                )

                if (!data) {
                    throw new Error("导出数据为空")
                }

                // 2. 转换格式
                let mimeType = "text/plain"
                let ext = format.toLowerCase()

                if (format === "PNG") {
                    mimeType = "image/png"
                    // dataToFile 已经处理了 base64
                } else if (format === "SVG") {
                    mimeType = "image/svg+xml"
                } else if (format === "XML") {
                    mimeType = "application/xml"
                    ext = "drawio"
                }

                // 3. 生成文件对象
                const file = dataToFile(data, `${filename}.${ext}`, mimeType)

                // 4. 触发浏览器下载
                const url = URL.createObjectURL(file)
                const a = document.createElement("a")
                a.href = url
                a.download = file.name
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
        [exportDiagram],
    )

    return {
        exportDiagram,
        handleExportCallback,
        saveDiagram,
        downloadDiagram,
    }
}

/**
 * 将导出数据转换为 File 对象（优化版）
 * 支持两种格式：
 * 1. Base64 data URL (data:xxx;base64,...) - PNG 等格式
 * 2. 纯文本字符串 - SVG 等格式
 */
function dataToFile(data: string, filename: string, mimeType: string): File {
    try {
        if (!data) {
            return new File([""], filename, { type: mimeType })
        }

        // 判断是否是 base64 data URL
        if (data.startsWith("data:")) {
            // Base64 data URL 格式 (PNG) - 使用更高效的转换方法
            const base64Data = data.includes(",") ? data.split(",")[1] : data
            // 使用 Uint8Array.from 避免创建中间数组
            const byteArray = Uint8Array.from(atob(base64Data), (c) =>
                c.charCodeAt(0),
            )
            return new File([byteArray], filename, { type: mimeType })
        }
        // 纯文本格式 (SVG)
        return new File([data], filename, { type: mimeType })
    } catch (e) {
        console.error("数据转换失败:", e)
        return new File([""], filename, { type: mimeType })
    }
}
