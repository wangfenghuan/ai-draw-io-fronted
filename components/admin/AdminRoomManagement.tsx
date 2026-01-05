"use client"

import {
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    SearchOutlined,
    TeamOutlined,
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
    deleteDiagramRoom,
    listDiagramRoomVoByPage,
    updateDiagramRoom,
} from "@/api/roomController"

const { Search } = Input

export function AdminRoomManagement() {
    const { message } = App.useApp()

    const [rooms, setRooms] = useState<API.RoomVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    })

    const [searchText, setSearchText] = useState("")
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [editingRoom, setEditingRoom] = useState<API.RoomVO | null>(null)
    const [editForm] = Form.useForm()

    // 加载房间列表
    const loadRooms = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        setLoading(true)
        try {
            const response = await listDiagramRoomVoByPage({
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

                setRooms(records)
                setPagination({
                    current: serverCurrent,
                    pageSize: serverSize,
                    total: serverTotal,
                })
            } else {
                message.error(
                    "获取房间列表失败：" + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载房间列表失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            setLoading(false)
        }
    }

    // 初始加载
    useEffect(() => {
        loadRooms()
    }, [])

    // 搜索触发
    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination((prev) => ({ ...prev, current: 1 }))
        loadRooms(1, pagination.pageSize)
    }

    // 分页、页大小变化触发
    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ ...pagination, current: page, pageSize })
        loadRooms(page, pageSize)
    }

    // 删除房间
    const handleDeleteRoom = async (id: string | undefined) => {
        if (!id) return

        try {
            const response = await deleteDiagramRoom({
                id: parseInt(id, 10) as any,
            })
            if (response?.code === 0) {
                message.success("删除成功")
                loadRooms()
            } else {
                message.error(response?.message || "删除失败")
            }
        } catch (error) {
            console.error("删除房间失败:", error)
            message.error("删除操作异常")
        }
    }

    // 打开编辑模态框
    const handleOpenEditModal = (room: API.RoomVO) => {
        setEditingRoom(room)
        editForm.setFieldsValue({
            roomName: room.roomName,
            isPublic: room.isPublic,
            isOpen: room.isOpen,
            accessKey: room.accessKey,
        })
        setEditModalVisible(true)
    }

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields()
            const response = await updateDiagramRoom({
                id: editingRoom?.id,
                ...values,
            })

            if (response?.code === 0) {
                message.success("保存成功")
                setEditModalVisible(false)
                loadRooms()
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
                        <TeamOutlined
                            style={{ fontSize: "18px", color: "#ff4d4f" }}
                        />
                        <span>房间列表</span>
                    </div>
                }
            >
                {/* 搜索栏 */}
                <div style={{ marginBottom: "16px" }}>
                    <Search
                        placeholder="搜索房间名称..."
                        allowClear
                        enterButton={
                            <Button icon={<SearchOutlined />}>搜索</Button>
                        }
                        onSearch={handleSearch}
                    />
                </div>

                {/* 房间列表 Grid */}
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
                    ) : rooms.length === 0 ? (
                        <div
                            style={{
                                gridColumn: "1 / -1",
                                textAlign: "center",
                                padding: "60px 0",
                            }}
                        >
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="暂无协作房间"
                            />
                        </div>
                    ) : (
                        rooms.map((room) => (
                            <Card
                                key={room.id}
                                hoverable
                                style={{
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    border: "2px solid #ff4d4f",
                                }}
                                bodyStyle={{ padding: "12px" }}
                            >
                                <div style={{ marginBottom: "8px" }}>
                                    <h3
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: 600,
                                            marginBottom: "6px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                        title={room.roomName}
                                    >
                                        {room.roomName || "未命名房间"}
                                    </h3>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontSize: "11px",
                                            color: "#999",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        <ClockCircleOutlined />
                                        <span>
                                            {room.createTime
                                                ? new Date(
                                                      room.createTime,
                                                  ).toLocaleString()
                                                : "未知时间"}
                                        </span>
                                    </div>
                                </div>

                                {/* 房间信息卡片 */}
                                <div
                                    style={{
                                        marginBottom: "8px",
                                        padding: "8px",
                                        borderRadius: "4px",
                                        background: "#fff1f0",
                                        border: "1px solid #ffccc7",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "4px",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontSize: "11px",
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
                                            创建者: {room.ownerId || "未知"}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontSize: "11px",
                                            color: "#666",
                                        }}
                                    >
                                        <TeamOutlined />
                                        <span>ID: {room.id || "-"}</span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontSize: "11px",
                                            color: "#666",
                                        }}
                                    >
                                        <EyeOutlined />
                                        <span>
                                            {room.isPublic === 0
                                                ? "公开"
                                                : "私有"}
                                        </span>
                                    </div>
                                </div>

                                {/* 操作按钮区 */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "6px",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    <Tooltip title="修改信息">
                                        <Button
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={() =>
                                                handleOpenEditModal(room)
                                            }
                                        />
                                    </Tooltip>
                                    <Popconfirm
                                        title="删除房间"
                                        description="确定要删除这个协作房间吗？"
                                        onConfirm={() =>
                                            handleDeleteRoom(
                                                room.id?.toString(),
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
                title="编辑房间信息"
                open={editModalVisible}
                onOk={handleSaveEdit}
                onCancel={() => setEditModalVisible(false)}
                okText="保存"
                cancelText="取消"
                destroyOnClose
            >
                <Form form={editForm} layout="vertical" preserve={false}>
                    <Form.Item
                        label="房间名称"
                        name="roomName"
                        rules={[{ required: true, message: "请输入房间名称" }]}
                    >
                        <Input placeholder="请输入房间名称" />
                    </Form.Item>
                    <Form.Item
                        label="是否公开"
                        name="isPublic"
                        tooltip="0=公开，1=私有"
                    >
                        <Input type="number" placeholder="0=公开, 1=私有" />
                    </Form.Item>
                    <Form.Item
                        label="是否开启"
                        name="isOpen"
                        tooltip="0=开启，1=关闭"
                    >
                        <Input type="number" placeholder="0=开启, 1=关闭" />
                    </Form.Item>
                    <Form.Item label="访问密码" name="accessKey">
                        <Input placeholder="请输入访问密码" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
