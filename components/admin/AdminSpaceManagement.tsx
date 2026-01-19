"use client"

import {
    ClockCircleOutlined,
    DatabaseOutlined,
    DeleteOutlined,
    EditOutlined,
    FolderOutlined,
    SearchOutlined,
    TeamOutlined,
    TrophyOutlined,
    UserOutlined,
} from "@ant-design/icons"
import {
    App,
    Button,
    Card,
    Descriptions,
    Empty,
    Form,
    Input,
    Modal,
    Pagination,
    Popconfirm,
    Select,
    Spin,
    Tag,
    Tooltip,
} from "antd"
import { useEffect, useRef, useState } from "react"
import {
    deleteSpace,
    getSpaceVoById,
    listSpaceByPage,
    listSpaceLevel,
    updateSpace,
} from "@/api/spaceController"

const { Search } = Input

// 空间类型枚举
enum SpaceType {
    PERSONAL = 0, // 个人空间
    TEAM = 1, // 团队空间
}

// 空间类型映射
const SPACE_TYPE_MAP: Record<
    number,
    { text: string; color: string; icon: any }
> = {
    0: { text: "个人空间", color: "default", icon: <UserOutlined /> },
    1: { text: "团队空间", color: "green", icon: <TeamOutlined /> },
}

// 空间级别映射
const SPACE_LEVEL_MAP: Record<number, { text: string; color: string }> = {
    0: { text: "普通版", color: "default" },
    1: { text: "专业版", color: "blue" },
    2: { text: "旗舰版", color: "gold" },
}

// 格式化文件大小
function formatFileSize(bytes: number | string | undefined): string {
    const numBytes = typeof bytes === "string" ? Number(bytes) : bytes
    if (!numBytes || numBytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(numBytes) / Math.log(k))
    return parseFloat((numBytes / k ** i).toFixed(2)) + " " + sizes[i]
}

// 安全地转换数字
function toNumber(value: number | string | undefined): number {
    if (value === undefined || value === null) return 0
    return typeof value === "string" ? Number(value) : value
}

