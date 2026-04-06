/**
 * HTTP 持久化 Hook (Excalidraw 风格)
 *
 * 核心功能:
 * 1. 监听图表变化
 * 2. 防抖延迟(默认 2000ms)
 * 3. 抢锁机制（防止多客户端并发保存）
 * 4. 加密数据
 * 5. 调用后端上传快照接口
 *
 * 与 handleAutoSave 的区别:
 * - handleAutoSave: 用于 WebSocket 实时广播
 * - usePersistence: 用于 HTTP 持久化到数据库（带抢锁机制）
 *
 * 抢锁机制说明:
 * - 多个客户端同时编辑时，抢到锁的客户端负责上传快照
 * - 抢锁成功后有 5 分钟的冷却期
 * - 冷却期内其他客户端无法抢锁
 */

import { useEffect, useRef } from "react"
import { checkLock, uploadSnapshot } from "@/api/diagramController"
import { encryptData } from "./cryptoUtils"

export interface UsePersistenceOptions {
    /**
     * 房间 ID
     */
    roomId: string

    /**
     * 密钥(用于加密)
     */
    secretKey: string

    /**
     * 当前的图表数据 (XML 字符串)
     */
    xml: string

    /**
     * 是否启用持久化
     */
    enabled?: boolean

    /**
     * 防抖延迟(毫秒),默认 2000ms
     */
    debounceMs?: number

    /**
     * 保存成功回调
     */
    onSaveSuccess?: () => void

    /**
     * 保存失败回调
     */
    onSaveError?: (error: any) => void

    /**
     * 是否启用抢锁机制（默认启用）
     * 启用后，只有抢到锁的客户端才会保存快照
     */
    enableLock?: boolean
}

