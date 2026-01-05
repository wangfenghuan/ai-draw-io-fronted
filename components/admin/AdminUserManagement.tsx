"use client"

import {
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    UserOutlined,
} from "@ant-design/icons"
import {
    App,
    Button,
    Card,
    Form,
    Input,
    Modal,
    Pagination,
    Popconfirm,
    Table,
    Tag,
    Tooltip,
} from "antd"
import { useEffect, useState } from "react"
import {
    addUser,
    deleteUser,
    listUserVoByPage,
    updateUser,
} from "@/api/userController"

const { Search } = Input

export function AdminUserManagement() {
    const { message } = App.useApp()

    const [users, setUsers] = useState<API.UserVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    })

    const [searchText, setSearchText] = useState("")
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [editingUser, setEditingUser] = useState<API.UserVO | null>(null)
    const [editForm] = Form.useForm()
    const [addForm] = Form.useForm()

    // 加载用户列表
    const loadUsers = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        setLoading(true)
        try {
            const response = await listUserVoByPage({
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
                const serverSize = Number(data.size) || 10
                let serverTotal = Number(data.total) || 0

                if (serverTotal === 0 && records.length > 0) {
                    if (records.length > serverSize) {
                        serverTotal = records.length
                    } else {
                        serverTotal =
                            (serverCurrent - 1) * serverSize + records.length
                    }
                }

                setUsers(records)
                setPagination({
                    current: serverCurrent,
                    pageSize: serverSize,
                    total: serverTotal,
                })
            } else {
                message.error(
                    "获取用户列表失败：" + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载用户列表失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            setLoading(false)
        }
    }

    // 初始加载
    useEffect(() => {
        loadUsers()
    }, [])

    // 搜索触发
    const handleSearch = (value: string) => {
        setSearchText(value)
        setPagination((prev) => ({ ...prev, current: 1 }))
        loadUsers(1, pagination.pageSize)
    }

    // 分页、页大小变化触发
    const handleTableChange = (page: number, pageSize: number) => {
        setPagination({ ...pagination, current: page, pageSize })
        loadUsers(page, pageSize)
    }

    // 删除用户
    const handleDeleteUser = async (id: number | undefined) => {
        if (!id) return

        try {
            const response = await deleteUser({ id })
            if (response?.code === 0) {
                message.success("删除成功")
                loadUsers()
            } else {
                message.error(response?.message || "删除失败")
            }
        } catch (error) {
            console.error("删除用户失败:", error)
            message.error("删除操作异常")
        }
    }

    // 打开编辑模态框
    const handleOpenEditModal = (user: API.UserVO) => {
        setEditingUser(user)
        editForm.setFieldsValue({
            userName: user.userName,
            userAvatar: user.userAvatar,
            userProfile: user.userProfile,
            userRole: user.userRole,
        })
        setEditModalVisible(true)
    }

    // 保存编辑
    const handleSaveEdit = async () => {
        try {
            const values = await editForm.validateFields()
            const response = await updateUser({
                id: editingUser?.id,
                ...values,
            })

            if (response?.code === 0) {
                message.success("保存成功")
                setEditModalVisible(false)
                loadUsers()
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

    // 打开添加用户模态框
    const handleOpenAddModal = () => {
        addForm.resetFields()
        setAddModalVisible(true)
    }

    // 添加用户
    const handleAddUser = async () => {
        try {
            const values = await addForm.validateFields()
            const response = await addUser(values)

            if (response?.code === 0) {
                message.success("添加成功")
                setAddModalVisible(false)
                loadUsers()
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

    // 表格列定义
    const columns = [
        {
            title: "用户ID",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "用户名",
            dataIndex: "userName",
            key: "userName",
            width: 150,
        },
        {
            title: "用户账号",
            dataIndex: "userAccount",
            key: "userAccount",
            width: 150,
        },
        {
            title: "用户角色",
            dataIndex: "userRole",
            key: "userRole",
            width: 120,
            render: (role: string) => {
                const isAdmin = role === "admin"
                return (
                    <Tag color={isAdmin ? "red" : "blue"}>
                        {isAdmin ? "管理员" : "普通用户"}
                    </Tag>
                )
            },
        },
        {
            title: "用户简介",
            dataIndex: "userProfile",
            key: "userProfile",
            ellipsis: true,
        },
        {
            title: "创建时间",
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
            render: (_: any, record: API.UserVO) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Tooltip title="编辑用户">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenEditModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="删除用户"
                        description="确定要删除这个用户吗？删除后数据将无法恢复。"
                        onConfirm={() => handleDeleteUser(record.id)}
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
        <>
            <Card
                bordered={false}
                style={{ borderRadius: "8px" }}
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenAddModal}
                        style={{ borderRadius: "6px" }}
                    >
                        添加用户
                    </Button>
                }
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <UserOutlined
                            style={{ fontSize: "18px", color: "#ff4d4f" }}
                        />
                        <span>用户列表</span>
                    </div>
                }
            >
                {/* 搜索栏 */}
                <div style={{ marginBottom: "16px" }}>
                    <Search
                        placeholder="搜索用户名、账号、简介..."
                        allowClear
                        enterButton={
                            <Button icon={<SearchOutlined />}>搜索</Button>
                        }
                        onSearch={handleSearch}
                    />
                </div>

                {/* 用户列表表格 */}
                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1200 }}
                    style={{ marginBottom: "16px" }}
                />

                {/* 分页组件 */}
                {!loading && (
                    <div
                        style={{
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
                            pageSizeOptions={["10", "20", "50", "100"]}
                            showTotal={(total) => `共 ${total} 条`}
                        />
                    </div>
                )}
            </Card>

            {/* 编辑用户模态框 */}
            <Modal
                title="编辑用户信息"
                open={editModalVisible}
                onOk={handleSaveEdit}
                onCancel={() => setEditModalVisible(false)}
                okText="保存"
                cancelText="取消"
                destroyOnClose
            >
                <Form form={editForm} layout="vertical" preserve={false}>
                    <Form.Item
                        label="用户名"
                        name="userName"
                        rules={[{ required: true, message: "请输入用户名" }]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>
                    <Form.Item label="用户头像" name="userAvatar">
                        <Input placeholder="请输入头像URL" />
                    </Form.Item>
                    <Form.Item label="用户简介" name="userProfile">
                        <Input.TextArea placeholder="请输入用户简介" rows={3} />
                    </Form.Item>
                    <Form.Item
                        label="用户角色"
                        name="userRole"
                        rules={[{ required: true, message: "请选择用户角色" }]}
                    >
                        <Input placeholder="admin 或 user" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 添加用户模态框 */}
            <Modal
                title="添加用户"
                open={addModalVisible}
                onOk={handleAddUser}
                onCancel={() => setAddModalVisible(false)}
                okText="添加"
                cancelText="取消"
                destroyOnClose
            >
                <Form form={addForm} layout="vertical" preserve={false}>
                    <Form.Item
                        label="用户名"
                        name="userName"
                        rules={[{ required: true, message: "请输入用户名" }]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Form.Item>
                    <Form.Item
                        label="用户账号"
                        name="userAccount"
                        rules={[{ required: true, message: "请输入用户账号" }]}
                    >
                        <Input placeholder="请输入用户账号" />
                    </Form.Item>
                    <Form.Item label="用户头像" name="userAvatar">
                        <Input placeholder="请输入头像URL" />
                    </Form.Item>
                    <Form.Item label="用户简介" name="userProfile">
                        <Input.TextArea placeholder="请输入用户简介" rows={3} />
                    </Form.Item>
                    <Form.Item
                        label="用户角色"
                        name="userRole"
                        rules={[{ required: true, message: "请选择用户角色" }]}
                    >
                        <Input placeholder="admin 或 user" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
