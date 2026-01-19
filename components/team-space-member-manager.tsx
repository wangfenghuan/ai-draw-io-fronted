"use client"

import {
    App,
    Button,
    Card,
    Form,
    Input,
    Modal,
    Select,
    Space,
    Table,
    Tag,
} from "antd"
import { useEffect, useState } from "react"
import {
    addSpaceUser,
    deleteSpaceUser,
    editSpaceUser,
    listSpaceUser,
} from "@/api/spaceUserController"

interface TeamSpaceMemberManagerProps {
    spaceId: string
    spaceName: string
    open: boolean
    onCancel: () => void
}

// 角色枚举（与后端 API 保持一致）
enum SpaceRole {
    SPACE_ADMIN = "space_admin", // 空间管理员，拥有所有权限
    SPACE_EDITOR = "space_editor", // 编辑者，可以创建和编辑图表
    SPACE_VIEWER = "space_viewer", // 查看者，只能查看图表
}

export function TeamSpaceMemberManager({
    spaceId,
    spaceName,
    open,
    onCancel,
}: TeamSpaceMemberManagerProps) {
    const { message } = App.useApp()
    const [form] = Form.useForm()
    const [members, setMembers] = useState<API.SpaceUserVO[]>([])
    const [loading, setLoading] = useState(false)
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        if (open && spaceId) {
            loadMembers()
        }
    }, [open, spaceId])

    const loadMembers = async () => {
        setLoading(true)
        try {
            const response = await listSpaceUser({ spaceId })
            if (response?.code === 0 && response?.data) {
                setMembers(response.data)
            } else {
                message.error("加载成员列表失败")
            }
        } catch (error) {
            console.error("加载成员列表失败:", error)
            message.error("加载成员列表失败")
        } finally {
            setLoading(false)
        }
    }

    const handleAddMember = async () => {
        try {
            const values = await form.validateFields()
            setAdding(true)

            const response = await addSpaceUser({
                spaceId,
                userId: values.userId,
                spaceRole: values.spaceRole,
            })

            if (response?.code === 0) {
                message.success("添加成员成功")
                setAddModalVisible(false)
                form.resetFields()
                loadMembers()
            } else {
                message.error(response?.message || "添加成员失败")
            }
        } catch (error: any) {
            if (error.errorFields) {
                return
            }
            console.error("添加成员失败:", error)
            message.error("添加成员失败")
        } finally {
            setAdding(false)
        }
    }

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            const response = await editSpaceUser({
                id,
                spaceRole: newRole,
            })
            if (response?.code === 0) {
                message.success("修改权限成功")
                loadMembers()
            } else {
                message.error(response?.message || "修改权限失败")
            }
        } catch (error) {
            console.error("修改权限失败:", error)
            message.error("修改权限失败")
        }
    }

    const handleRemoveMember = async (id: string) => {
        try {
            const response = await deleteSpaceUser({ id })
            if (response?.code === 0) {
                message.success("移除成员成功")
                loadMembers()
            } else {
                message.error(response?.message || "移除成员失败")
            }
        } catch (error) {
            console.error("移除成员失败:", error)
            message.error("移除成员失败")
        }
    }

    const getRoleTag = (role?: string) => {
        switch (role) {
            case SpaceRole.SPACE_ADMIN:
                return <Tag color="red">空间管理员</Tag>
            case SpaceRole.SPACE_EDITOR:
                return <Tag color="blue">编辑者</Tag>
            case SpaceRole.SPACE_VIEWER:
                return <Tag color="default">查看者</Tag>
            default:
                return <Tag>{role}</Tag>
        }
    }

    const columns = [
        {
            title: "用户",
            dataIndex: ["user"],
            key: "user",
            render: (user: API.UserVO) => (
                <Space>
                    <span>{user?.userName || "未知用户"}</span>
                </Space>
            ),
        },
        {
            title: "角色",
            dataIndex: "spaceRole",
            key: "spaceRole",
            render: (role: string, record: API.SpaceUserVO) => (
                <Select
                    value={role}
                    style={{ width: 120 }}
                    onChange={(value) => handleRoleChange(record.id!, value)}
                >
                    <Select.Option value={SpaceRole.SPACE_ADMIN}>
                        空间管理员
                    </Select.Option>
                    <Select.Option value={SpaceRole.SPACE_EDITOR}>
                        编辑者
                    </Select.Option>
                    <Select.Option value={SpaceRole.SPACE_VIEWER}>
                        查看者
                    </Select.Option>
                </Select>
            ),
        },
        {
            title: "加入时间",
            dataIndex: "createTime",
            key: "createTime",
            render: (time: string) =>
                time ? new Date(time).toLocaleString() : "-",
        },
        {
            title: "操作",
            key: "action",
            render: (_: any, record: API.SpaceUserVO) => (
                <Button
                    danger
                    size="small"
                    type="link"
                    onClick={() => handleRemoveMember(record.id!)}
                >
                    移除
                </Button>
            ),
        },
    ]

    return (
        <>
            <Modal
                title={`成员管理 - ${spaceName}`}
                open={open}
                onCancel={onCancel}
                footer={null}
                width={800}
            >
                <Card
                    extra={
                        <Button
                            type="primary"
                            onClick={() => setAddModalVisible(true)}
                        >
                            添加成员
                        </Button>
                    }
                >
                    <Table
                        dataSource={members}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                    />
                </Card>
            </Modal>

            <Modal
                title="添加成员"
                open={addModalVisible}
                onOk={handleAddMember}
                onCancel={() => {
                    setAddModalVisible(false)
                    form.resetFields()
                }}
                confirmLoading={adding}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="用户ID"
                        name="userId"
                        rules={[{ required: true, message: "请输入用户ID" }]}
                    >
                        <Input placeholder="请输入要添加的用户ID" />
                    </Form.Item>
                    <Form.Item
                        label="角色"
                        name="spaceRole"
                        rules={[{ required: true, message: "请选择角色" }]}
                        initialValue={SpaceRole.SPACE_VIEWER}
                    >
                        <Select placeholder="请选择角色">
                            <Select.Option value={SpaceRole.SPACE_ADMIN}>
                                空间管理员 - 拥有所有权限
                            </Select.Option>
                            <Select.Option value={SpaceRole.SPACE_EDITOR}>
                                编辑者 - 可以创建和编辑图表
                            </Select.Option>
                            <Select.Option value={SpaceRole.SPACE_VIEWER}>
                                查看者 - 只能查看图表
                            </Select.Option>
                        </Select>
                    </Form.Item>
                    <div
                        style={{
                            background: "#f5f5f5",
                            padding: "12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            color: "#666",
                        }}
                    >
                        <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                            权限说明：
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            <li>管理员：可以管理成员、编辑所有图表</li>
                            <li>成员：可以编辑空间内的图表</li>
                            <li>查看者：仅可查看图表，不可编辑</li>
                        </ul>
                    </div>
                </Form>
            </Modal>
        </>
    )
}
