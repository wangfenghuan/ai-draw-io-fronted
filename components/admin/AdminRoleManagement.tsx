"use client"

import {
    DeleteOutlined,
    EditOutlined,
    LoadingOutlined,
    PlusOutlined,
    SafetyOutlined,
    SecurityScanOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons"
import {
    App,
    Button,
    Card,
    Checkbox,
    Col,
    Form,
    Input,
    Modal,
    Popconfirm,
    Row,
    Select,
    Spin,
    Table,
    Tag,
    Tooltip,
} from "antd"
import { useEffect, useRef, useState } from "react"
import {
    getAllRoleAndAuth,
    listUserVoByPage,
    updateRoleAuthorities,
    updateUserRoles,
} from "@/api/userController"

const { Option } = Select

export function AdminRoleManagement() {
    const { message: antMessage } = App.useApp()

    // 角色和权限数据
    const [roles, setRoles] = useState<API.RoleWithAuthoritiesVO[]>([])
    const [allAuthorities, setAllAuthorities] = useState<API.SysAuthority[]>([])
    const [loading, setLoading] = useState(false)
    const [editRoleModalVisible, setEditRoleModalVisible] = useState(false)
    const [editingRole, setEditingRole] =
        useState<API.RoleWithAuthoritiesVO | null>(null)

    // 用户角色管理
    const [users, setUsers] = useState<API.UserVO[]>([])
    const [userPagination, setUserPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    })
    const [userLoading, setUserLoading] = useState(false)
    const [editUserRoleModalVisible, setUserRoleModalVisible] = useState(false)
    const [editingUser, setEditingUser] = useState<API.UserVO | null>(null)
    const [userRoleForm] = Form.useForm()
    const [roleAuthForm] = Form.useForm()

    const isLoadingRef = useRef(false)

    // 加载所有角色和权限
    const loadRolesAndAuthorities = async () => {
        if (isLoadingRef.current) {
            return
        }
        isLoadingRef.current = true
        setLoading(true)

        try {
            const response = await getAllRoleAndAuth()

            if (response?.code === 0 && response?.data) {
                const rolesData = response.data || []
                setRoles(rolesData)

                // 提取所有权限并去重
                const authoritiesMap = new Map<string, API.SysAuthority>()
                rolesData.forEach((role) => {
                    role.authorities?.forEach((auth) => {
                        if (auth.id) {
                            authoritiesMap.set(String(auth.id), auth)
                        }
                    })
                })
                setAllAuthorities(Array.from(authoritiesMap.values()))
            } else {
                antMessage.error(
                    "获取角色权限失败：" + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载角色权限失败:", error)
            antMessage.error("系统繁忙，请稍后重试")
        } finally {
            isLoadingRef.current = false
            setLoading(false)
        }
    }

    // 加载用户列表
    const loadUsers = async (
        current = userPagination.current,
        pageSize = userPagination.pageSize,
    ) => {
        setUserLoading(true)

        try {
            const response = await listUserVoByPage({
                current: current,
                pageSize: pageSize,
                sortField: "createTime",
                sortOrder: "desc",
            })

            if (response?.code === 0 && response?.data) {
                const data = response.data
                const records = data.records || []

                setUsers(records)
                setUserPagination({
                    current: Number(data.current) || 1,
                    pageSize: Number(data.size) || 10,
                    total: Number(data.total) || 0,
                })
            } else {
                antMessage.error(
                    "获取用户列表失败：" + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("加载用户列表失败:", error)
            antMessage.error("系统繁忙，请稍后重试")
        } finally {
            setUserLoading(false)
        }
    }

    // 初始加载
    useEffect(() => {
        loadRolesAndAuthorities()
        loadUsers()
    }, [])

    // 打开编辑角色权限模态框
    const handleOpenEditRoleModal = (role: API.RoleWithAuthoritiesVO) => {
        setEditingRole(role)
        setEditRoleModalVisible(true)

        // 设置已选中的权限
        const selectedAuthIds =
            role.authorities?.map((auth) => String(auth.id)) || []
        roleAuthForm.setFieldsValue({
            authorityIds: selectedAuthIds,
        })
    }

    // 保存角色权限修改
    const handleSaveRoleAuthorities = async () => {
        try {
            const values = await roleAuthForm.validateFields()
            const authorityIds = values.authorityIds || []

            const response = await updateRoleAuthorities({
                roleId: String(editingRole?.id),
                authorityIds: authorityIds,
            })

            if (response?.code === 0) {
                antMessage.success("修改角色权限成功")
                setEditRoleModalVisible(false)
                loadRolesAndAuthorities()
            } else {
                antMessage.error(response?.message || "修改失败")
            }
        } catch (error) {
            console.error("保存角色权限失败:", error)
            if (!(error as any).errorFields) {
                antMessage.error("保存失败")
            }
        }
    }

    // 打开编辑用户角色模态框
    const handleOpenEditUserRoleModal = (user: API.UserVO) => {
        setEditingUser(user)
        setUserRoleModalVisible(true)

        // 从用户的 userRole 字段获取当前角色（可能是角色名称）
        // 需要在角色列表中找到匹配的 roleId
        const currentRole = roles.find((r) => r.roleName === user.userRole)
        userRoleForm.setFieldsValue({
            roleIds: currentRole?.id ? [String(currentRole.id)] : [],
        })
    }

    // 保存用户角色修改
    const handleSaveUserRoles = async () => {
        try {
            const values = await userRoleForm.validateFields()
            const roleIds = values.roleIds || []

            const response = await updateUserRoles({
                userId: String(editingUser?.id),
                roleIds: roleIds,
            })

            if (response?.code === 0) {
                antMessage.success("修改用户角色成功")
                setUserRoleModalVisible(false)
                loadUsers()
            } else {
                antMessage.error(response?.message || "修改失败")
            }
        } catch (error) {
            console.error("保存用户角色失败:", error)
            if (!(error as any).errorFields) {
                antMessage.error("保存失败")
            }
        }
    }

    // 角色表格列定义
    const roleColumns = [
        {
            title: "角色ID",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "角色名称",
            dataIndex: "roleName",
            key: "roleName",
            width: 150,
            render: (name: string) => (
                <Tag
                    color="blue"
                    style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                    {name}
                </Tag>
            ),
        },
        {
            title: "描述",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "权限数量",
            key: "authCount",
            width: 120,
            render: (_: any, record: API.RoleWithAuthoritiesVO) => (
                <Tag color="green">
                    {record.authorities?.length || 0} 个权限
                </Tag>
            ),
        },
        {
            title: "权限列表",
            key: "authorities",
            ellipsis: true,
            render: (_: any, record: API.RoleWithAuthoritiesVO) => {
                const authNames =
                    record.authorities?.map((a) => a.name).join(", ") || "无"
                return (
                    <Tooltip title={authNames}>
                        <span>{authNames}</span>
                    </Tooltip>
                )
            },
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
            width: 120,
            fixed: "right" as const,
            render: (_: any, record: API.RoleWithAuthoritiesVO) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Tooltip title="编辑权限">
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenEditRoleModal(record)}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ]

    // 用户表格列定义
    const userColumns = [
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
            title: "当前角色",
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
            width: 120,
            fixed: "right" as const,
            render: (_: any, record: API.UserVO) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <Tooltip title="分配角色">
                        <Button
                            size="small"
                            icon={<UserSwitchOutlined />}
                            onClick={() => handleOpenEditUserRoleModal(record)}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ]

    return (
        <>
            {/* 角色权限管理卡片 */}
            <Card
                bordered={false}
                style={{ borderRadius: "8px", marginBottom: "24px" }}
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <SecurityScanOutlined
                            style={{ fontSize: "18px", color: "#ff4d4f" }}
                        />
                        <span>角色与权限管理</span>
                    </div>
                }
            >
                <Table
                    columns={roleColumns}
                    dataSource={roles}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* 用户角色管理卡片 */}
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
                        <SafetyOutlined
                            style={{ fontSize: "18px", color: "#ff4d4f" }}
                        />
                        <span>用户角色分配</span>
                    </div>
                }
            >
                <Table
                    columns={userColumns}
                    dataSource={users}
                    loading={userLoading}
                    rowKey="id"
                    pagination={{
                        current: userPagination.current,
                        pageSize: userPagination.pageSize,
                        total: userPagination.total,
                        onChange: (page, pageSize) => {
                            setUserPagination({
                                ...userPagination,
                                current: page,
                                pageSize,
                            })
                            loadUsers(page, pageSize)
                        },
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* 编辑角色权限模态框 */}
            <Modal
                title={`编辑角色权限 - ${editingRole?.roleName || ""}`}
                open={editRoleModalVisible}
                onOk={handleSaveRoleAuthorities}
                onCancel={() => {
                    setEditRoleModalVisible(false)
                    roleAuthForm.resetFields()
                }}
                okText="保存"
                cancelText="取消"
                width={600}
                forceRender
            >
                <Spin spinning={loading} indicator={<LoadingOutlined spin />}>
                    <Form form={roleAuthForm} layout="vertical">
                        <Form.Item label="选择权限" name="authorityIds">
                            <Checkbox.Group style={{ width: "100%" }}>
                                <Row gutter={[8, 8]}>
                                    {allAuthorities.map((auth) => (
                                        <Col span={12} key={auth.id}>
                                            <Checkbox value={String(auth.id)}>
                                                <Tooltip
                                                    title={auth.description}
                                                >
                                                    <span>
                                                        {auth.name}{" "}
                                                        <span
                                                            style={{
                                                                color: "#999",
                                                            }}
                                                        >
                                                            ({auth.authority})
                                                        </span>
                                                    </span>
                                                </Tooltip>
                                            </Checkbox>
                                        </Col>
                                    ))}
                                </Row>
                            </Checkbox.Group>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal>

            {/* 编辑用户角色模态框 */}
            <Modal
                title={`分配用户角色 - ${editingUser?.userName || ""}`}
                open={editUserRoleModalVisible}
                onOk={handleSaveUserRoles}
                onCancel={() => {
                    setUserRoleModalVisible(false)
                    userRoleForm.resetFields()
                }}
                okText="保存"
                cancelText="取消"
                forceRender
            >
                <Form form={userRoleForm} layout="vertical">
                    <Form.Item
                        label="选择角色"
                        name="roleIds"
                        rules={[{ required: true, message: "请选择角色" }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="请选择角色"
                            style={{ width: "100%" }}
                        >
                            {roles.map((role) => (
                                <Option key={role.id} value={String(role.id)}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                        }}
                                    >
                                        <Tag color="blue">{role.roleName}</Tag>
                                        {role.description && (
                                            <span
                                                style={{
                                                    color: "#999",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                {role.description}
                                            </span>
                                        )}
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}
