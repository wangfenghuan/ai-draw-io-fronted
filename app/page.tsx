"use client"

import {
    BulbOutlined,
    PlusOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons"
import { App, Button, Card, Space, Typography } from "antd"
import { useRouter } from "next/navigation"
import React from "react"
import { addDiagram } from "@/api/diagramController"

const { Title, Paragraph } = Typography

const Home: React.FC = () => {
    const { message } = App.useApp()
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)

    const handleCreateDiagram = async () => {
        try {
            setLoading(true)

            // 调用创建图表的 API
            const response = await addDiagram({
                name: "未命名图表",
                diagramCode: "",
                pictureUrl: "",
            })

            // 检查响应状态，code 为 0 表示成功
            if (response && response.code === 0 && response.data) {
                const diagramId = response.data

                message.success("图表创建成功！")

                // 跳转到编辑页面，将图表 ID 作为路由参数传递
                router.push(`/diagram/edit/${diagramId}`)
            } else {
                message.error(response?.message || "创建图表失败，请稍后重试")
            }
        } catch (error) {
            console.error("创建图表失败:", error)
            message.error("创建图表失败，请稍后重试")
        } finally {
            setLoading(false)
        }
    }

    const quickTemplates = [
        {
            icon: <ThunderboltOutlined />,
            title: "快速开始",
            desc: "从零开始创建",
        },
        { icon: <BulbOutlined />, title: "AI 辅助", desc: "智能生成图表" },
    ]

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <Card
                hoverable
                style={{
                    width: "100%",
                    maxWidth: "600px",
                    borderRadius: "16px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    border: "none",
                    overflow: "hidden",
                }}
                styles={{
                    body: {
                        padding: "48px",
                        textAlign: "center",
                    },
                }}
            >
                <div style={{ marginBottom: "32px" }}>
                    <div
                        style={{
                            width: "80px",
                            height: "80px",
                            margin: "0 auto 24px",
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <PlusOutlined
                            style={{ fontSize: "40px", color: "#fff" }}
                        />
                    </div>
                    <Title
                        level={2}
                        style={{ marginBottom: "16px", color: "#1a1a1a" }}
                    >
                        智能协同云画图
                    </Title>
                    <Paragraph
                        style={{
                            fontSize: "16px",
                            color: "#666",
                            marginBottom: "32px",
                        }}
                    >
                        使用 AI 技术快速创建专业图表，支持多种图表类型和协同编辑
                    </Paragraph>
                </div>

                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                >
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={handleCreateDiagram}
                        loading={loading}
                        style={{
                            height: "56px",
                            fontSize: "18px",
                            borderRadius: "12px",
                            background:
                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "none",
                            boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                        }}
                    >
                        立即创建我的图表
                    </Button>

                    <div
                        style={{
                            display: "flex",
                            gap: "16px",
                            justifyContent: "center",
                            marginTop: "24px",
                        }}
                    >
                        {quickTemplates.map((item, index) => (
                            <Card
                                key={index}
                                hoverable
                                style={{
                                    flex: 1,
                                    borderRadius: "12px",
                                    border: "2px solid #f0f0f0",
                                    transition: "all 0.3s",
                                }}
                                styles={{
                                    body: { padding: "20px" },
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "24px",
                                        marginBottom: "8px",
                                        color: "#667eea",
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <div
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        color: "#1a1a1a",
                                    }}
                                >
                                    {item.title}
                                </div>
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#999",
                                        marginTop: "4px",
                                    }}
                                >
                                    {item.desc}
                                </div>
                            </Card>
                        ))}
                    </div>
                </Space>
            </Card>
        </div>
    )
}

export default Home
