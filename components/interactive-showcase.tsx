"use client"

import React, { useState, useEffect } from "react"
import { Typography } from "antd"
import {
    ApartmentOutlined,
    NodeIndexOutlined,
    FormOutlined,
    AppstoreOutlined,
} from "@ant-design/icons"

const { Title, Text, Paragraph } = Typography

type MainTabKey = "mindmap" | "flowchart" | "library"

interface FeatureItem {
    id: string
    title: string
    desc: string
}

const TABS_DATA: Record<
    MainTabKey,
    {
        label: string
        icon: React.ReactNode
        image: string
        features: FeatureItem[]
    }
> = {
    mindmap: {
        label: "思维导图",
        icon: <ApartmentOutlined />,
        image: "/example.png",
        features: [
            {
                id: "1",
                title: "快速上手 简单易用",
                desc: "兼容思维导图主流操作，键控灵活，体验流畅。",
            },
            {
                id: "2",
                title: "功能丰富 专业强大",
                desc: "支持Markdown，插入LaTeX数学公式，一键转化为大纲、Word、PPT、Excel等。",
            },
            {
                id: "3",
                title: "个性化风格定制",
                desc: "提供多种预置主题风格，也可以自由设计你喜爱的风格样式。",
            },
        ],
    },
    flowchart: {
        label: "流程图",
        icon: <NodeIndexOutlined />,
        image: "/architecture.png", // In production would be a different image
        features: [
            {
                id: "1",
                title: "逻辑清晰 极速表达",
                desc: "内置丰富的标准流程图图形，智能对齐，连线自动吸附。",
            },
            {
                id: "2",
                title: "海量模板 一键复用",
                desc: "覆盖多行业多场景的最佳实践，助力提升团队生产力。",
            },
            {
                id: "3",
                title: "高度定制 自由排版",
                desc: "支持自由调整节点样式，连线样式，以及各类视觉属性。",
            },
        ],
    },
    library: {
        label: "图形库",
        icon: <AppstoreOutlined />,
        image: "/animated_connectors.svg",
        features: [
            {
                id: "1",
                title: "标准全面 专业规范",
                desc: "内置各类UML、网络拓扑、ER图等标准图库。",
            },
            {
                id: "2",
                title: "拖拽即按 极简操作",
                desc: "海量组件即点即用，大大降低绘图学习成本。",
            },
            {
                id: "3",
                title: "自定义矢量图库",
                desc: "支持导入自定义SVG素材，构建团队专属的组件资源库。",
            },
        ],
    },
}

const MAIN_TABS: MainTabKey[] = ["mindmap", "flowchart", "library"]

export const InteractiveShowcase: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MainTabKey>("mindmap")
    const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)

    const handleTabChange = (key: MainTabKey) => {
        if (key === activeTab) return
        setIsTransitioning(true)
        setTimeout(() => {
            setActiveTab(key)
            setActiveFeatureIndex(0)
            setIsTransitioning(false)
        }, 200)
    }

    const currentData = TABS_DATA[activeTab]

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 1200,
                margin: "0 auto 80px",
                animation: "fadeInUp 1s ease-out 0.2s both",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
            }}
        >
            {/* Top Tabs */}
            <div
                style={{
                    display: "flex",
                    gap: "48px",
                    marginBottom: "40px",
                    overflowX: "auto",
                    paddingBottom: "10px",
                    width: "100%",
                    justifyContent: "center",
                }}
            >
                {MAIN_TABS.map((key) => {
                    const data = TABS_DATA[key]
                    const isActive = activeTab === key
                    return (
                        <div
                            key={key}
                            onClick={() => handleTabChange(key)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                padding: "8px 0",
                                position: "relative",
                                transition: "all 0.3s",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "20px",
                                    color: isActive ? "#333" : "#8c8c8c",
                                    transition: "color 0.3s",
                                }}
                            >
                                {data.icon}
                            </div>
                            <span
                                style={{
                                    fontSize: "18px",
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? "#333" : "#8c8c8c",
                                    transition: "all 0.3s",
                                }}
                            >
                                {data.label}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Main Content Area: Image (Left) + Features (Right) */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "32px",
                    width: "100%",
                    alignItems: "stretch",
                    opacity: isTransitioning ? 0 : 1,
                    transform: isTransitioning ? "translateY(10px)" : "translateY(0)",
                    transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
                }}
                className="flex-col md:flex-row" // Tailwind classes for responsive
            >
                {/* Left: Mac-style Image Container */}
                <div
                    style={{
                        flex: "1 1 65%",
                        background: "#f8f9fa",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                    }}
                >
                    {/* Mac Window Header */}
                    <div
                        style={{
                            height: "40px",
                            background: "#f1f3f5",
                            borderBottom: "1px solid #e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            padding: "0 16px",
                            gap: "8px",
                        }}
                    >
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
                        
                        <div style={{ flex: 1, textAlign: "center", fontSize: "12px", color: "#8c8c8c", fontWeight: 500 }}>
                            IntelliDraw - {currentData.label}
                        </div>
                        <div style={{ width: 44 }}></div> {/* Spacer for balance */}
                    </div>
                    {/* Image Content */}
                    <div style={{ padding: "0 0 20px 0", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img
                            src={currentData.image}
                            alt={currentData.label}
                            style={{
                                width: "95%",
                                height: "auto",
                                objectFit: "contain",
                                borderRadius: "8px",
                                marginTop: "20px"
                            }}
                        />
                    </div>
                </div>

                {/* Right: Feature List */}
                <div
                    style={{
                        flex: "1 1 35%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        justifyContent: "center",
                    }}
                >
                    {currentData.features.map((feature, index) => {
                        const isActive = activeFeatureIndex === index
                        return (
                            <div
                                key={feature.id}
                                onClick={() => setActiveFeatureIndex(index)}
                                style={{
                                    padding: "24px",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    background: isActive ? "#eff6ff" : "transparent",
                                    border: "1px solid",
                                    borderColor: isActive ? "transparent" : (index !== currentData.features.length - 1 ? "#f0f0f0" : "transparent"),
                                    borderBottomColor: (!isActive && index !== currentData.features.length - 1) ? "#f0f0f0" : "transparent",
                                    position: "relative",
                                    transition: "all 0.3s ease",
                                    boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.02)" : "none",
                                }}
                            >
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            bottom: 0,
                                            width: "40%",
                                            height: "3px",
                                            background: "#1677ff",
                                            borderTopRightRadius: "3px",
                                            borderTopLeftRadius: "3px",
                                        }}
                                    />
                                )}
                                <Title
                                    level={4}
                                    style={{
                                        margin: "0 0 12px 0",
                                        fontSize: "18px",
                                        color: isActive ? "#000" : "#333",
                                        fontWeight: isActive ? 600 : 500,
                                    }}
                                >
                                    {feature.title}
                                </Title>
                                <Paragraph
                                    style={{
                                        margin: 0,
                                        fontSize: "14px",
                                        color: "#666",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {feature.desc}
                                </Paragraph>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Decorative background blurs specifically for this component */}
            <div style={{ position: "absolute", top: "20%", left: "-10%", width: 300, height: 300, background: "rgba(22, 119, 255, 0.05)", filter: "blur(60px)", borderRadius: "50%", zIndex: -1, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: 250, height: 250, background: "rgba(114, 46, 209, 0.05)", filter: "blur(60px)", borderRadius: "50%", zIndex: -1, pointerEvents: "none" }} />
        </div>
    )
}
