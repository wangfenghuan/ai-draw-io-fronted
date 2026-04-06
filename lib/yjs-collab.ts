/**
 * Yjs 协作实现 (Hocuspocus 版本)
 */
import { HocuspocusProvider } from "@hocuspocus/provider"
import * as Y from "yjs"
import type { UserRole } from "./collab-protocol"

// 在线用户信息类型
export interface OnlineUser {
    clientID: number
    userId: string
    userName: string
    isCurrentUser: boolean
}

export interface YjsCollaborationOptions {
    roomName: string
    serverUrl: string // WebSocket 服务器 URL
    userRole: UserRole // 用户角色
    userId: string // 用户ID
    userName?: string // 用户名（可选）
    token?: string // 认证 Token (Session ID)
    onRemoteChange?: (xml: string) => void
    onPointerMove?: (pointer: any) => void
    onConnectionStatusChange?: (
        status: "connecting" | "connected" | "disconnected",
    ) => void
    onUserCountChange?: (count: number) => void
    onOnlineUsersChange?: (users: OnlineUser[]) => void
}

export class YjsCollaboration {
    private ydoc: Y.Doc
    private yXmlText: Y.Text
    private provider: HocuspocusProvider | null = null
    private roomName: string
    private serverUrl: string
    private userRole: UserRole
    private userId: string
    private userName: string
    private token?: string
    private options: YjsCollaborationOptions
    private isDisposed = false
    private isReady = false // 标记是否已准备好推送

    // 防止循环更新的标志
    private isUpdatingFromRemote = false

    constructor(options: YjsCollaborationOptions) {
        this.roomName = options.roomName
        this.serverUrl = options.serverUrl
        this.userRole = options.userRole
        this.userId = options.userId
        this.userName = options.userName || "Anonymous"
        this.token = options.token
        this.options = options

        console.log("[YjsCollab] Initializing Yjs collaboration...", {
            roomName: this.roomName,
            serverUrl: this.serverUrl,
        })

        // 创建 Yjs 文档
        this.ydoc = new Y.Doc()
        // 获取或创建共享的 Y.Text 实例 (统一名称为 'xml')
        this.yXmlText = this.ydoc.getText("xml")

        // 监听文档变化
        this.ydoc.on("update", (_update: Uint8Array, origin: any) => {
            // 如果不是远程更新，则忽略（本地更新已经在 pushUpdate 中处理）
            if (origin === this) return
            // 远程更新：通知外部
            this.handleRemoteUpdate()
        })

        // 监听 Y.Text 变化
        this.yXmlText.observe((_event) => {
            if (this.isUpdatingFromRemote) return
            this.handleRemoteUpdate()
        })

        // 连接到 WebSocket 服务器
        this.connect()
    }

    /**
     * 连接到 WebSocket 服务器
     */
    private connect() {
        if (this.isDisposed) return

        console.log("[YjsCollab] 🔄 Connecting to Hocuspocus server...", {
            url: this.serverUrl,
            name: this.roomName,
        })
        this.options.onConnectionStatusChange?.("connecting")

        // 如果有 token，拼接到 URL 查询参数中
        const finalUrl = this.token
            ? `${this.serverUrl}?token=${encodeURIComponent(this.token)}`
            : this.serverUrl

        try {
            // 创建 Hocuspocus Provider
            this.provider = new HocuspocusProvider({
                url: finalUrl,
                name: this.roomName,
                document: this.ydoc,
                // WebSocket 会自动携带浏览器 Cookie 进行鉴权
                onAuthenticationFailed: ({ reason }) => {
                    console.error(
                        "[YjsCollab] ❌ Authentication failed:",
                        reason,
                    )
                    this.options.onConnectionStatusChange?.("disconnected")
                    this.isReady = false
                },
                onStatus: ({ status }) => {
                    console.log("[YjsCollab] 📡 Connection status:", status)
                    switch (status) {
                        case "connecting":
                            this.options.onConnectionStatusChange?.(
                                "connecting",
                            )
                            this.isReady = false
                            break
                        case "connected":
                            console.log("[YjsCollab] ✅ Connected to server")
                            this.options.onConnectionStatusChange?.("connected")
                            this.isReady = true
                            // 连接成功后，检查是否有初始数据
                            this.checkInitialData()
                            break
                        case "disconnected":
                            this.options.onConnectionStatusChange?.(
                                "disconnected",
                            )
                            this.isReady = false
                            break
                    }
                },
                onAwarenessUpdate: ({ states }) => {
                    const count = states.length
                    console.log("[YjsCollab] 👥 User count:", count)
                    this.options.onUserCountChange?.(count)

                    // 构建在线用户列表
                    const onlineUsers: OnlineUser[] = []
                    const myClientID = this.provider?.awareness?.clientID

                    // 处理光标移动 (Awareness) 和收集用户信息
                    states.forEach((state: any, clientID: number) => {
                        // 收集用户信息
                        onlineUsers.push({
                            clientID,
                            userId:
                                state.cursor?.userId ||
                                state.user?.userId ||
                                String(clientID),
                            userName:
                                state.cursor?.userName ||
                                state.user?.userName ||
                                `用户${clientID}`,
                            isCurrentUser: clientID === myClientID,
                        })

                        // 处理光标移动
                        if (clientID === myClientID) return
                        if (state.cursor) {
                            this.options.onPointerMove?.({
                                ...state.cursor,
                                clientID,
                            })
                        }
                    })

                    this.options.onOnlineUsersChange?.(onlineUsers)
                },
            })
        } catch (error) {
            console.error("[YjsCollab] ❌ Failed to connect:", error)
            this.options.onConnectionStatusChange?.("disconnected")
        }
    }

