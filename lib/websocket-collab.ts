/**
 * WebSocket Collaboration 模块
 *
 * 提供基于 WebSocket 的实时协作功能
 */

import type { PointerData, UserRole } from "./collab-protocol"

export interface WebSocketCollaborationOptions {
    roomName: string
    secretKey: string
    userRole: UserRole
    userId: string
    userName?: string
    onRemoteChange?: (data: string) => void
    onPointerMove?: (pointer: PointerData) => void
    onConnectionStatusChange?: (status: string) => void
    onUserCountChange?: (count: number) => void
}

export interface WebSocketCollaboration {
    connect: () => void
    disconnect: () => void
    dispose: () => void
    sendChange: (xml: string) => void
    sendPointer: (pointer: PointerData) => void
    pushUpdate: (xml: string) => void
    getDocument: () => string
    requestFullSync: () => void
    isReadyToPush: () => boolean
    get isConnected(): boolean
}

export function createWebSocketCollaboration(
    options: WebSocketCollaborationOptions,
): WebSocketCollaboration {
    // Stub implementation - WebSocket collaboration not yet implemented
    return {
        connect: () => {
            console.log("[WebSocketCollab] connect called (stub)")
            options.onConnectionStatusChange?.("connected")
        },
        disconnect: () => {
            console.log("[WebSocketCollab] disconnect called (stub)")
            options.onConnectionStatusChange?.("disconnected")
        },
        dispose: () => {
            console.log("[WebSocketCollab] dispose called (stub)")
        },
        sendChange: (_xml: string) => {
            console.log("[WebSocketCollab] sendChange called (stub)")
        },
        sendPointer: (_pointer: PointerData) => {
            console.log("[WebSocketCollab] sendPointer called (stub)")
        },
        pushUpdate: (_xml: string) => {
            console.log("[WebSocketCollab] pushUpdate called (stub)")
        },
        getDocument: () => {
            console.log("[WebSocketCollab] getDocument called (stub)")
            return ""
        },
        requestFullSync: () => {
            console.log("[WebSocketCollab] requestFullSync called (stub)")
        },
        isReadyToPush: () => {
            return false
        },
        get isConnected() {
            return false
        },
    }
}