export function AdminSpaceManagement() {
    const { message } = App.useApp()

    const [spaces, setSpaces] = useState<API.SpaceVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    })

    const [searchText, setSearchText] = useState("")
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [editingSpace, setEditingSpace] = useState<API.SpaceVO | null>(null)
    const [loadingSpaceDetail, setLoadingSpaceDetail] = useState(false)
    const [spaceLevels, setSpaceLevels] = useState<API.SpaceLevel[]>([])
    const [editForm] = Form.useForm()

    // 添加防重复请求的标记
    const isLoadingRef = useRef(false)
    const isLevelsLoadingRef = useRef(false)

    // 加载空间级别列表
    const loadSpaceLevels = async () => {
        // 防止重复请求
        if (isLevelsLoadingRef.current) {
            return
        }
        isLevelsLoadingRef.current = true

        try {
            const response = await listSpaceLevel()
            if (response?.code === 0 && response?.data) {
                setSpaceLevels(response.data)
            }
        } catch (error) {
            console.error("加载空间级别失败:", error)
        } finally {
            isLevelsLoadingRef.current = false
        }
    }

    // 加载空间列表
    const loadSpaces = async (
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
            const response = await listSpaceByPage({
                current: current,
                pageSize: pageSize,
                ...(searchText && { spaceName: searchText }),
                sortField: "createTime",
                sortOrder: "desc",
            })

            if (response?.code === 0 && response?.data) {
                const data = response.data
                const records = data.records || []

                const serverCurrent = toNumber(data.current) || 1
                const serverSize = toNumber(data.size) || 12
                let serverTotal = toNumber(data.total) || 0

                if (serverTotal === 0 && records.length > 0) {
                    if (records.length > serverSize) {
                        serverTotal = records.length
                    } else {
                        serverTotal =
                            (serverCurrent - 1) * serverSize + records.length
                    }
                }

                setSpaces(records)
                setPagination({
                    current: serverCurrent,
                    pageSize: serverSize,
                    total: serverTotal,
                })
            } else {
                message.error(
                    "获取空间列表失败：" + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载空间列表失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    // 初始加载
    useEffect(() => {
        loadSpaceLevels()
        loadSpaces()
    }, [])

    // 搜索触发
    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination((prev) => ({ ...prev, current: 1 }))
        loadSpaces(1, pagination.pageSize)
    }

    // 分页、页大小变化触发
    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ ...pagination, current: page, pageSize })
        loadSpaces(page, pageSize)
    }

    // 删除空间
    const handleDeleteSpace = async (id: string | undefined) => {
        if (!id) return

        try {
            const response = await deleteSpace({
                id,
            })
            if (response?.code === 0) {
                message.success("删除成功")
                loadSpaces()
            } else {
                message.error(response?.message || "删除失败")
            }
        } catch (error) {
            console.error("删除空间失败:", error)
            message.error("删除操作异常")
        }
    }

    // 打开编辑模态框
    const handleOpenEditModal = async (space: API.SpaceVO) => {
        if (!space.id) return

        setLoadingSpaceDetail(true)
        setEditModalVisible(true)

        try {
            const response = await getSpaceVoById({
                id: space.id,
            })
            if (response?.code === 0 && response?.data) {
                const spaceData = response.data
                setEditingSpace(spaceData)

                // 设置表单值
                editForm.setFieldsValue({
                    spaceName: spaceData.spaceName,
                    spaceLevel: spaceData.spaceLevel,
                    maxCount: toNumber(spaceData.maxCount),
                    maxSize: toNumber(spaceData.maxSize),
                })
                setLoadingSpaceDetail(false)
            } else {
                message.error(response?.message || "获取空间详情失败")
                setEditModalVisible(false)
                setLoadingSpaceDetail(false)
            }
        } catch (error) {
            console.error("获取空间详情失败:", error)
            message.error("获取空间详情失败，请稍后重试")
            setEditModalVisible(false)
            setLoadingSpaceDetail(false)
        }
    }

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields()
            const response = await updateSpace({
                id: editingSpace?.id,
                ...values,
            })

            if (response?.code === 0) {
                message.success("保存成功")
                setEditModalVisible(false)
                loadSpaces()
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

    // 获取空间级别信息
    const getSpaceLevelInfo = (level: number) => {
        return SPACE_LEVEL_MAP[level] || { text: "未知", color: "default" }
    }

    // 获取空间类型信息
    const getSpaceTypeInfo = (type?: number) => {
        return (
            SPACE_TYPE_MAP[type || 0] || {
                text: "个人空间",
                color: "default",
                icon: <UserOutlined />,
            }
        )
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
                        <DatabaseOutlined
                            style={{ fontSize: "18px", color: "#ff4d4f" }}
                        />
                        <span>空间管理</span>
                    </div>
                }
            >
                {/* 搜索栏 */}
                <div style={{ marginBottom: "16px" }}>
                    <Search
                        placeholder="搜索空间名称..."
                        allowClear
                        enterButton={
                            <Button icon={<SearchOutlined />}>搜索</Button>
                        }
                        onSearch={handleSearch}
                    />
                </div>

                {/* 空间列表 Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(320px, 1fr))",
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
                    ) : spaces.length === 0 ? (
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                textAlign: "center",
                                padding: "60px 0",
                            }}
                        >
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="暂无空间"
                            />
                        </div>
                    ) : (
                        spaces.map((space) => {
                            const levelInfo = getSpaceLevelInfo(
                                space.spaceLevel || 0,
                            )
                            const typeInfo = getSpaceTypeInfo(space.spaceType)
                            return (
                                <Card
                                    key={space.id}
                                    hoverable
                                    style={{
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        border: "2px solid #ff4d4f",
                                    }}
                                    bodyStyle={{ padding: "16px" }}
                                >
                                    {/* 空间名称、类型和级别 */}
                                    <div
                                        style={{
                                            marginBottom: "12px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <h3
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: 600,
                                                margin: 0,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                flex: 1,
                                            }}
                                            title={space.spaceName}
                                        >
                                            <FolderOutlined
                                                style={{ marginRight: "8px" }}
                                            />
                                            {space.spaceName || "未命名空间"}
                                        </h3>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "8px",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <Tag
                                                color={typeInfo.color}
                                                icon={typeInfo.icon}
                                            >
                                                {typeInfo.text}
                                            </Tag>
                                            <Tag color={levelInfo.color}>
                                                <TrophyOutlined
                                                    style={{
                                                        marginRight: "4px",
                                                    }}
                                                />
                                                {levelInfo.text}
                                            </Tag>
                                        </div>
                                    </div>

                                    {/* 空间详情 */}
                                    <Descriptions
                                        column={1}
                                        size="small"
                                        style={{ marginBottom: "12px" }}
                                    >
                                        <Descriptions.Item
                                            label={<UserOutlined />}
                                            labelStyle={{ width: "80px" }}
                                        >
                                            <span
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    display: "block",
                                                }}
                                            >
                                                {space.user?.userName ||
                                                    `用户ID: ${space.userId}`}
                                            </span>
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={<DatabaseOutlined />}
                                            labelStyle={{ width: "80px" }}
                                        >
                                            {toNumber(space.totalCount)} /{" "}
                                            {toNumber(space.maxCount)} 个图表
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={<DatabaseOutlined />}
                                            labelStyle={{ width: "80px" }}
                                        >
                                            {formatFileSize(space.totalSize)} /{" "}
                                            {formatFileSize(space.maxSize)}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={<ClockCircleOutlined />}
                                            labelStyle={{ width: "80px" }}
                                        >
                                            {space.createTime
                                                ? new Date(
                                                      space.createTime,
                                                  ).toLocaleString()
                                                : "未知时间"}
                                        </Descriptions.Item>
                                    </Descriptions>

                                    {/* 存储使用进度条 */}
                                    <div style={{ marginBottom: "12px" }}>
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#666",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            存储使用率
                                        </div>
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "6px",
                                                backgroundColor: "#f0f0f0",
                                                borderRadius: "3px",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${Math.min(
                                                        (toNumber(
                                                            space.totalSize,
                                                        ) /
                                                            Math.max(
                                                                toNumber(
                                                                    space.maxSize,
                                                                ),
                                                                1,
                                                            )) *
                                                            100,
                                                        100,
                                                    )}%`,
                                                    height: "100%",
                                                    backgroundColor:
                                                        toNumber(
                                                            space.totalSize,
                                                        ) /
                                                            Math.max(
                                                                toNumber(
                                                                    space.maxSize,
                                                                ),
                                                                1,
                                                            ) >
                                                        0.9
                                                            ? "#ff4d4f"
                                                            : toNumber(
                                                                    space.totalSize,
                                                                ) /
                                                                    Math.max(
                                                                        toNumber(
                                                                            space.maxSize,
                                                                        ),
                                                                        1,
                                                                    ) >
                                                                0.7
                                                              ? "#faad14"
                                                              : "#52c41a",
                                                    transition: "width 0.3s",
                                                }}
                                            />
                                        </div>
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
                                                loading={
                                                    loadingSpaceDetail &&
                                                    editingSpace?.id ===
                                                        space.id
                                                }
                                                onClick={() =>
                                                    handleOpenEditModal(space)
                                                }
                                            />
                                        </Tooltip>
                                        <Popconfirm
                                            title="删除空间"
                                            description="确定要删除这个空间吗？删除后空间内的所有图表都会被删除！"
                                            onConfirm={() =>
                                                handleDeleteSpace(
                                                    space.id?.toString(),
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
                            )
                        })
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
                title="编辑空间信息"
                open={editModalVisible}
                onOk={handleSaveEdit}
                onCancel={() => {
                    setEditModalVisible(false)
                    editForm.resetFields()
                }}
                okText="保存"
                cancelText="取消"
                forceRender
                width={600}
            >
                <Spin
                    spinning={loadingSpaceDetail}
                    indicator={<DatabaseOutlined spin />}
                >
                    <Form form={editForm} layout="vertical">
                        <Form.Item
                            label="空间名称"
                            name="spaceName"
                            rules={[
                                { required: true, message: "请输入空间名称" },
                            ]}
                        >
                            <Input placeholder="请输入空间名称" />
                        </Form.Item>
                        <Form.Item
                            label="空间级别"
                            name="spaceLevel"
                            tooltip="修改空间级别会自动更新最大图表数和最大存储空间"
                        >
                            <Select placeholder="请选择空间级别">
                                {spaceLevels.map((level) => (
                                    <Select.Option
                                        key={level.value}
                                        value={level.value}
                                    >
                                        {level.text} - 最大 {level.maxCount}{" "}
                                        个图表 / {formatFileSize(level.maxSize)}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="最大图表数量"
                            name="maxCount"
                            tooltip="空间最多能包含的图表数量"
                        >
                            <Input
                                type="number"
                                placeholder="请输入最大图表数量"
                            />
                        </Form.Item>
                        <Form.Item
                            label="最大存储空间（字节）"
                            name="maxSize"
                            tooltip="空间最大存储空间，单位：字节"
                        >
                            <Input
                                type="number"
                                placeholder="请输入最大存储空间（字节）"
                            />
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>
        </>
    )
}
