"use client"

import {
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
    FolderOutlined,
    PlusOutlined,
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
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
    deleteDiagram,
    downloadRemoteFile,
    editDiagram,
    listMyDiagramVoByPage,
} from "@/api/diagramController"

const { Search } = Input
const { TextArea } = Input

export default function MyDiagramsPage() {
    // 使用 App 包裹获取上下文 message，避免静态方法警告
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

    // 添加防重复请求的标记
    const isLoadingRef = useRef(false)

    // 加载图表列表
    const loadDiagrams = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        // 防止重复请求
        if (isLoadingRef.current) {
            return
        }
        isLoadingRef.current = true
        setLoading(true)

        try {
            const response = await listMyDiagramVoByPage({
                current: current,
                pageSize: pageSize,
                ...(searchText && { searchText: searchText }),
                sortField: "createTime",
                sortOrder: "desc",
            })

            if (response?.code === 0 && response?.data) {
                const data = response.data
                const records = data.records || []

                // 后端返回的 Long 类型字段可能是 String，需要显式转换
                const serverCurrent = Number(data.current) || 1
                const serverSize = Number(data.size) || 12
                let serverTotal = Number(data.total) || 0

                // 修正逻辑：如果后端返回 total 为 0，但 records 有数据
                // 说明后端可能没有执行 count 查询或返回了所有数据
                if (serverTotal === 0 && records.length > 0) {
                    // 如果当前页数据量大于 pageSize，说明可能是一次性返回了所有数据（后端分页失效）
                    if (records.length > serverSize) {
                        serverTotal = records.length
                    } else {
                        // 估算一个 total，确保分页器能显示
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
        // 搜索时重置回第一页
        setPagination((prev) => ({ ...prev, current: 1 }))
        loadDiagrams(1, pagination.pageSize)
    }

    // 分页、页大小变化触发
    const handleTableChange = (page: number, pageSize: number) => {
        // 更新状态并重新加载
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
            const response = await deleteDiagram({ id })
            if (response?.code === 0) {
                message.success("删除成功")
                // 删除后刷新当前页
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
            name: diagram.name, // 注意：后端返回字段是 name 还是 diagramName？根据您的JSON是 name
            description: diagram.description, // 您的JSON里没有 description，注意检查
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
            // 如果是表单校验失败，不需要弹窗提示
            if (!(error as any)?.errorFields) {
                message.error("保存失败")
            }
        }
    }

    // 下载图表 (保持原样，如有需要可增加 svg/png 选择逻辑)
    const _handleDownload = async (diagram: API.DiagramVO) => {
        try {
            if (!diagram.id) {
                message.error("图表ID不存在")
                return
            }
            const response = await downloadRemoteFile({
                diagramId: diagram.id,
                type: "svg", // 默认下载 svg
            })
            // 处理 Blob 下载逻辑...
            if (response) {
                const url = window.URL.createObjectURL(new Blob([response]))
                const link = document.createElement("a")
                link.href = url
                link.download = `${diagram.name || "diagram"}.svg`
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
                            onClick={() => router.push("/")} // 假设新建在首页或特定路由
                            style={{ borderRadius: "6px" }}
                        >
                            新建图表
                        </Button>
                    </div>
                }
            >
                {/* 搜索栏 */}
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

                {/* 图表列表 Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "24px",
                    }}
                >
                    {loading ? (
                        // 骨架屏占位
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
                                        <Button
                                            type="link"
                                            onClick={() => router.push("/")}
                                        >
                                            去创建第一个图表
                                        </Button>
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
                                    overflow: "hidden",
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
                                        title={diagram.name}
                                    >
                                        {diagram.name || "未命名图表"}
                                    </h3>
                                    {/* 兼容 description 字段，如果后端未返回则不显示 */}
                                    {diagram.description ? (
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
                                    ) : (
                                        <div
                                            style={{
                                                height: "13px",
                                                marginBottom: "12px",
                                            }}
                                        ></div>
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
                                                  ).toLocaleString()
                                                : "未知时间"}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontSize: "12px",
                                            color: "#666",
                                        }}
                                    >
                                        <UserOutlined />
                                        <span
                                            style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                flex: 1,
                                            }}
                                        >
                                            创建者:{" "}
                                            {diagram.userVO?.userName ||
                                                diagram.userId ||
                                                "未知"}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontSize: "12px",
                                            color: "#666",
                                        }}
                                    >
                                        <FolderOutlined />
                                        <span
                                            style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                flex: 1,
                                            }}
                                        >
                                            {diagram.spaceId
                                                ? "私有空间"
                                                : "开放空间"}
                                        </span>
                                    </div>
                                </div>

                                {/* 缩略图区域 */}
                                <div
                                    style={{
                                        marginBottom: "12px",
                                        height: "140px",
                                        borderRadius: "6px",
                                        background: "#f5f5f5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden",
                                    }}
                                >
                                    <img
                                        src={
                                            diagram.pictureUrl ||
                                            diagram.svgUrl ||
                                            // 默认占位图
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23d9d9d9' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E"
                                        }
                                        alt={diagram.name}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                            objectFit: "contain",
                                        }}
                                    />
                                </div>

                                {/* 操作按钮区 */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Tooltip title="修改信息">
                                        <Button
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleOpenEditModal(diagram)
                                            }}
                                        />
                                    </Tooltip>
                                    <Popconfirm
                                        title="删除图表"
                                        description="确定要永久删除这个图表吗？"
                                        onConfirm={(e) => {
                                            e?.stopPropagation()
                                            handleDeleteDiagram(
                                                diagram.id?.toString(),
                                            )
                                        }}
                                        onCancel={(e) => e?.stopPropagation()}
                                        okText="确定"
                                        cancelText="取消"
                                    >
                                        <Button
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => e.stopPropagation()}
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
                            marginTop: "32px",
                            display: "flex",
                            justifyContent: "center",
                            padding: "24px 0",
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
                        label="图表名称"
                        name="name"
                        rules={[{ required: true, message: "请输入图表名称" }]}
                    >
                        <Input placeholder="请输入图表名称" />
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                        <TextArea rows={4} placeholder="请输入描述" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
