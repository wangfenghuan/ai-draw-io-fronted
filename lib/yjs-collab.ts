/**
 * Yjs 实时协作模块
 *
 * 核心功能：
 * 1. WebSocket 连接管理
 * 2. Draw.io XML 与 Yjs 文本类型的双向同步
 * 3. 感知其他用户光标位置（可选）
 * 4. 快照检测与上传
 */

import { HocuspocusProvider } from "@hocuspocus/provider"
import * as Y from "yjs"
import { checkLock, uploadSnapshot } from "@/api/diagramController"

// 配置常量
export const YJS_CONFIG = {
    // WebSocket 服务器地址（从环境变量获取，默认使用本地后端）
    WS_URL: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/api",

    // 快照上传阈值：当 update 计数超过此值时触发快照
    SNAPSHOT_THRESHOLD: 500,

    // 快照上传分布式锁超时时间（毫秒）
    LOCK_TIMEOUT: 5 * 60 * 1000, // 5 分钟

    // WebSocket 重连配置
    RECONNECT: true,
    RECONNECT_INTERVAL: 1000, // 1 秒
    RECONNECT_MAX_ATTEMPTS: 10,
}

export interface YjsCollaborationOptions {
    roomName: string
    diagramId: string
    onRemoteChange?: (xml: string) => void
    onConnectionStatusChange?: (
        status: "connecting" | "connected" | "disconnected",
    ) => void
    onUserCountChange?: (count: number) => void
    isReadOnly?: boolean
}

export class YjsCollaboration {
    private provider: HocuspocusProvider | null = null
    private ytext: Y.Text | null = null
    private roomName: string
    private options: YjsCollaborationOptions
    private updateCount = 0
    private isDisposed = false
    private lastXML = ""
    private syncTimeout: NodeJS.Timeout | null = null
    private isSynced = false // 标记是否已完成首次同步
    private isConnectedFlag = false // 标记 WebSocket 连接状态

    constructor(options: YjsCollaborationOptions) {
        this.roomName = options.roomName
        this.options = options

        this.initialize()
    }

    private async initialize() {
        try {
            // 建立 WebSocket 连接
            // HocuspocusProvider 使用 name 参数指定文档名
            const wsUrl = YJS_CONFIG.WS_URL

            console.log(
                "[Yjs] Connecting to Hocuspocus:",
                wsUrl,
                "room:",
                this.roomName,
            )

            this.provider = new HocuspocusProvider({
                url: wsUrl,
                name: this.roomName,
                // 不传递 document 参数，让 HocuspocusProvider 自动创建
                // 只读模式通过 URL 参数传递
                parameters: this.options.isReadOnly
                    ? { mode: "readonly" }
                    : undefined,
            })

            // 获取 HocuspocusProvider 自动创建的 Y.Doc 和 Y.Text
            const ydoc = this.provider.document
            this.ytext = ydoc.getText("diagram-xml")

            console.log("[Yjs] Y.Doc created by HocuspocusProvider")

            // 监听连接状态
            this.provider.on("status", (event: { status: string }) => {
                console.log("[Yjs] Connection status:", event.status)
                this.options.onConnectionStatusChange?.(
                    event.status as "connecting" | "connected" | "disconnected",
                )

                // 更新连接标志
                if (event.status === "connected") {
                    this.isConnectedFlag = true
                } else if (event.status === "disconnected") {
                    this.isConnectedFlag = false
                }

                // 如果连接成功，标记为已同步（允许立即推送）
                if (event.status === "connected" && !this.isSynced) {
                    console.log("[Yjs] ✅ Connected, marking as synced")
                    this.isSynced = true
                    console.log("[Yjs] isReadyToPush:", this.isReadyToPush())
                }
            })

            // HocuspocusProvider 可能没有 sync 事件，连接成功后就认为已同步
            // 检查服务器是否有数据
            setTimeout(() => {
                const serverHasData = this.ytext.length > 0
                console.log(
                    "[Yjs] Initial check - Server has data:",
                    serverHasData,
                    "length:",
                    this.ytext.length,
                )

                if (serverHasData) {
                    // 服务器有数据，使用服务器数据
                    this.lastXML = this.ytext.toString()
                    console.log(
                        "[Yjs] Loading XML from server, length:",
                        this.lastXML.length,
                    )
                    console.log(
                        "[Yjs] 📄 XML preview (first 200 chars):",
                        this.lastXML.substring(0, 200),
                    )

                    // 检查XML是否有效
                    if (this.lastXML.includes("<mxfile")) {
                        console.log(
                            "[Yjs] ✅ Valid XML detected, calling onRemoteChange",
                        )
                        this.options.onRemoteChange?.(this.lastXML)
                    } else {
                        console.warn("[Yjs] ⚠️ Invalid XML format, not loading")
                    }
                } else {
                    console.log(
                        "[Yjs] Server has no data, waiting for local changes",
                    )
                }
            }, 500)

            // 监听在线用户数
            this.provider.on("awareness:change", () => {
                const userCount = this.provider?.awareness.getStates().size || 0
                console.log("[Yjs] User count changed:", userCount)
                this.options.onUserCountChange?.(userCount)
            })

            // 监听远程更新
            this.ytext.observe((event) => {
                if (this.isDisposed) return

                // 检查是否是本地更新（通过 transaction.origin 判断）
                const isLocalUpdate = event.transaction.origin === this.provider

                console.log("[Yjs] Ytext changed:", {
                    isLocalUpdate,
                    origin: event.transaction.origin,
                    length: this.ytext.length,
                })

                // 只处理远程更新
                if (!isLocalUpdate) {
                    const newXML = this.ytext.toString()
                    console.log(
                        "[Yjs] 📨 REMOTE UPDATE RECEIVED! XML length:",
                        newXML.length,
                    )

                    // 防抖处理，避免频繁更新
                    if (this.syncTimeout) {
                        clearTimeout(this.syncTimeout)
                    }

                    this.syncTimeout = setTimeout(() => {
                        this.lastXML = newXML
                        console.log("[Yjs] 🔔 Calling onRemoteChange callback")
                        this.options.onRemoteChange?.(newXML)
                    }, 100)
                }

                // 增加更新计数（用于快照检测）
                this.updateCount++
                this.checkAndUploadSnapshot()
            })
        } catch (error) {
            console.error("[Yjs] Initialization error:", error)
        }
    }