    /**
     * 检查是否有初始数据
     */
    private checkInitialData() {
        const currentXml = this.yXmlText.toString()
        if (currentXml.length > 0) {
            console.log("[YjsCollab] 📥 Initial data found")
            this.options.onRemoteChange?.(currentXml)
        }
    }

    /**
     * 处理远程更新
     */
    private handleRemoteUpdate() {
        const xml = this.yXmlText.toString()
        if (xml.length > 0) {
            this.options.onRemoteChange?.(xml)
        }
    }

    /**
     * 推送本地更新到 Yjs 文档
     * @param xml 完整的 Draw.io XML 字符串
     */
    async pushUpdate(xml: string) {
        if (this.userRole !== "edit") return
        if (!this.isReady) return

        // 设置远程更新标志，防止触发回调
        this.isUpdatingFromRemote = true

        try {
            this.ydoc.transact(() => {
                const currentLength = this.yXmlText.length
                if (currentLength > 0) {
                    this.yXmlText.delete(0, currentLength)
                }
                this.yXmlText.insert(0, xml)
            }, this) // origin = this

            setTimeout(() => {
                this.isUpdatingFromRemote = false
            }, 50)
        } catch (error) {
            console.error("[YjsCollab] ❌ Failed to push update:", error)
            this.isUpdatingFromRemote = false
        }
    }

    /**
     * 检查是否已连接
     */
    isConnected(): boolean {
        return this.isReady
    }

    /**
     * 检查是否准备好推送
     */
    isReadyToPush(): boolean {
        return this.isConnected() && this.isReady
    }

    /**
     * 获取当前文档内容
     */
    getDocument(): string {
        return this.yXmlText.toString()
    }

    /**
     * 获取在线用户数
     */
    getUserCount(): number {
        return this.provider?.awareness?.getStates().size || 0
    }

    /**
     * 获取在线用户列表
     */
    getOnlineUsers(): OnlineUser[] {
        const states = this.provider?.awareness?.getStates()
        const myClientID = this.provider?.awareness?.clientID
        if (!states) return []

        const users: OnlineUser[] = []
        states.forEach((state: any, clientID: number) => {
            users.push({
                clientID,
                userId:
                    state.cursor?.userId ||
                    state.user?.userId ||
                    String(clientID),
                userName:
                    state.cursor?.userName ||
                    state.user?.userName ||
                    `用户${clientID}`,
                isCurrentUser: clientID === myClientID,
            })
        })
        return users
    }

    /**
     * 发送光标位置
     */
    sendPointer(x: number, y: number) {
        if (!this.provider?.awareness) return

        this.provider.awareness.setLocalStateField("cursor", {
            x,
            y,
            userId: this.userId,
            userName: this.userName,
            timestamp: Date.now(),
        })
    }

    /**
     * 监听其他用户的光标位置
     */
    onPointerMove(callback: (pointer: any) => void) {
        if (!this.provider?.awareness) return

        this.provider.awareness.on("change", () => {
            const states = this.provider?.awareness?.getStates()
            states?.forEach((state: any, clientID: number) => {
                if (clientID === this.provider?.awareness?.clientID) return
                if (state?.cursor) {
                    callback({ ...state.cursor, clientID })
                }
            })
        })
    }

    /**
     * 销毁协作实例
     */
    dispose() {
        this.isDisposed = true
        if (this.provider) {
            this.provider.destroy()
            this.provider = null
        }
        this.ydoc.destroy()
    }
}

export function createYjsCollaboration(
    options: YjsCollaborationOptions,
): YjsCollaboration {
    return new YjsCollaboration(options)
}
