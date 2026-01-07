"use client"

import {
    ClockCircleOutlined,
    EditOutlined,
    IdcardOutlined,
    MailOutlined,
    SafetyOutlined,
    UserOutlined,
} from "@ant-design/icons"
import { App, Card, Descriptions, Spin, Tag, Typography } from "antd"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getUserVoById } from "@/api/userController"

const { Title } = Typography

export default function UserProfilePage() {
    const { message } = App.useApp()
    const params = useParams()
    const userId = params.userId as string

    const [user, setUser] = useState<API.UserVO | null>(null)
    const [loading, setLoading] = useState(false)

    // 加载用户信息
    const loadUserInfo = async () => {
        if (!userId) return

        setLoading(true)
        try {
            const response = await getUserVoById({
                id: userId as any,
            })

            if (response?.code === 0 && response?.data) {
                setUser(response.data)
            } else {
                message.error(response?.message || "获取用户信息失败")
            }
        } catch (error) {
            console.error("获取用户信息失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUserInfo()
    }, [userId])

    // 获取角色标签颜色
    const getRoleColor = (role: string) => {
        switch (role) {
            case "admin":
                return "red"
            case "user":
                return "blue"
            default:
                return "default"
        }
    }

    // 获取角色文本
    const getRoleText = (role: string) => {
        switch (role) {
            case "admin":
                return "管理员"
            case "user":
                return "普通用户"
            case "notLogin":
                return "未登录"
            default:
                return role
        }
    }

    return (
        <div style={{ minHeight: "100vh", padding: "24px" }}>
            <Card
                bordered={false}
                style={{
                    borderRadius: "8px",
                    maxWidth: "900px",
                    margin: "0 auto",
                }}
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <IdcardOutlined
                            style={{ fontSize: "20px", color: "#1890ff" }}
                        />
                        <Title level={3} style={{ margin: 0 }}>
                            用户个人信息
                        </Title>
                    </div>
                }
            >
                <Spin spinning={loading} size="large">
                    {user ? (
                        <div>
                            {/* 用户基本信息 */}
                            <Card
                                type="inner"
                                title="基本信息"
                                style={{ marginBottom: "16px" }}
                                headStyle={{
                                    borderBottom: "2px solid #f0f0f0",
                                }}
                            >
                                <Descriptions column={2} bordered size="middle">
                                    <Descriptions.Item
                                        label={<UserOutlined />}
                                        span={2}
                                        labelStyle={{ width: "120px" }}
                                    >
                                        <span style={{ fontWeight: 600 }}>
                                            {user.userName || "未设置"}
                                        </span>
                                    </Descriptions.Item>

                                    <Descriptions.Item
                                        label={<MailOutlined />}
                                        span={2}
                                        labelStyle={{ width: "120px" }}
                                    >
                                        {user.userAccount || "未设置"}
                                    </Descriptions.Item>

                                    <Descriptions.Item
                                        label={<SafetyOutlined />}
                                        labelStyle={{ width: "120px" }}
                                    >
                                        <Tag
                                            color={getRoleColor(user.userRole)}
                                        >
                                            {getRoleText(user.userRole)}
                                        </Tag>
                                    </Descriptions.Item>

                                    <Descriptions.Item
                                        label={<IdcardOutlined />}
                                        labelStyle={{ width: "120px" }}
                                    >
                                        {user.id || "-"}
                                    </Descriptions.Item>

                                    <Descriptions.Item
                                        label={<ClockCircleOutlined />}
                                        labelStyle={{ width: "120px" }}
                                    >
                                        {user.createTime
                                            ? new Date(
                                                  user.createTime,
                                              ).toLocaleString()
                                            : "-"}
                                    </Descriptions.Item>

                                    <Descriptions.Item
                                        label={<EditOutlined />}
                                        labelStyle={{ width: "120px" }}
                                    >
                                        {user.updateTime
                                            ? new Date(
                                                  user.updateTime,
                                              ).toLocaleString()
                                            : "-"}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>

                            {/* 用户头像 */}
                            <Card
                                type="inner"
                                title="用户头像"
                                style={{ marginBottom: "16px" }}
                                headStyle={{
                                    borderBottom: "2px solid #f0f0f0",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        padding: "24px",
                                    }}
                                >
                                    <img
                                        src={
                                            user.userAvatar ||
                                            "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
                                        }
                                        alt="用户头像"
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            borderRadius: "8px",
                                            objectFit: "cover",
                                            boxShadow:
                                                "0 2px 8px rgba(0,0,0,0.1)",
                                        }}
                                    />
                                </div>
                            </Card>

                            {/* 统计信息 */}
                            <Card
                                type="inner"
                                title="统计信息"
                                headStyle={{
                                    borderBottom: "2px solid #f0f0f0",
                                }}
                            >
                                <Descriptions column={1} bordered size="middle">
                                    <Descriptions.Item label="用户状态">
                                        <Tag
                                            color={
                                                user.isDelete ? "red" : "green"
                                            }
                                        >
                                            {user.isDelete ? "已删除" : "正常"}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </div>
                    ) : (
                        !loading && (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "60px 0",
                                    color: "#999",
                                }}
                            >
                                <UserOutlined
                                    style={{
                                        fontSize: "64px",
                                        marginBottom: "16px",
                                    }}
                                />
                                <p>未找到用户信息</p>
                            </div>
                        )
                    )}
                </Spin>
            </Card>
        </div>
    )
}
