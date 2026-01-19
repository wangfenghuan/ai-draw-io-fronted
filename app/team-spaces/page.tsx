"use client"

import {
    CloudServerOutlined,
    DatabaseOutlined,
    FileTextOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons"
import { App, Button, Card, Empty, Statistic, Tag, Tooltip } from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { listMyTeamSpace } from "@/api/spaceUserController"
import { calculatePercentage, formatFileSize, toNumber } from "@/lib/utils"

// 角色枚举
enum SpaceRole {
    ADMIN = "admin", // 管理员
    MEMBER = "member", // 普通成员
    VIEWER = "viewer", // 查看者
}

export default function TeamSpacesPage() {
    const { message: antMessage } = App.useApp()
    const router = useRouter()

    const [teamSpaces, setTeamSpaces] = useState<API.SpaceUserVO[]>([])
    const [loading, setLoading] = useState(false)

    const isLoadingRef = useRef(false)

    // 获取角色显示信息
    const getRoleDisplay = (role?: string) => {
        switch (role) {
            case SpaceRole.ADMIN:
                return { text: "管理员", color: "red" }
            case SpaceRole.MEMBER:
                return { text: "成员", color: "blue" }
            case SpaceRole.VIEWER:
                return { text: "查看者", color: "default" }
            default:
                return { text: role || "未知", color: "default" }
        }
    }

    // 获取空间级别显示信息
    const getSpaceLevelDisplay = (level?: number) => {
        if (level === 1) {
            return { text: "专业版", color: "blue" }
        } else if (level === 2) {
            return { text: "旗舰版", color: "gold" }
        }
        return { text: "普通版", color: "default" }
    }

    // 加载我加入的团队空间列表
    const loadTeamSpaces = async () => {
        // 防止重复请求
        if (isLoadingRef.current) {
            return
        }
        isLoadingRef.current = true
        setLoading(true)

        try {
            const response = await listMyTeamSpace()

            if (response?.code === 0 && response?.data) {
                setTeamSpaces(response.data)
            } else {
                antMessage.error(
                    "获取团队空间列表失败：" +
                        (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载团队空间列表失败:", error)
            antMessage.error("系统繁忙，请稍后重试")
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    // 初始加载
    useEffect(() => {
        loadTeamSpaces()
    }, [])

    // 查看空间内的图表
    const handleViewDiagrams = (spaceId: string) => {
        router.push(`/my-spaces/${spaceId}/diagrams`)
    }

    return (
        <div style={{ minHeight: "100vh", padding: "24px" }}>
            <Card
                bordered={false}
                style={{ borderRadius: "8px" }}
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <TeamOutlined
                            style={{ fontSize: "20px", color: "#52c41a" }}
                        />
                        <span style={{ fontSize: "18px", fontWeight: 600 }}>
                            我加入的团队空间
                        </span>
                    </div>
                }
            >
                {/* 空间列表 Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "24px",
                    }}
                >
                    {loading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <Card
                                key={index}
                                loading
                                hoverable
                                style={{ borderRadius: "8px" }}
                            />
                        ))
                    ) : teamSpaces.length === 0 ? (
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                textAlign: "center",
                                padding: "60px 0",
                            }}
                        >
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <p
                                            style={{
                                                fontSize: "16px",
                                                marginBottom: "8px",
                                                color: "#666",
                                            }}
                                        >
                                            暂无团队空间
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                color: "#999",
                                            }}
                                        >
                                            等待他人邀请您加入团队空间
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        teamSpaces.map((spaceUser) => {
                            const space = spaceUser.space!
                            const roleConfig = getRoleDisplay(
                                spaceUser.spaceRole,
                            )
                            const levelConfig = getSpaceLevelDisplay(
                                space.spaceLevel,
                            )
                            const countPercent = calculatePercentage(
                                toNumber(space.totalCount),
                                toNumber(space.maxCount),
                            )
                            const sizePercent = calculatePercentage(
                                toNumber(space.totalSize),
                                toNumber(space.maxSize),
                            )

                            return (
                                <Card
                                    key={spaceUser.id}
                                    hoverable
                                    style={{
                                        borderRadius: "8px",
                                    }}
                                    bodyStyle={{ padding: "20px" }}
                                >
                                    {/* 空间标题 */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: "16px",
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <h3
                                                style={{
                                                    fontSize: "16px",
                                                    fontWeight: 600,
                                                    marginBottom: "8px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                                title={space.spaceName}
                                            >
                                                {space.spaceName ||
                                                    "未命名空间"}
                                            </h3>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "8px",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <Tag
                                                    color={levelConfig.color}
                                                    icon={<UserOutlined />}
                                                >
                                                    {levelConfig.text}
                                                </Tag>
                                                <Tag
                                                    color="green"
                                                    icon={<TeamOutlined />}
                                                >
                                                    团队空间
                                                </Tag>
                                                <Tag color={roleConfig.color}>
                                                    {roleConfig.text}
                                                </Tag>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "8px",
                                            }}
                                        >
                                            <Tooltip title="查看图表">
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={<FileTextOutlined />}
                                                    onClick={() =>
                                                        handleViewDiagrams(
                                                            space.id!,
                                                        )
                                                    }
                                                />
                                            </Tooltip>
                                            <Tooltip title="空间详情">
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    icon={
                                                        <CloudServerOutlined />
                                                    }
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>

                                    {/* 配额统计 */}
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "16px",
                                            marginBottom: "16px",
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#666",
                                                    marginBottom: "4px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                <FileTextOutlined />
                                                图表数量
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "20px",
                                                    fontWeight: 600,
                                                    color:
                                                        countPercent > 90
                                                            ? "#ff4d4f"
                                                            : "#1890ff",
                                                }}
                                            >
                                                {toNumber(space.totalCount)} /{" "}
                                                {toNumber(space.maxCount)}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#666",
                                                    marginBottom: "4px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                }}
                                            >
                                                <DatabaseOutlined />
                                                存储空间
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "20px",
                                                    fontWeight: 600,
                                                    color:
                                                        sizePercent > 90
                                                            ? "#ff4d4f"
                                                            : "#1890ff",
                                                }}
                                            >
                                                {formatFileSize(
                                                    space.totalSize,
                                                )}{" "}
                                                /{" "}
                                                {formatFileSize(space.maxSize)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 底部信息 */}
                                    <div>
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#999",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            加入时间：
                                            {spaceUser.createTime
                                                ? new Date(
                                                      spaceUser.createTime,
                                                  ).toLocaleString()
                                                : "未知"}
                                        </div>
                                        {space.userVO && (
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#666",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                }}
                                            >
                                                <UserOutlined />
                                                <span>
                                                    创建者:{" "}
                                                    {space.userVO.userName ||
                                                        space.userId ||
                                                        "未知"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )
                        })
                    )}
                </div>
            </Card>
        </div>
    )
}
