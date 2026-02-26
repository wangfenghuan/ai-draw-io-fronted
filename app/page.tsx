"use client"

import {
    AppstoreOutlined,
    BulbOutlined,
    FolderOutlined,
    PlusOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons"
import { App, Button, Card, Col, Row, Space, Typography } from "antd"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { CreateDiagramDialog } from "@/components/create-diagram-dialog"
import { CreateSpaceDialog } from "@/components/create-space-dialog"
import { DemoVideoDialog } from "@/components/demo-video-dialog"
import { InteractiveShowcase } from "@/components/interactive-showcase"

const { Title, Paragraph, Text } = Typography

const Home: React.FC = () => {
    const { message } = App.useApp()
    const router = useRouter()
    const [_loading, _setLoading] = React.useState(false)
    const [createSpaceDialogVisible, setCreateSpaceDialogVisible] =
        useState(false)
    const [createDiagramDialogVisible, setCreateDiagramDialogVisible] =
        useState(false)
    const [demoVideoOpen, setDemoVideoOpen] = useState(false)

    const handleCreateDiagram = () => {
        setCreateDiagramDialogVisible(true)
    }

    const handleDiagramCreated = (diagramId: string | number) => {
        router.push(`/diagram/edit/${diagramId}`)
    }

    const quickTemplates = [
        {
            icon: (
                <div style={{
                    width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #4096ff 0%, #0958d9 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -4px 6px rgba(0,0,0,0.2), 0 8px 16px rgba(9, 88, 217, 0.3)"
                }}>
                    <ThunderboltOutlined style={{ fontSize: 24, color: "#fff" }} />
                </div>
            ),
            title: "快速开始",
            desc: "创建一个空白图表，从零开始绘制",
            action: handleCreateDiagram,
            bg: "transparent",
        },
        {
            icon: (
                <div style={{
                    width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #ffc53d 0%, #d46b08 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -4px 6px rgba(0,0,0,0.2), 0 8px 16px rgba(212, 107, 8, 0.3)"
                }}>
                    <BulbOutlined style={{ fontSize: 24, color: "#fff" }} />
                </div>
            ),
            title: "AI 智能生成",
            desc: "输入描述，让 AI 帮你生成专业图表",
            action: () => router.push("/demo"),
            bg: "transparent",
        },
        {
            icon: (
                <div style={{
                    width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #73d13d 0%, #389e0d 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -4px 6px rgba(0,0,0,0.2), 0 8px 16px rgba(56, 158, 13, 0.3)"
                }}>
                    <FolderOutlined style={{ fontSize: 24, color: "#fff" }} />
                </div>
            ),
            title: "新建空间",
            desc: "创建团队或个人空间，管理图表",
            action: () => setCreateSpaceDialogVisible(true),
            bg: "transparent",
        },
        {
            icon: (
                <div style={{
                    width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #b37feb 0%, #531dab 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -4px 6px rgba(0,0,0,0.2), 0 8px 16px rgba(83, 29, 171, 0.3)"
                }}>
                    <AppstoreOutlined style={{ fontSize: 24, color: "#fff" }} />
                </div>
            ),
            title: "浏览模板",
            desc: "从海量模板库中选择",
            action: () => router.push("/templates"),
            bg: "transparent",
        },
    ]

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#fafcff",
                backgroundImage: `
                    radial-gradient(circle at 15% 50%, rgba(22, 119, 255, 0.08), transparent 25%),
                    radial-gradient(circle at 85% 30%, rgba(114, 46, 209, 0.08), transparent 25%),
                    radial-gradient(circle at 50% 10%, rgba(24, 144, 255, 0.04), transparent 40%),
                    radial-gradient(circle at 80% 80%, rgba(250, 173, 20, 0.04), transparent 30%),
                    radial-gradient(circle at 20% 90%, rgba(82, 196, 26, 0.04), transparent 30%)
                `,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "80px 20px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background Geometric Decorations to emphasize the "Drawing/Creativity" theme */}
            <svg style={{ position: "absolute", top: "12%", right: "18%", zIndex: 0, opacity: 0.15 }} width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="38" stroke="#1677ff" strokeWidth="2" strokeDasharray="8 8" />
            </svg>
            <svg style={{ position: "absolute", top: "50%", left: "8%", zIndex: 0, opacity: 0.12 }} width="100" height="100" viewBox="0 0 100 100" fill="none">
                <rect x="10" y="10" width="80" height="80" rx="16" stroke="#faad14" strokeWidth="3" transform="rotate(15 50 50)" />
            </svg>
            <svg style={{ position: "absolute", bottom: "15%", right: "12%", zIndex: 0, opacity: 0.2 }} width="120" height="60" viewBox="0 0 120 60" fill="none">
                <path d="M0 30 Q 30 0, 60 30 T 120 30" stroke="#52c41a" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M0 45 Q 30 15, 60 45 T 120 45" stroke="#1677ff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
            </svg>
            <svg style={{ position: "absolute", top: "28%", left: "20%", zIndex: 0, opacity: 0.1 }} width="60" height="60" viewBox="0 0 60 60" fill="none">
                <polygon points="30,5 55,50 5,50" stroke="#722ed1" strokeWidth="3" fill="none" transform="rotate(-20 30 30)" strokeLinejoin="round" />
            </svg>
            <svg style={{ position: "absolute", bottom: "30%", left: "25%", zIndex: 0, opacity: 0.15 }} width="50" height="50" viewBox="0 0 50 50" fill="none">
                <circle cx="10" cy="10" r="4" fill="#ff4d4f" />
                <circle cx="40" cy="20" r="6" fill="#1890ff" />
                <circle cx="20" cy="40" r="5" fill="#52c41a" />
                <path d="M10 10 L40 20 L20 40 Z" stroke="#d9d9d9" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
            <svg style={{ position: "absolute", top: "65%", right: "25%", zIndex: 0, opacity: 0.15 }} width="70" height="70" viewBox="0 0 70 70" fill="none">
                <path d="M10 35 H60 M35 10 V60" stroke="#1677ff" strokeWidth="2" strokeLinecap="round" />
                <circle cx="35" cy="35" r="20" stroke="#faad14" strokeWidth="2" />
            </svg>
            <svg style={{ position: "absolute", top: "15%", left: "35%", zIndex: 0, opacity: 0.1 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="5" y="5" width="30" height="30" rx="6" stroke="#eb2f96" strokeWidth="2" strokeDasharray="4 4" transform="rotate(45 20 20)" />
            </svg>
            <svg style={{ position: "absolute", bottom: "20%", right: "35%", zIndex: 0, opacity: 0.08 }} width="100" height="100" viewBox="0 0 100 100" fill="none">
                <path d="M20 50 Q 35 20, 50 50 T 80 50" stroke="#13c2c2" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
            <svg style={{ position: "absolute", top: "40%", right: "8%", zIndex: 0, opacity: 0.12 }} width="60" height="60" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="25" stroke="#722ed1" strokeWidth="3" fill="none" strokeDasharray="10 5" />
                <circle cx="30" cy="30" r="15" fill="#13c2c2" opacity="0.3" />
            </svg>
            <svg style={{ position: "absolute", bottom: "10%", left: "8%", zIndex: 0, opacity: 0.15 }} width="80" height="80" viewBox="0 0 80 80" fill="none">
                <path d="M40 5 L75 75 L5 75 Z" stroke="#faad14" strokeWidth="2" fill="none" strokeLinejoin="miter" transform="rotate(-15 40 40)" />
                <circle cx="40" cy="50" r="10" fill="#eb2f96" opacity="0.2" />
            </svg>

            <div style={{ maxWidth: 1000, width: "100%", zIndex: 1 }}>
                {/* Hero Section */}
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: 64,
                        animation: "fadeIn 0.8s ease-out",
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 24,
                            background: "#fff",
                            padding: "8px 16px",
                            borderRadius: 20,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            border: "1px solid #f0f0f0",
                        }}
                    >
                        <Text strong style={{ color: "#1677ff" }}>
                            IntelliDraw 智能绘图
                        </Text>
                    </div>

                    <Title
                        level={1}
                        style={{
                            fontSize: "48px",
                            marginBottom: 24,
                            fontWeight: 800,
                            color: "#1e293b",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        智能协同，
                        <span style={{ color: "#1677ff" }}>无限创意</span>
                    </Title>

                    <Paragraph
                        style={{
                            fontSize: "18px",
                            color: "#64748b",
                            maxWidth: 600,
                            margin: "0 auto 40px",
                            lineHeight: 1.8,
                        }}
                    >
                        IntelliDraw 是一款简单好用的在线作图工具，支持流程图、思维导图、UML
                        等多种图形。
                        <br />
                        AI 辅助生成，实时团队协作，让想法即刻落地。
                    </Paragraph>

                    <Space size="large">
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={handleCreateDiagram}
                            style={{
                                height: 52,
                                padding: "0 32px",
                                fontSize: 16,
                                borderRadius: 8,
                                background: "#1677ff",
                                borderColor: "#1677ff",
                                boxShadow: "0 4px 12px rgba(22, 119, 255, 0.3)",
                            }}
                        >
                            立即免费使用
                        </Button>
                        <Button
                            size="large"
                            style={{
                                height: 52,
                                padding: "0 32px",
                                fontSize: 16,
                                borderRadius: 8,
                                background: "#fff",
                                color: "#1e293b",
                                borderColor: "#1677ff",
                            }}
                            onClick={() => setDemoVideoOpen(true)}
                        >
                            观看演示
                        </Button>
                    </Space>
                </div>

                {/* Hero Interactive Showcase */}
                <InteractiveShowcase />

                {/* Quick Action Cards */}
                <Row gutter={[24, 24]} justify="center">
                    {quickTemplates.map((item, index) => (
                        <Col xs={24} sm={12} md={6} key={index}>
                            <Card
                                hoverable
                                onClick={item.action}
                                style={{
                                    height: "100%",
                                    borderRadius: 20,
                                    border: "1px solid rgba(255,255,255,0.8)",
                                    background: "rgba(255,255,255,0.7)",
                                    backdropFilter: "blur(10px)",
                                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)",
                                    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                }}
                                styles={{
                                    body: {
                                        padding: 24,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        textAlign: "center",
                                        height: "100%",
                                    },
                                }}
                            >
                                <div
                                    style={{
                                        marginBottom: 16,
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <Text
                                    strong
                                    style={{
                                        fontSize: 16,
                                        marginBottom: 8,
                                        color: "#334155",
                                    }}
                                >
                                    {item.title}
                                </Text>
                                <Text
                                    type="secondary"
                                    style={{ fontSize: 13, lineHeight: 1.5 }}
                                >
                                    {item.desc}
                                </Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                /* Appstore cards hover effect */
                .ant-card:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 20px 40px -10px rgba(22, 119, 255, 0.15) !important;
                }
            `}</style>

            <CreateSpaceDialog
                open={createSpaceDialogVisible}
                onOpenChange={setCreateSpaceDialogVisible}
                onSuccess={() => {
                    message.success("空间创建成功！")
                }}
            />

            <CreateDiagramDialog
                open={createDiagramDialogVisible}
                onOpenChange={setCreateDiagramDialogVisible}
                onSuccess={handleDiagramCreated}
            />

            <DemoVideoDialog
                open={demoVideoOpen}
                onOpenChange={setDemoVideoOpen}
            />
        </div>
    )
}

export default Home