export function usePersistence({
    roomId,
    secretKey,
    xml,
    enabled = true,
    debounceMs = 2000,
    onSaveSuccess,
    onSaveError,
    enableLock = true,
}: UsePersistenceOptions) {
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastSavedXmlRef = useRef<string>("")
    const isSavingRef = useRef<boolean>(false)

    // 使用 ref 而不是 state，避免触发重新渲染导致无限循环
    const lockStatusRef = useRef<{
        hasLock: boolean
        message: string
    }>({ hasLock: false, message: "" })

    useEffect(() => {
        // 如果未启用或没有数据,直接返回
        if (!enabled || !xml) {
            return
        }

        // 如果正在保存,跳过这次更新
        if (isSavingRef.current) {
            console.log("[usePersistence] ⏭️ Skipping, save in progress")
            return
        }

        // 如果数据没有变化,跳过
        if (xml === lastSavedXmlRef.current) {
            console.log("[usePersistence] ⏭️ Skipping, no changes")
            return
        }

        // 清除之前的定时器
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        // 设置新的定时器
        saveTimeoutRef.current = setTimeout(async () => {
            console.log("[usePersistence] 💾 Attempting to save to backend...")

            try {
                isSavingRef.current = true

                // Step 1: 抢锁（如果启用）
                if (enableLock) {
                    console.log("[usePersistence] 🔒 Trying to acquire lock...")
                    try {
                        const lockResponse = await checkLock({
                            roomId,
                        })

                        console.log(
                            "[usePersistence] 🔒 Lock response:",
                            lockResponse,
                        )

                        // 检查响应：code === 0 表示成功，data === true 表示抢到锁
                        const lockAcquired =
                            lockResponse?.code === 0 &&
                            lockResponse?.data === true

                        console.log(
                            "[usePersistence] 🔒 Lock acquired:",
                            lockAcquired,
                            {
                                code: lockResponse?.code,
                                data: lockResponse?.data,
                            },
                        )

                        if (!lockAcquired) {
                            console.log(
                                "[usePersistence] ❌ Lock not acquired, another client is saving",
                            )
                            lockStatusRef.current = {
                                hasLock: false,
                                message: "其他客户端正在保存，跳过本次保存",
                            }
                            // 没抢到锁，放弃保存
                            return
                        }

                        console.log(
                            "[usePersistence] ✅ Lock acquired! This client will save the snapshot",
                        )
                        lockStatusRef.current = {
                            hasLock: true,
                            message: "已获得锁，正在保存快照...",
                        }
                    } catch (lockError) {
                        console.error(
                            "[usePersistence] ❌ Check lock failed:",
                            lockError,
                        )
                        // 抢锁失败，可以选择放弃保存或重试
                        // 这里选择放弃保存，避免并发冲突
                        lockStatusRef.current = {
                            hasLock: false,
                            message: "抢锁失败，跳过本次保存",
                        }
                        return
                    }
                }

                // Step 2: 加密数据
                console.log("[usePersistence] 🔒 Encrypting data...")
                const encryptedData = await encryptData(xml, secretKey)
                console.log(
                    "[usePersistence] 🔒 Data encrypted, size:",
                    encryptedData.length,
                )

                // 将 Uint8Array 转换为 base64 字符串用于传输
                const binaryString = Array.from(encryptedData, (byte) =>
                    String.fromCharCode(byte),
                ).join("")
                const base64Data = btoa(binaryString)

                // Step 3: 上传快照到后端
                console.log("[usePersistence] 📤 Uploading snapshot...")
                const uploadResponse = await uploadSnapshot(
                    { roomId },
                    base64Data,
                )

                if (uploadResponse?.code === 0) {
                    console.log(
                        "[usePersistence] ✅ Snapshot uploaded successfully",
                    )
                    lastSavedXmlRef.current = xml
                    lockStatusRef.current = {
                        hasLock: false,
                        message: "快照保存成功",
                    }
                    onSaveSuccess?.()
                } else {
                    throw new Error(uploadResponse?.message || "上传快照失败")
                }
            } catch (error) {
                console.error("[usePersistence] ❌ Save failed:", error)
                lockStatusRef.current = {
                    hasLock: false,
                    message: `保存失败: ${error}`,
                }
                onSaveError?.(error)
            } finally {
                isSavingRef.current = false
            }
        }, debounceMs)

        // 清理函数
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [
        xml,
        roomId,
        secretKey,
        enabled,
        debounceMs,
        onSaveSuccess,
        onSaveError,
    ])

    /**
     * 手动触发保存(不受防抖限制)
     */
    const manualSave = async () => {
        if (!xml) {
            console.warn("[usePersistence] ⚠️ No data to save")
            return
        }

        console.log("[usePersistence] 💾 Manual save triggered...")

        try {
            isSavingRef.current = true

            // Step 1: 抢锁（如果启用）
            if (enableLock) {
                console.log("[usePersistence] 🔒 Trying to acquire lock...")
                try {
                    const lockResponse = await checkLock({
                        roomId,
                    })

                    console.log(
                        "[usePersistence] 🔒 Lock response (manual):",
                        lockResponse,
                    )

                    // 检查响应：code === 0 表示成功，data === true 表示抢到锁
                    const lockAcquired =
                        lockResponse?.code === 0 && lockResponse?.data === true

                    console.log(
                        "[usePersistence] 🔒 Lock acquired (manual):",
                        lockAcquired,
                        {
                            code: lockResponse?.code,
                            data: lockResponse?.data,
                        },
                    )

                    if (!lockAcquired) {
                        console.log(
                            "[usePersistence] ❌ Lock not acquired, another client is saving",
                        )
                        lockStatusRef.current = {
                            hasLock: false,
                            message: "其他客户端正在保存",
                        }
                        return
                    }

                    console.log("[usePersistence] ✅ Lock acquired!")
                    lockStatusRef.current = {
                        hasLock: true,
                        message: "已获得锁，正在保存...",
                    }
                } catch (lockError) {
                    console.error(
                        "[usePersistence] ❌ Check lock failed:",
                        lockError,
                    )
                    lockStatusRef.current = {
                        hasLock: false,
                        message: "抢锁失败",
                    }
                    return
                }
            }

            // Step 2: 加密数据
            console.log("[usePersistence] 🔒 Encrypting data...")
            const encryptedData = await encryptData(xml, secretKey)
            console.log(
                "[usePersistence] 🔒 Data encrypted, size:",
                encryptedData.length,
            )

            // 将 Uint8Array 转换为 base64 字符串用于传输
            const binaryString = Array.from(encryptedData, (byte) =>
                String.fromCharCode(byte),
            ).join("")
            const base64Data = btoa(binaryString)

            // Step 3: 上传快照
            console.log("[usePersistence] 📤 Uploading snapshot...")
            const uploadResponse = await uploadSnapshot({ roomId }, base64Data)

            if (uploadResponse?.code === 0) {
                console.log("[usePersistence] ✅ Manual save succeeded")
                lastSavedXmlRef.current = xml
                lockStatusRef.current = {
                    hasLock: false,
                    message: "保存成功",
                }
                onSaveSuccess?.()
            } else {
                throw new Error(uploadResponse?.message || "上传快照失败")
            }
        } catch (error) {
            console.error("[usePersistence] ❌ Manual save failed:", error)
            lockStatusRef.current = {
                hasLock: false,
                message: `保存失败: ${error}`,
            }
            onSaveError?.(error)
        } finally {
            isSavingRef.current = false
        }
    }

    /**
     * 立即保存(如果有未保存的更改)
     */
    const flush = async () => {
        if (xml !== lastSavedXmlRef.current) {
            await manualSave()
        }
    }

    return {
        manualSave,
        flush,
        isSaving: isSavingRef.current,
        lockStatus: lockStatusRef.current,
    }
}
