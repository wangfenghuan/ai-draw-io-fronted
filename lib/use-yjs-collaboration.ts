/**
 * React Hook for Yjs Collaboration
 *
 * 提供：
 * 1. 自动初始化和清理 Yjs 协作实例
 * 2. 连接状态管理
 * 3. 在线用户数统计
 * 4. 远程更改回调
 */

import { useEffect, useRef, useState } from "react"
import {
    createCollaboration,
    type YjsCollaboration,
    type YjsCollaborationOptions,
} from "./yjs-collab"

export interface UseYjsCollaborationOptions {
    roomName: string
    diagramId: string
    enabled?: boolean
    isReadOnly?: boolean
    onRemoteChange?: (xml: string) => void
}

export function useYjsCollaboration({
    roomName,
    diagramId,
    enabled = true,
    isReadOnly = false,
    onRemoteChange,
}: UseYjsCollaborationOptions) {
    const [isConnected, setIsConnected] = useState(false)
    const [userCount, setUserCount] = useState(0)
    const collabRef = useRef<YjsCollaboration | null>(null)

    console.log("[useYjsCollaboration] Render with:", {
        roomName,
        diagramId,
        enabled,
        isReadOnly,
    })

    useEffect(() => {
        console.log("[useYjsCollaboration] useEffect triggered:", {
            enabled,
            roomName,
        })

        if (!enabled || !roomName) {
            console.log(
                "[useYjsCollaboration] Skipping (not enabled or no roomName)",
            )
            return
        }

        console.log("[useYjsCollaboration] Creating collaboration instance...")

        // 创建协作实例
        const collab = createCollaboration({
            roomName,
            diagramId,
            isReadOnly,
            onRemoteChange: (xml) => {
                onRemoteChange?.(xml)
            },
            onConnectionStatusChange: (status) => {
                console.log(
                    "[useYjsCollaboration] Connection status changed:",
                    status,
                )
                setIsConnected(status === "connected")
            },
            onUserCountChange: (count) => {
                console.log("[useYjsCollaboration] User count changed:", count)
                setUserCount(count)
            },
        })

        collabRef.current = collab
        console.log("[useYjsCollaboration] Collaboration instance created")

        // 清理函数
        return () => {
            console.log(
                "[useYjsCollaboration] Cleaning up collaboration instance",
            )
            collab.dispose()
            collabRef.current = null
        }
        // 只依赖 roomName, diagramId, enabled - 移除 isReadOnly 和回调函数
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomName, diagramId, enabled])

    /**
     * 推送本地更新到协作服务器
     */
    const pushUpdate = (xml: string) => {
        console.log(
            "[useYjsCollaboration] pushUpdate called, XML length:",
            xml.length,
        )
        console.log(
            "[useYjsCollaboration] collabRef.current:",
            collabRef.current,
        )
        console.log(
            "[useYjsCollaboration] isReadyToPush:",
            collabRef.current?.isReadyToPush(),
        )

        const readyToPush = collabRef.current?.isReadyToPush() || false

        if (collabRef.current && readyToPush) {
            console.log(
                "[useYjsCollaboration] ✅ Pushing update to collab instance",
            )
            collabRef.current.pushLocalUpdate(xml)
        } else {
            console.log("[useYjsCollaboration] ❌ Cannot push:", {
                hasCollab: !!collabRef.current,
                readyToPush,
            })
        }
    }

    /**
     * 获取当前文档内容
     */
    const getDocument = (): string => {
        return collabRef.current?.getDocument() || ""
    }

    return {
        isConnected,
        userCount,
        pushUpdate,
        getDocument,
        collaboration: collabRef.current,
        isReadyToPush: () => collabRef.current?.isReadyToPush() || false,
    }
}
