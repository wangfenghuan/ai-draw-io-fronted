"use client"

import {
    ClockCircleOutlined,
    GlobalOutlined,
    SearchOutlined,
    UserOutlined,
} from "@ant-design/icons"
import {
    App,
    Button,
    Card,
    Empty,
    Input,
    Modal,
    Pagination,
    Tooltip,
} from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { getByPage } from "@/api/diagramController"

const { Search } = Input

export default function DiagramMarketplacePage() {
    const { message } = App.useApp()
    const router = useRouter()

    const [diagrams, setDiagrams] = useState<API.DiagramVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    })
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewDiagram, setPreviewDiagram] = useState<API.DiagramVO | null>(
        null,
    )

    const [searchText, setSearchText] = useState("")
    const isLoadingRef = useRef(false)

    // 加载公共图表列表
    const loadDiagrams = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        if (isLoadingRef.current) {
            return
        }
        isLoadingRef.current = true
        setLoading(true)

        try {
            const response = await getByPage({
                current: current,
                pageSize: pageSize,
                ...(searchText && { searchText: searchText }),
                nullSpaceId: true, // 只查询开放空间的图表
                sortField: "createTime",
                sortOrder: "desc",
            })

            if (response?.code === 0 && response?.data) {
                const data = response.data
                const records = data.records || []

                const serverCurrent = Number(data.current) || 1
                const serverSize = Number(data.size) || 12
                let serverTotal = Number(data.total) || 0

                if (serverTotal === 0 && records.length > 0) {
                    if (records.length > serverSize) {
                        serverTotal = records.length
                    } else {
                        serverTotal =
                            (serverCurrent - 1) * serverSize + records.length
                    }
                }

                setDiagrams(records)
                setPagination({
                    current: serverCurrent,
                    pageSize: serverSize,
                    total: serverTotal,
                })
            } else {
                message.error(
                    "获取图表列表失败：" + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载图表列表失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    // 初始加载
    useEffect(() => {
        loadDiagrams()
    }, [])

    // 搜索触发
    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination((prev) => ({ ...prev, current: 1 }))
        loadDiagrams(1, pagination.pageSize)
    }

    // 分页、页大小变化触发
    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ ...pagination, current: page, pageSize })
        loadDiagrams(page, pageSize)
    }

    // 预览图表 (直接使用列表中的数据，不再请求详情接口)
    const handlePreview = (diagram: API.DiagramVO) => {
        setPreviewDiagram(diagram)
        setPreviewVisible(true)
    }

    const handleClosePreview = () => {
        setPreviewVisible(false)
        setPreviewDiagram(null)
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #eef2f9 100%)",
                padding: "32px 24px",
            }}
        >
            {/* Header Section */}
            <div style={{ maxWidth: "1200px", margin: "0 auto 40px" }}>
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1
                        style={{
                            fontSize: "36px",
                            fontWeight: 700,
                            marginBottom: "12px",
                            background:
                                "linear-gradient(45deg, #1890ff, #722ed1)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        图表广场
                    </h1>
                    <p
                        style={{
                            color: "#666",
                            fontSize: "16px",
                            maxWidth: "600px",
                            margin: "0 auto",
                        }}
                    >
                        探索公共图表资源，分享与交流创意
                    </p>
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Search
                        placeholder="搜索图表名称..."
                        allowClear
                        enterButton={
                            <Button
                                type="primary"
                                style={{
                                    borderRadius: "0 24px 24px 0",
                                    height: "48px",
                                    padding: "0 24px",
                                    fontSize: "16px",
                                }}
                                icon={<SearchOutlined />}
                            >
                                搜索
                            </Button>
                        }
                        size="large"
                        onSearch={handleSearch}
                        style={{
                            maxWidth: "600px",
                            width: "100%",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                            borderRadius: "24px",
                        }}
                        className="custom-search-input"
                    />
                    <style jsx global>{`
                        .custom-search-input .ant-input-wrapper .ant-input-affix-wrapper {
                            height: 48px;
                            border-radius: 24px 0 0 24px;
                            padding-left: 20px;
                            border: none;
                            box-shadow: none;
                        }
                        .custom-search-input .ant-input-wrapper .ant-input-group-addon button {
                            margin: 0;
                            border: none;
                        }
                    `}</style>
                </div>
            </div>

            {/* Content Section */}
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div
                    style={{
                        marginBottom: "16px",
                        color: "#999",
                        fontSize: "14px",
                        paddingLeft: "8px",
                    }}
                >
                    共找到 {pagination.total} 个图表
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "24px",
                    }}
                >
                    {loading ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <Card
                                key={index}
                                loading
                                style={{ borderRadius: "16px", border: "none" }}
                            />
                        ))
                    ) : diagrams.length === 0 ? (
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                textAlign: "center",
                                padding: "80px 0",
                                background: "#fff",
                                borderRadius: "16px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
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
                                            {searchText
                                                ? "未找到匹配的图表"
                                                : "暂无公共图表"}
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        diagrams.map((diagram) => (
                            <div
                                key={diagram.id}
                                className="group"
                                style={{
                                    transition: "all 0.3s ease",
                                    cursor: "pointer",
                                }}
                                onClick={() => handlePreview(diagram)}
                            >
                                <Card
                                    hoverable
                                    bordered={false}
                                    style={{
                                        borderRadius: "16px",
                                        overflow: "hidden",
                                        boxShadow:
                                            "0 2px 8px rgba(0, 0, 0, 0.04)",
                                        height: "100%",
                                        transition:
                                            "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    }}
                                    bodyStyle={{ padding: "16px" }}
                                    className="hover:shadow-lg hover:-translate-y-1"
                                >
                                    {/* 缩略图区域 */}
                                    <div
                                        style={{
                                            marginBottom: "16px",
                                            height: "160px",
                                            borderRadius: "12px",
                                            background: "#f8fafc",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden",
                                            position: "relative",
                                        }}
                                    >
                                        <img
                                            src={
                                                diagram.pictureUrl ||
                                                diagram.svgUrl ||
                                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23d9d9d9' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E"
                                            }
                                            alt={diagram.name}
                                            style={{
                                                maxWidth: "90%",
                                                maxHeight: "90%",
                                                objectFit: "contain",
                                                transition:
                                                    "transform 0.3s ease",
                                            }}
                                            className="group-hover:scale-105"
                                        />
                                    </div>

                                    <div style={{ marginBottom: "12px" }}>
                                        <h3
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: 600,
                                                marginBottom: "6px",
                                                color: "#1f2937",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                            title={diagram.name}
                                        >
                                            {diagram.name || "未命名图表"}
                                        </h3>
                                        <p
                                            style={{
                                                fontSize: "13px",
                                                color: "#6b7280",
                                                marginBottom: "0",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                height: "20px",
                                                lineHeight: "1.5",
                                            }}
                                        >
                                            {diagram.description || "暂无描述"}
                                        </p>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            paddingTop: "12px",
                                            borderTop: "1px solid #f3f4f6",
                                            fontSize: "12px",
                                            color: "#9ca3af",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            {diagram.userVO && (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                    }}
                                                >
                                                    <UserOutlined />
                                                    <span
                                                        style={{
                                                            maxWidth: "80px",
                                                            overflow: "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {diagram.userVO
                                                            .userName || "未知"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            <ClockCircleOutlined />
                                            <span>
                                                {diagram.createTime
                                                    ? new Date(
                                                          diagram.createTime,
                                                      ).toLocaleDateString()
                                                    : "-"}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))
                    )}
                </div>

                {/* 分页组件 */}
                {!loading && diagrams.length > 0 && (
                    <div
                        style={{
                            marginTop: "48px",
                            display: "flex",
                            justifyContent: "center",
                            paddingBottom: "24px",
                        }}
                    >
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={handleTableChange}
                            onShowSizeChange={handleTableChange}
                            showSizeChanger
                            pageSizeOptions={["12", "24", "48", "60"]}
                        />
                    </div>
                )}
            </div>

            {/* 预览模态框 */}
            <Modal
                title={
                    <span style={{ fontSize: "18px", fontWeight: 600 }}>
                        {previewDiagram?.name || "图表预览"}
                    </span>
                }
                open={previewVisible}
                onCancel={handleClosePreview}
                footer={null}
                width={1000}
                centered
                destroyOnClose
                bodyStyle={{ padding: "24px" }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "500px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #f1f5f9",
                        overflow: "hidden",
                    }}
                >
                    {previewDiagram ? (
                        <img
                            src={
                                previewDiagram.pictureUrl ||
                                previewDiagram.svgUrl ||
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23d9d9d9' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E"
                            }
                            alt={previewDiagram.name}
                            style={{
                                maxWidth: "100%",
                                maxHeight: "600px",
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <Empty description="暂无预览图" />
                    )}
                </div>

                <div
                    style={{
                        marginTop: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                    }}
                >
                    <div>
                        <h3
                            style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                marginBottom: "8px",
                            }}
                        >
                            描述
                        </h3>
                        <p style={{ color: "#666", lineHeight: "1.6" }}>
                            {previewDiagram?.description || "暂无描述"}
                        </p>
                    </div>
                    {previewDiagram?.userVO && (
                        <div style={{ textAlign: "right" }}>
                            <h3
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    marginBottom: "4px",
                                    color: "#666",
                                }}
                            >
                                创建者
                            </h3>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <UserOutlined />
                                <span>{previewDiagram.userVO.userName}</span>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}
