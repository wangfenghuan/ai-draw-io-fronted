"use client"

import {
    ClockCircleOutlined,
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    EyeOutlined,
    FileTextOutlined,
    PlusOutlined,
    SearchOutlined,
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
    Space,
    Tag,
    Tooltip,
} from "antd"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
    deleteDiagram,
    downloadRemoteFile,
    editDiagram,
    listMyDiagramVoByPage,
} from "@/api/diagramController"
import type { API } from "@/api/typings"

const { Search } = Input
const { TextArea } = Input

export default function MyDiagramsPage() {
    const { message } = App.useApp()
    const router = useRouter()
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
            const response = await listMyDiagramVoByPage({
                current: current,
                pageSize: pageSize,
                ...(searchText && { diagramName: searchText }),
                sortField: "createTime",
                sortOrder: "desc",
            })

            if (response?.code === 0 && response?.data) {
                setDiagrams(response.data.records || [])
                setPagination({
                    current: response.data.current || 1,
                    pageSize: response.data.size || pageSize,
                    total: response.data.total || 0,
                })
            }
        } catch (error) {
            console.error("加载图表列表失败:", error)
            message.error("加载图表列表失败")
        } finally {
            setLoading(false)
        }
    }

    // 初始加载
    useEffect(() => {
        loadDiagrams()
    }, [])

    // 搜索
    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination({ ...pagination, current: 1 })
        loadDiagrams(1, pagination.pageSize)
    }

    // 分页、排序、筛选变化
    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ ...pagination, current: page, pageSize })
        loadDiagrams(page, pageSize)
    }

    // 跳转到编辑页面
    const handleEditDiagram = (id: string | undefined) => {
        if (id) {
            router.push(`/diagram/edit/${id}`)
        }
    }

    // 删除图表
    const handleDeleteDiagram = async (id: string | undefined) => {
        if (!id) return

        try {
            const response = await deleteDiagram({ id: Number(id) })
            if (response?.code === 0) {
                message.success("删除成功")
                loadDiagrams()
            } else {
                message.error(response?.message || "删除失败")
            }
        } catch (error) {
            console.error("删除图表失败:", error)
            message.error("删除失败")
        }
    }

    // 打开编辑模态框
    const handleOpenEditModal = (diagram: API.DiagramVO) => {
        setEditingDiagram(diagram)
        editForm.setFieldsValue({
            name: diagram.diagramName,
            diagramCode: diagram.diagramCode,
            description: diagram.description,
        })
        setEditModalVisible(true)
    }

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields()
            const response = await editDiagram({
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
            message.error("保存失败")
        }
    }

    // 下载图表
    const handleDownload = async (diagram: API.DiagramVO) => {
        try {
            const response = await downloadRemoteFile({
                id: diagram.id,
                type: "svg",
            })

            if (response) {
                // 创建下载链接
                const url = window.URL.createObjectURL(new Blob([response]))
                const link = document.createElement("a")
                link.href = url
                link.download = `${diagram.diagramName || "diagram"}.svg`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
                message.success("下载成功")
            }
        } catch (error) {
            console.error("下载失败:", error)
            message.error("下载失败")
        }
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
                            justifyContent: "space-between",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                            }}
                        >
                            <FileTextOutlined
                                style={{ fontSize: "20px", color: "#1890ff" }}
                            />
                            <span style={{ fontSize: "18px", fontWeight: 600 }}>
                                我的图表
                            </span>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => router.push("/")}
                            style={{ borderRadius: "6px" }}
                        >
                            新建图表
                        </Button>
                    </div>
                }
            >
                <div style={{ marginBottom: "24px" }}>
                    <Search
                        placeholder="搜索图表名称..."
                        allowClear
                        enterButton={
                            <Button icon={<SearchOutlined />}>搜索</Button>
                        }
                        size="large"
                        onSearch={handleSearch}
                        style={{ maxWidth: "400px" }}
                    />
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
                        // 加载中占位
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
                                description={
                                    <div>
                                        <p
                                            style={{
                                                fontSize: "16px",
                                                marginBottom: "8px",
                                                color: "#666",
                                            }}
                                        >
                                            暂无图表
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                color: "#999",
                                            }}
                                        >
                                            点击"新建图表"开始创作
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        diagrams.map((diagram) => (
                            <Card
                                key={diagram.id}
                                hoverable
                                style={{
                                    borderRadius: "8px",
                                    position: "relative",
                                }}
                                bodyStyle={{ padding: "16px" }}
                                onClick={() =>
                                    handleEditDiagram(diagram.id?.toString())
                                }
                            >
                                <div style={{ marginBottom: "12px" }}>
                                    <h3
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: 600,
                                            marginBottom: "8px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {diagram.diagramName || "未命名图表"}
                                    </h3>
                                    {diagram.description && (
                                        <p
                                            style={{
                                                fontSize: "13px",
                                                color: "#666",
                                                marginBottom: "12px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {diagram.description}
                                        </p>
                                    )}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            fontSize: "12px",
                                            color: "#999",
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

                                <div
                                    style={{
                                        marginBottom: "12px",
                                        height: "120px",
                                        borderRadius: "6px",
                                        overflow: "hidden",
                                        background: "#f5f5f5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={
                                            diagram.pictureUrl ||
                                            diagram.svgUrl ||
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E"
                                        }
                                        alt={
                                            diagram.diagramName || "未命名图表"
                                        }
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "8px" }}>
                                    <Tooltip title="编辑">
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleEditDiagram(
                                                    diagram.id?.toString(),
                                                )
                                            }}
                                        >
                                            编辑
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="修改信息">
                                        <Button
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleOpenEditModal(diagram)
                                            }}
                                        >
                                            信息
                                        </Button>
                                    </Tooltip>
                                    <Popconfirm
                                        title="确定要删除这个图表吗？"
                                        onConfirm={(e) => {
                                            e?.stopPropagation()
                                            handleDeleteDiagram(
                                                diagram.id?.toString(),
                                            )
                                        }}
                                        okText="确定"
                                        cancelText="取消"
                                    >
                                        <Button
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            删除
                                        </Button>
                                    </Popconfirm>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* 分页 */}
                {diagrams.length > 0 && (
                    <div
                        style={{
                            marginTop: "24px",
                            display: "flex",
                            justifyContent: "center",
                            padding: "16px 0",
                            borderTop: "1px solid #f0f0f0",
                        }}
                    >
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={handleTableChange}
                            onShowSizeChange={handleTableChange}
                            showSizeChanger
                            showQuickJumper
                            showTotal={(total) => `共 ${total} 条`}
                            pageSizeOptions={["12", "24", "36", "48"]}
                            locale={{
                                items_per_page: "条/页",
                                jump_to: "跳至",
                                jump_to_confirm: "确定",
                                page: "页",
                                prev_page: "上一页",
                                next_page: "下一页",
                                prev_5: "向前 5 页",
                                next_5: "向后 5 页",
                                prev_3: "向前 3 页",
                                next_3: "向后 3 页",
                            }}
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
                width={500}
                okText="保存"
                cancelText="取消"
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        label="图表名称"
                        name="name"
                        rules={[{ required: true, message: "请输入图表名称" }]}
                    >
                        <Input placeholder="请输入图表名称" />
                    </Form.Item>
                    <Form.Item label="图表编码" name="diagramCode">
                        <Input placeholder="请输入图表编码" />
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                        <TextArea rows={4} placeholder="请输入描述" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