    /**
     * 推送本地更新到 Yjs
     */
    pushLocalUpdate(xml: string) {
        if (this.isDisposed || !this.ytext) return

        this.lastXML = xml

        // 只有在内容真正改变时才推送
        const currentContent = this.ytext.toString()
        if (currentContent !== xml) {
            console.log(
                "[Yjs] 📤 Pushing local update to Yjs, XML length:",
                xml.length,
            )

            // 使用 provider.document 进行事务
            const ydoc = this.provider?.document
            if (ydoc) {
                ydoc.transact(() => {
                    if (this.ytext) {
                        this.ytext.delete(0, this.ytext.length)
                        this.ytext.insert(0, xml)
                    }
                }, this.provider)
                console.log("[Yjs] ✅ Local update pushed to Yjs")
            }
        } else {
            console.log("[Yjs] ⏭️ Content unchanged, skipping push")
        }
    }

    /**
     * 检查是否需要上传快照
     */
    private async checkAndUploadSnapshot() {
        if (this.updateCount >= YJS_CONFIG.SNAPSHOT_THRESHOLD) {
            const success = await this.tryUploadSnapshot()
            if (success) {
                this.updateCount = 0
            }
        }
    }

    /**
     * 尝试上传快照（带分布式锁）
     */
    private async tryUploadSnapshot(): Promise<boolean> {
        try {
            // 1. 先尝试获取分布式锁（使用现有的后端接口）
            const lockResult = await checkLock({
                roomId: this.roomName, // 直接使用字符串，避免精度丢失
            })

            if (!lockResult) {
                return false
            }

            // 2. 获取当前文档状态（Yjs 状态向量）
            const state = Y.encodeStateAsUpdate(this.ydoc)
            const base64Data = btoa(
                String.fromCharCode(...new Uint8Array(state)),
            )

            // 3. 上传快照（使用现有的后端接口）
            const uploadResult = await uploadSnapshot(
                { roomId: this.roomName }, // 直接使用字符串，避免精度丢失
                base64Data,
            )

            if (uploadResult) {
                return true
            } else {
                console.error("[Yjs] Snapshot upload failed")
                return false
            }
        } catch (error) {
            console.error("[Yjs] Snapshot upload error:", error)
            return false
        }
    }

    /**
     * 获取当前文档内容
     */
    getDocument(): string {
        return this.ytext?.toString() || ""
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return this.isConnectedFlag
    }

    /**
     * 检查是否已完成首次同步
     */
    isReadyToPush(): boolean {
        return this.isSynced && this.isConnected()
    }

    /**
     * 获取在线用户数
     */
    getUserCount(): number {
        return this.provider?.awareness.getStates().size || 0
    }

    /**
     * 销毁协作实例
     */
    dispose() {
        this.isDisposed = true
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout)
        }
        if (this.provider) {
            this.provider.destroy()
        }
        // 不需要手动销毁 ydoc，因为是由 HocuspocusProvider 管理的
    }
}

/**
 * 创建协作实例的工厂函数
 */
export function createCollaboration(
    options: YjsCollaborationOptions,
): YjsCollaboration {
    return new YjsCollaboration(options)
}
