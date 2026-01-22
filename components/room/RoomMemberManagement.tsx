"use client"

import {
    DeleteOutlined,
    EditOutlined,
    LoadingOutlined,
    PlusOutlined,
    TeamOutlined,
    UserAddOutlined,
} from "@ant-design/icons"
import {
    App,
    message as antMessage,
    Button,
    Card,
    Form,
    Input,
    Modal,
    Popconfirm,
    Select,
    Spin,
    Table,
    Tag,
    Tooltip,
} from "antd"
import { useEffect, useState } from "react"
import {
    addRoomMember,
    deleteRoomMember,
    editRoomMember,
    listRoomMember,
} from "@/api/roomMemberController"

const { Option } = Select

interface RoomMemberManagementProps {
    visible: boolean
    onClose: () => void
    roomId: string
}

// 房间角色选项
const ROOM_ROLE_OPTIONS = [
    {
        value: "diagram_admin",
        label: "房间管理员",
        color: "red",
        description: "拥有所有权限",
    },
    {
        value: "diagram_editor",
        label: "编辑者",
        color: "blue",
        description: "可以编辑图表",
    },
    {
        value: "diagram_viewer",
        label: "查看者",
        color: "green",
        description: "只能查看图表",
    },
]

export function RoomMemberManagement({
    visible,
    onClose,
    roomId,
}: RoomMemberManagementProps) {
    const { message } = App.useApp()

    const [members, setMembers] = useState<API.RoomMemberVO[]>([])
    const [loading, setLoading] = useState(false)
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [editingMember, setEditingMember] = useState<API.RoomMemberVO | null>(
        null,
    )

    const [editForm] = Form.useForm()
    const [addForm] = Form.useForm()

    // 加载房间成员列表
    const loadMembers = async () => {
        if (!roomId) return

        setLoading(true)
        try {
            const response = await listRoomMember({ roomId })
            if (response?.code === 0 && response?.data) {
                setMembers(response.data || [])
            } else {
                message.error(
                    "获取成员列表失败：" + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载成员列表失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            setLoading(false)
        }
    }

    // 当模态框打开时加载数据
    useEffect(() => {
        if (visible) {
            loadMembers()
        }
    }, [visible, roomId])

    // 打开编辑模态框
    const handleOpenEditModal = (member: API.RoomMemberVO) => {
        setEditingMember(member)
        setEditModalVisible(true)
        editForm.setFieldsValue({
            roomRole: member.roomRole,
        })
    }

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields()
            const response = await editRoomMember({
                id: String(editingMember?.id),
                roomRole: values.roomRole,
            })

            if (response?.code === 0) {
                message.success("修改成功")
                setEditModalVisible(false)
                loadMembers()
            } else {
                message.error(response?.message || "修改失败")
            }
        } catch (error) {
            console.error("保存失败:", error)
            if (!error.errorFields) {
                message.error("保存失败")
            }
        }
    }

    // 打开添加成员模态框
    const handleOpenAddModal = () => {
        addForm.resetFields()
        setAddModalVisible(true)
    }

    // 添加成员
    const handleAddMember = async () => {
        try {
            const values = await addForm.validateFields()

            // 检查用户是否已经是成员
            const isMember = members.some((m) => m.userId === values.userId)
            if (isMember) {
                message.warning("该用户已经是房间成员")
                return
            }

            const response = await addRoomMember({
                roomId: String(roomId),
                userId: String(values.userId),
                roomRole: values.roomRole,
            })

            if (response?.code === 0) {
                message.success("添加成功")
                setAddModalVisible(false)
                addForm.resetFields()
                loadMembers()
            } else {
                message.error(response?.message || "添加失败")
            }
        } catch (error) {
            console.error("添加失败:", error)
            if (!error.errorFields) {
                message.error("添加失败")
            }
        }
    }

    // 删除成员
    const handleDeleteMember = async (memberId: string) => {
        try {
            const response = await deleteRoomMember({ id: memberId })
            if (response?.code === 0) {
                message.success("删除成功")
                loadMembers()
            } else {
                message.error(response?.message || "删除失败")
            }
        } catch (error) {
            console.error("删除成员失败:", error)
            message.error("删除操作异常")
        }
    }

    // 获取角色配置
    const getRoleConfig = (roleValue: string) => {
        return (
            ROOM_ROLE_OPTIONS.find((opt) => opt.value === roleValue) ||
            ROOM_ROLE_OPTIONS[2]
        )
    }

    // 表格列定义
    const columns = [
        {
            title: "成员ID",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "用户昵称",
            dataIndex: "userName",
            key: "userName",
            width: 150,
            render: (name: string, record: API.RoomMemberVO) => (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <span>{name}</span>
                    {record.userAccount && (
                        <Tooltip title={`账号: ${record.userAccount}`}>
                            <span style={{ color: "#999", fontSize: "12px" }}>
                                @{record.userAccount}
                            </span>
                        </Tooltip>
                    )}
                </div>
            ),
        },
        {
            title: "用户头像",
            dataIndex: "userAvatar",
            key: "userAvatar",
            width: 80,
            render: (avatar: string) =>
                avatar ? (
                    <img
                        src={avatar}
                        alt="avatar"
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        👤
                    </div>
                ),
        },
        {
            title: "房间角色",
            dataIndex: "roomRole",
            key: "roomRole",
            width: 150,
            render: (role: string) => {
                const config = getRoleConfig(role)
                return (
                    <Tooltip title={config.description}>
                        <Tag
                            color={config.color}
                            style={{ fontSize: "13px", padding: "4px 10px" }}
                        >
                            {config.label}
                        </Tag>
                    </Tooltip>
                )
            },
        },
        {
            title: "加入时间",
            dataIndex: "createTime",
            key: "createTime",
            width: 180,
            render: (time: string) =>
                time ? new Date(time).toLocaleString() : "-",
        },
        {
            title: "操作",
            key: "action",
            width: 150,
            fixed: "right" as const,
            render: (_: any, record: API.RoomMemberVO) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Tooltip title="编辑角色">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenEditModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="移除成员"
                        description="确定要移除这个成员吗？移除后该成员将无法访问此房间。"
                        onConfirm={() => handleDeleteMember(String(record.id))}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            ),
        },
    ]

    return (
        <Modal
            title={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <TeamOutlined
                        style={{ fontSize: "18px", color: "#ff4d4f" }}
                    />
                    <span>房间成员管理</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={1000}
            destroyOnClose
        >
            <Card
                bordered={false}
                style={{ borderRadius: "8px", marginBottom: "16px" }}
                extra={
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={handleOpenAddModal}
                        style={{ borderRadius: "6px" }}
                    >
                        添加成员
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={members}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* 编辑成员角色模态框 */}
            <Modal
                title="编辑成员角色"
                open={editModalVisible}
                onOk={handleSaveEdit}
                onCancel={() => {
                    setEditModalVisible(false)
                    editForm.resetFields()
                }}
                okText="保存"
                cancelText="取消"
                forceRender
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item label="成员昵称" style={{ marginBottom: "8px" }}>
                        <Input value={editingMember?.userName} disabled />
                    </Form.Item>
                    <Form.Item
                        label="房间角色"
                        name="roomRole"
                        rules={[{ required: true, message: "请选择房间角色" }]}
                    >
                        <Select placeholder="请选择房间角色">
                            {ROOM_ROLE_OPTIONS.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                        }}
                                    >
                                        <Tag color={option.color}>
                                            {option.label}
                                        </Tag>
                                        <span
                                            style={{
                                                color: "#999",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {option.description}
                                        </span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 添加成员模态框 */}
            <Modal
                title="添加成员到房间"
                open={addModalVisible}
                onOk={handleAddMember}
                onCancel={() => {
                    setAddModalVisible(false)
                    addForm.resetFields()
                }}
                okText="添加"
                cancelText="取消"
                destroyOnClose
            >
                <Form form={addForm} layout="vertical" preserve={false}>
                    <Form.Item
                        label="用户ID"
                        name="userId"
                        rules={[
                            { required: true, message: "请输入用户ID" },
                            { pattern: /^\d+$/, message: "用户ID必须是数字" },
                        ]}
                        extra="请输入要添加的用户ID"
                    >
                        <Input placeholder="请输入用户ID（例如：1234567890）" />
                    </Form.Item>
                    <Form.Item
                        label="房间角色"
                        name="roomRole"
                        rules={[{ required: true, message: "请选择房间角色" }]}
                    >
                        <Select placeholder="请选择房间角色">
                            {ROOM_ROLE_OPTIONS.map((option) => (
                                <Option key={option.value} value={option.value}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                        }}
                                    >
                                        <Tag color={option.color}>
                                            {option.label}
                                        </Tag>
                                        <span
                                            style={{
                                                color: "#999",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {option.description}
                                        </span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Modal>
    )
}
