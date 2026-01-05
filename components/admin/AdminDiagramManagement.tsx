"use client"

import {
    ClockCircleOutlined,
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    FileTextOutlined,
    SearchOutlined,
    UserOutlined,
} from "@ant-design/icons"
import {
    App,
    Button,
    Card,
    Empty,
    Form,
    Input,
    Modal,
    Pagination,
    Popconfirm,
    Tooltip,
} from "antd"
import { useEffect, useState } from "react"
import {
    deleteDiagram,
    downloadRemoteFile,
    listDiagramVoByPage,
    updateDiagram,
} from "@/api/diagramController"

const { Search } = Input

export function AdminDiagramManagement() {
    const { message } = App.useApp()

    const [diagrams, setDiagrams] = useState<API.DiagramVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    })

    const [searchText, setSearchText] = useState("")
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [editingDiagram, setEditingDiagram] = useState<API.DiagramVO | null>(
        null,
    )
    const [editForm] = Form.useForm()

    // 加载图表列表
    const loadDiagrams = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        setLoading(true)
        try {
            const response = await listDiagramVoByPage({
                current: current,
                pageSize: pageSize,
                ...(searchText && { searchText: searchText }),
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

    // 下载图表
    const handleDownloadDiagram = async (
        diagramId: string | undefined,
        type: string = "png",
    ) => {
        if (!diagramId) return

        try {
            const response = await downloadRemoteFile({
                diagramId: parseInt(diagramId, 10) as any,
                type: type,
            })

            if (response) {
                // 创建下载链接
                const url = window.URL.createObjectURL(
                    new Blob([response], {
                        type:
                            type === "png"
                                ? "image/png"
                                : type === "svg"
                                  ? "image/svg+xml"
                                  : "application/xml",
                    }),
                )
                const link = document.createElement("a")
                link.href = url
                link.download = `diagram_${diagramId}.${type}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)

                message.success("下载成功")
            }
        } catch (error) {
            console.error("下载图表失败:", error)
            message.error("下载失败")
        }
    }

    // 删除图表
    const handleDeleteDiagram = async (id: string | undefined) => {
        if (!id) return

        try {
            const response = await deleteDiagram({
                id: parseInt(id, 10) as any,
            })
            if (response?.code === 0) {
                message.success("删除成功")
                loadDiagrams()
            } else {
                message.error(response?.message || "删除失败")
            }
        } catch (error) {
            console.error("删除图表失败:", error)
            message.error("删除操作异常")
        }
    }

    // 打开编辑模态框
    const handleOpenEditModal = (diagram: API.DiagramVO) => {
        setEditingDiagram(diagram)
        editForm.setFieldsValue({
            name: diagram.name,
            description: diagram.description,
        })
        setEditModalVisible(true)
    }

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields()
            const response = await updateDiagram({
                id: editingDiagram?.id,
                ...values,
            })

            if (response?.code === 0) {
                message.success("保存成功")
                setEditModalVisible(false)
                loadDiagrams()
            } else {
                message.error(response?.message || "保存失败")
            }
        } catch (error) {
            console.error("保存失败:", error)
            if (!error.errorFields) {
                message.error("保存失败")
            }
        }
    }

    return (
        <>
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
                        <FileTextOutlined
                            style={{ fontSize: "18px", color: "#ff4d4f" }}
                        />
                        <span>图表列表</span>
                    </div>
                }
            >
                {/* 搜索栏 */}
                <div style={{ marginBottom: "16px" }}>
                    <Search
                        placeholder="搜索图表标题、描述..."
                        allowClear
                        enterButton={
                            <Button icon={<SearchOutlined />}>搜索</Button>
                        }
                        onSearch={handleSearch}
                    />
                </div>

                {/* 图表列表 Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "16px",
                    }}
                >
                    {loading ? (
                        Array.from({ length: pagination.pageSize }).map(
                            (_, index) => (
                                <Card
                                    key={index}
                                    loading
                                    hoverable
                                    style={{ borderRadius: "8px" }}
                                />
                            ),
                        )
                    ) : diagrams.length === 0 ? (
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                textAlign: "center",
                                padding: "60px 0",
                            }}
                        >
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="暂无图表"
                            />
                        </div>
                    ) : (
                        diagrams.map((diagram) => (
                            <Card
                                key={diagram.id}
                                hoverable
                                style={{
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    border: "2px solid #fa8c16",
                                }}
                                bodyStyle={{ padding: "12px" }}
                                cover={
                                    diagram.pictureUrl ? (
                                        <div
                                            style={{
                                                height: "160px",
                                                overflow: "hidden",
                                                background: "#fafafa",
                                            }}
                                        >
                                            <img
                                                alt={diagram.name}
                                                src={diagram.pictureUrl}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                height: "160px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                background: "#fafafa",
                                                color: "#999",
                                            }}
                                        >
                                            <FileTextOutlined
                                                style={{ fontSize: "48px" }}
                                            />
                                        </div>
                                    )
                                }
                            >
                                <div
                                    style={{
                                        marginBottom: "8px",
                                        marginTop: "8px",
                                    }}
                                >
                                    <h3
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: 600,
                                            marginBottom: "6px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                        title={diagram.name}
                                    >
                                        {diagram.name || "未命名图表"}
                                    </h3>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontSize: "11px",
                                            color: "#999",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        <ClockCircleOutlined />
                                        <span>
                                            {diagram.createTime
                                                ? new Date(
                                                      diagram.createTime,
                                                  ).toLocaleString()
                                                : "未知时间"}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontSize: "11px",
                                            color: "#666",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        <UserOutlined />
                                        <span
                                            style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            创建者: {diagram.userId || "未知"}
                                        </span>
                                    </div>
                                    {diagram.description && (
                                        <p
                                            style={{
                                                fontSize: "12px",
                                                color: "#666",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                marginBottom: "8px",
                                            }}
                                            title={diagram.description}
                                        >
                                            {diagram.description}
                                        </p>
                                    )}
                                </div>

                                {/* 操作按钮区 */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "6px",
                                        justifyContent: "flex-end",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Tooltip title="下载PNG">
                                        <Button
                                            size="small"
                                            icon={<DownloadOutlined />}
                                            onClick={() =>
                                                handleDownloadDiagram(
                                                    diagram.id?.toString(),
                                                    "png",
                                                )
                                            }
                                        />
                                    </Tooltip>
                                    <Tooltip title="下载SVG">
                                        <Button
                                            size="small"
                                            icon={<DownloadOutlined />}
                                            onClick={() =>
                                                handleDownloadDiagram(
                                                    diagram.id?.toString(),
                                                    "svg",
                                                )
                                            }
                                        />
                                    </Tooltip>
                                    <Tooltip title="编辑信息">
                                        <Button
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={() =>
                                                handleOpenEditModal(diagram)
                                            }
                                        />
                                    </Tooltip>
                                    <Popconfirm
                                        title="删除图表"
                                        description="确定要删除这个图表吗？"
                                        onConfirm={() =>
                                            handleDeleteDiagram(
                                                diagram.id?.toString(),
                                            )
                                        }
                                        okText="确定"
                                        cancelText="取消"
                                    >
                                        <Button
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                        />
                                    </Popconfirm>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* 分页组件 */}
                {!loading && (
                    <div
                        style={{
                            marginTop: "24px",
                            display: "flex",
                            justifyContent: "center",
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
                            showTotal={(total) => `共 ${total} 条`}
                        />
                    </div>
                )}
            </Card>

            {/* 编辑信息模态框 */}
            <Modal
                title="编辑图表信息"
                open={editModalVisible}
                onOk={handleSaveEdit}
                onCancel={() => setEditModalVisible(false)}
                okText="保存"
                cancelText="取消"
                destroyOnClose
            >
                <Form form={editForm} layout="vertical" preserve={false}>
                    <Form.Item
                        label="图表标题"
                        name="name"
                        rules={[{ required: true, message: "请输入图表标题" }]}
                    >
                        <Input placeholder="请输入图表标题" />
                    </Form.Item>
                    <Form.Item label="图表描述" name="description">
                        <Input.TextArea placeholder="请输入图表描述" rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
