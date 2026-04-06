"use client"

import {
    ClockCircleOutlined,
    CopyOutlined,
    EditOutlined,
    GiftOutlined,
    IdcardOutlined,
    LinkOutlined,
    LoadingOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
    SafetyOutlined,
    ThunderboltOutlined,
    UserOutlined,
} from "@ant-design/icons"
import {
    App,
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Form,
    Input,
    Modal,
    Row,
    Statistic,
    Tabs,
    Tag,
    Tooltip,
    Typography,
    Upload,
} from "antd"
import type { UploadChangeParam } from "antd/es/upload"
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {
    getUserAiQuota,
    getUserVoById,
    sendRegisterCode,
    updateAccount,
    updateMyUser,
    uploadAvataImage,
} from "@/api/userController"
import type { RootState } from "@/stores"

const { Title, Paragraph } = Typography
const { TextArea } = Input

export default function UserProfilePage() {
    const { message } = App.useApp()
    const params = useParams()
    const userId = params.userId as string
    const loginUser = useSelector((state: RootState) => state.loginUser)

    const [user, setUser] = useState<API.UserVO | null>(null)
    const [loading, setLoading] = useState(false)
    // AI 额度状态
    const [aiQuota, setAiQuota] = useState<Record<string, number>>({})
    const [quotaLoading, setQuotaLoading] = useState(false)

    // 编辑相关状态
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)
    const [securityModalVisible, setSecurityModalVisible] = useState(false)
    const [form] = Form.useForm()

    // 判断是否是当前登录用户的个人主页
    const isOwner =
        loginUser?.id && user?.id && String(loginUser.id) === String(user.id)

    // 加载用户信息
    const loadUserInfo = async () => {
        if (!userId) return

        setLoading(true)
        try {
            const response = await getUserVoById({
                id: userId as any,
            })

            // lib/request.ts 拦截器返回的是 data 本身
            const res = response as any
            if (res?.code === 0 && res?.data) {
                setUser(res.data)
            } else {
                message.error(res?.message || "获取用户信息失败")
            }
        } catch (error) {
            console.error("获取用户信息失败:", error)
            message.error("系统繁忙，请稍后重试")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUserInfo()
    }, [userId])

    // 加载 AI 额度（仅本人可见）
    const loadAiQuota = async () => {
        if (!isOwner) return
        setQuotaLoading(true)
        try {
            const res = await getUserAiQuota()
            if (res.code === 0 && res.data) {
                setAiQuota(res.data as Record<string, number>)
            }
        } catch (error) {
            console.error("获取AI额度失败:", error)
        } finally {
            setQuotaLoading(false)
        }
    }

    useEffect(() => {
        if (isOwner) {
            loadAiQuota()
        }
    }, [isOwner])

    // 复制邀请链接
    const copyInviteLink = () => {
        if (!user?.inviteCode) return
        const inviteLink = `${window.location.origin}/user/register?inviteCode=${user.inviteCode}`
        navigator.clipboard.writeText(inviteLink)
        message.success("邀请链接已复制到剪贴板！")
    }

    // 复制邀请码
    const copyInviteCode = () => {
        if (!user?.inviteCode) return
        navigator.clipboard.writeText(user.inviteCode)
        message.success("邀请码已复制到剪贴板！")
    }

    // 打开编辑模态框
    const handleEdit = () => {
        if (!user) return
        form.setFieldsValue({
            userName: user.userName,
            userAvatar: user.userAvatar,
            userProfile: user.userProfile,
        })
        setEditModalVisible(true)
    }

    // 提交编辑
    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields()
            setConfirmLoading(true)

            const response = await updateMyUser({
                ...values,
            })

            const res = response as any
            if (res?.code === 0) {
                message.success("修改成功")
                setEditModalVisible(false)
                loadUserInfo() // 刷新用户信息
            } else {
                message.error(res?.message || "修改失败")
            }
        } catch (error) {
            console.error("修改用户信息失败:", error)
            message.error("修改失败，请稍后重试")
        } finally {
            setConfirmLoading(false)
        }
    }

    // Upload Props
    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng =
            file.type === "image/jpeg" || file.type === "image/png"
        if (!isJpgOrPng) {
            message.error("You can only upload JPG/PNG file!")
        }
        const isLt5M = file.size / 1024 / 1024 < 5
        if (!isLt5M) {
            message.error("Image must smaller than 5MB!")
        }
        return isJpgOrPng && isLt5M
    }

    const handleChange: UploadProps["onChange"] = async (
        info: UploadChangeParam<UploadFile>,
    ) => {
        if (info.file.status === "uploading") {
            setAvatarLoading(true)
            return
        }

        // Handle custom upload separately if needed, but here we use customRequest
        // actually for this API we might want to use customRequest to upload directly
    }

    const customRequest = async (options: any) => {
        const { file, onSuccess, onError } = options
        setAvatarLoading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await uploadAvataImage(formData)
            if (res.code === 0 && res.data) {
                form.setFieldValue("userAvatar", res.data)
                onSuccess(res.data)
                message.success("Upload successful")
            } else {
                onError(new Error(res.message))
                message.error("Upload failed: " + res.message)
            }
        } catch (err) {
            onError(err)
            message.error("Upload failed")
        } finally {
            setAvatarLoading(false)
        }
    }

    const uploadButton = (
        <div>
            {avatarLoading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    )

    // 获取角色标签颜色
    const getRoleColor = (role: string | undefined) => {
        switch (role) {
            case "admin":
                return "red"
            case "user":
                return "blue"
            default:
                return "default"
        }
    }

    // 获取角色文本
    const getRoleText = (role: string | undefined) => {
        switch (role) {
            case "admin":
                return "管理员"
            case "user":
                return "普通用户"
            case "notLogin":
                return "未登录"
            default:
                return role || "未知"
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f0f2f5",
                paddingBottom: "24px",
            }}
        >
            {/* 顶部背景图区域 */}
            <div
                style={{
                    height: "300px",
                    background:
                        "linear-gradient(to bottom, #40a9ff 0%, #f0f2f5 100%)",
                    marginBottom: "-100px",
                }}
            />

            <div
                style={{
                    maxWidth: "1000px",
                    margin: "0 auto",
                    padding: "0 24px",
                }}
            >
                <Card
                    bordered={false}
                    loading={loading}
                    style={{
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    }}
                    bodyStyle={{ padding: "32px" }}
                >
                    {!loading && user ? (
                        <div>
                            {/* 头部：头像与基本信息 */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "32px",
                                }}
                            >
                                <div style={{ display: "flex", gap: "24px" }}>
                                    <Avatar
                                        size={100}
                                        src={
                                            user.userAvatar ||
                                            "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
                                        }
                                        style={{
                                            border: "4px solid #fff",
                                            boxShadow:
                                                "0 2px 8px rgba(0,0,0,0.08)",
                                            backgroundColor: "#f5f5f5", // cleaner fallback
                                        }}
                                        icon={
                                            <UserOutlined
                                                style={{ color: "#bfbfbf" }}
                                            />
                                        }
                                    />
                                    <div style={{ paddingTop: "12px" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            <Title
                                                level={3}
                                                style={{ marginBottom: 0 }}
                                            >
                                                {user.userName || "未命名用户"}
                                            </Title>
                                            <Tag
                                                color={getRoleColor(
                                                    user.userRole,
                                                )}
                                                style={{ margin: 0 }}
                                            >
                                                {getRoleText(user.userRole)}
                                            </Tag>
                                        </div>
                                        <div
                                            style={{
                                                color: "#666",
                                                fontSize: "14px",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            <SafetyOutlined
                                                style={{ marginRight: "6px" }}
                                            />
                                            {user.id}
                                        </div>
                                        {user.userProfile && (
                                            <Paragraph
                                                type="secondary"
                                                style={{
                                                    maxWidth: "500px",
                                                    marginBottom: 0,
                                                }}
                                                ellipsis={{ rows: 2 }}
                                            >
                                                {user.userProfile}
                                            </Paragraph>
                                        )}
                                    </div>
                                </div>
                                {isOwner && (
                                    <div
                                        style={{ display: "flex", gap: "12px" }}
                                    >
                                        <Button
                                            type="default"
                                            size="large"
                                            icon={<SafetyCertificateOutlined />}
                                            onClick={() =>
                                                setSecurityModalVisible(true)
                                            }
                                            style={{
                                                borderRadius: "6px",
                                            }}
                                        >
                                            安全设置
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<EditOutlined />}
                                            onClick={handleEdit}
                                            style={{
                                                borderRadius: "6px",
                                                padding: "0 24px",
                                            }}
                                        >
                                            编辑资料
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <Divider />

                            {/* 详细信息列表 */}
                            <Descriptions
                                title="详细资料"
                                column={2}
                                size="middle"
                                labelStyle={{
                                    color: "#8c8c8c",
                                    width: "100px",
                                }}
                                contentStyle={{
                                    color: "#262626",
                                    fontWeight: 500,
                                }}
                            >
                                <Descriptions.Item
                                    label="用户名"
                                    labelStyle={{ alignItems: "center" }}
                                >
                                    <UserOutlined
                                        style={{
                                            marginRight: 8,
                                            color: "#1890ff",
                                        }}
                                    />
                                    {user.userName || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="账号">
                                    <IdcardOutlined
                                        style={{
                                            marginRight: 8,
                                            color: "#1890ff",
                                        }}
                                    />
                                    {user.userAccount || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="注册时间">
                                    <ClockCircleOutlined
                                        style={{
                                            marginRight: 8,
                                            color: "#1890ff",
                                        }}
                                    />
                                    {user.createTime
                                        ? new Date(
                                              user.createTime,
                                          ).toLocaleString()
                                        : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="最后更新">
                                    <EditOutlined
                                        style={{
                                            marginRight: 8,
                                            color: "#1890ff",
                                        }}
                                    />
                                    {user.updateTime
                                        ? new Date(
                                              user.updateTime,
                                          ).toLocaleString()
                                        : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="个人简介" span={2}>
                                    <div
                                        style={{
                                            whiteSpace: "pre-wrap",
                                            background: "#fafafa",
                                            padding: "12px",
                                            borderRadius: "6px",
                                            color: user.userProfile
                                                ? "#262626"
                                                : "#ccc",
                                        }}
                                    >
                                        {user.userProfile ||
                                            "这个人很懒，什么都没有写~"}
                                    </div>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    ) : (
                        !loading && (
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "80px 0",
                                }}
                            >
                                <UserOutlined
                                    style={{
                                        fontSize: "64px",
                                        color: "#d9d9d9",
                                        marginBottom: "16px",
                                    }}
                                />
                                <p style={{ color: "#999", fontSize: "16px" }}>
                                    未找到用户信息
                                </p>
                            </div>
                        )
                    )}
                </Card>

                {/* AI 额度与邀请链接卡片（仅本人可见） */}
                {isOwner && (
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                            marginTop: "24px",
                        }}
                        bodyStyle={{ padding: "24px" }}
                    >
                        <Row gutter={24}>
                            {/* AI 额度 */}
                            <Col span={12}>
                                <div style={{ marginBottom: 16 }}>
                                    <Title
                                        level={5}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <ThunderboltOutlined
                                            style={{
                                                marginRight: 8,
                                                color: "#faad14",
                                            }}
                                        />
                                        AI 额度
                                    </Title>
                                </div>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Statistic
                                            title="剩余永久额度"
                                            value={aiQuota.permanent || 0}
                                            suffix="次"
                                            valueStyle={{ color: "#52c41a" }}
                                            loading={quotaLoading}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="剩余临时额度"
                                            value={aiQuota.temporary || 0}
                                            suffix="次"
                                            valueStyle={{ color: "#1677ff" }}
                                            loading={quotaLoading}
                                        />
                                    </Col>
                                </Row>
                                <div
                                    style={{
                                        marginTop: 12,
                                        color: "#8c8c8c",
                                        fontSize: 12,
                                    }}
                                >
                                    邀请好友注册，双方各得 5 次永久 AI 额度！
                                </div>
                            </Col>

                            {/* 邀请链接 */}
                            <Col span={12}>
                                <div style={{ marginBottom: 16 }}>
                                    <Title
                                        level={5}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <GiftOutlined
                                            style={{
                                                marginRight: 8,
                                                color: "#eb2f96",
                                            }}
                                        />
                                        邀请好友
                                    </Title>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <span
                                        style={{
                                            color: "#8c8c8c",
                                            marginRight: 8,
                                        }}
                                    >
                                        专属邀请码：
                                    </span>
                                    <Tag
                                        color="purple"
                                        style={{
                                            fontSize: 14,
                                            padding: "2px 8px",
                                        }}
                                    >
                                        {user?.inviteCode || "-"}
                                    </Tag>
                                    <Tooltip title="复制邀请码">
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<CopyOutlined />}
                                            onClick={copyInviteCode}
                                        />
                                    </Tooltip>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <span
                                        style={{
                                            color: "#8c8c8c",
                                            marginRight: 8,
                                        }}
                                    >
                                        邀请链接：
                                    </span>
                                    <Tooltip title="复制邀请链接">
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<LinkOutlined />}
                                            onClick={copyInviteLink}
                                        >
                                            复制链接
                                        </Button>
                                    </Tooltip>
                                </div>
                                <div style={{ color: "#8c8c8c", fontSize: 12 }}>
                                    分享邀请链接给好友，好友注册成功后双方各获得
                                    5 次永久 AI 额度！
                                </div>
                            </Col>
                        </Row>
                    </Card>
                )}
            </div>

            {/* 编辑用户信息模态框 */}
            <Modal
                title="编辑个人信息"
                open={editModalVisible}
                onOk={handleEditSubmit}
                onCancel={() => setEditModalVisible(false)}
                confirmLoading={confirmLoading}
                destroyOnClose
                centered
                maskClosable={false}
                width={560}
            >
                <div style={{ padding: "12px 0" }}>
                    <Form
                        form={form}
                        layout="vertical"
                        preserve={false}
                        initialValues={{
                            userName: user?.userName,
                            userAvatar: user?.userAvatar,
                            userProfile: user?.userProfile,
                        }}
                    >
                        <Form.Item
                            label="用户昵称"
                            name="userName"
                            rules={[
                                { required: true, message: "请输入用户昵称" },
                            ]}
                        >
                            <Input
                                placeholder="给取个好听的名字吧"
                                maxLength={20}
                                size="large"
                            />
                        </Form.Item>
                        <Form.Item label="头像">
                            <Form.Item name="userAvatar" noStyle hidden>
                                <Input />
                            </Form.Item>
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                onChange={handleChange}
                                customRequest={customRequest}
                            >
                                {form.getFieldValue("userAvatar") ? (
                                    <img
                                        src={form.getFieldValue("userAvatar")}
                                        alt="avatar"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            borderRadius: "8px",
                                        }}
                                    />
                                ) : (
                                    uploadButton
                                )}
                            </Upload>
                        </Form.Item>
                        <Form.Item label="个人简介" name="userProfile">
                            <TextArea
                                placeholder="介绍一下你自己..."
                                maxLength={500}
                                rows={4}
                                showCount
                                size="large"
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
            {/* 安全设置模态框 */}
            <SecuritySettingsModal
                open={securityModalVisible}
                onCancel={() => setSecurityModalVisible(false)}
                currentUser={user}
            />
        </div>
    )
}

// ----------------------
// 安全设置模态框组件
// ----------------------
const SecuritySettingsModal = ({
    open,
    onCancel,
    currentUser,
}: {
    open: boolean
    onCancel: () => void
    currentUser: API.UserVO | null
}) => {
    const { message } = App.useApp()
    const [activeTab, setActiveTab] = useState("password")
    const [passwordForm] = Form.useForm()
    const [emailForm] = Form.useForm()
    const [loading, setLoading] = useState(false)

    // 验证码倒计时状态
    const [pwdCountdown, setPwdCountdown] = useState(0)
    const [emailCountdown, setEmailCountdown] = useState(0)

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (pwdCountdown > 0) {
            timer = setTimeout(() => setPwdCountdown((c) => c - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [pwdCountdown])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (emailCountdown > 0) {
            timer = setTimeout(() => setEmailCountdown((c) => c - 1), 1000)
        }
        return () => clearTimeout(timer)
    }, [emailCountdown])

    // 通用发送验证码
    const sendCode = async (email: string, type: "password" | "email") => {
        if (!email) {
            message.error("邮箱不能为空")
            return
        }
        try {
            const res = await sendRegisterCode({ userAccount: email })
            if (res.code === 0) {
                message.success("验证码已发送")
                if (type === "password") setPwdCountdown(60)
                else setEmailCountdown(60)
            } else {
                message.error(res.message || "发送失败")
            }
        } catch (_e) {
            message.error("发送失败，请稍后重试")
        }
    }

    // 修改密码提交
    const handleUpdatePassword = async () => {
        try {
            const values = await passwordForm.validateFields()
            setLoading(true)
            const res = await updateAccount({
                userAccount: currentUser?.userAccount, // 使用当前账号
                ...values,
            })
            if (res.code === 0) {
                message.success("密码修改成功")
                passwordForm.resetFields()
                onCancel()
            } else {
                message.error(res.message || "修改失败")
            }
        } catch (_e) {
            // form validate error or api error
        } finally {
            setLoading(false)
        }
    }

    // 修改邮箱提交
    const handleUpdateEmail = async () => {
        try {
            const values = await emailForm.validateFields()
            setLoading(true)
            // 绑定新邮箱：传入 userAccount 为新邮箱
            const res = await updateAccount({
                ...values,
            })
            if (res.code === 0) {
                message.success("邮箱绑定成功，下次请使用新邮箱登录")
                emailForm.resetFields()
                onCancel()
                // 页面可能需要刷新或者登出，这里暂时只关闭弹窗，用户刷新页面后会看到新信息（如果接口更新了 Session）
                // 建议刷新页面
                window.location.reload()
            } else {
                message.error(res.message || "修改失败")
            }
        } catch (_e) {
            // error
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title="安全设置"
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: "password",
                        label: "修改密码",
                        children: (
                            <Form
                                form={passwordForm}
                                layout="vertical"
                                onFinish={handleUpdatePassword}
                            >
                                <div style={{ marginBottom: 16 }}>
                                    <Tag color="blue">
                                        当前账号: {currentUser?.userAccount}
                                    </Tag>
                                </div>
                                <Form.Item
                                    label="邮箱验证码"
                                    name="emailCode"
                                    rules={[
                                        {
                                            required: true,
                                            message: "请输入验证码",
                                        },
                                    ]}
                                >
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <Input placeholder="输入验证码" />
                                        <Button
                                            htmlType="button"
                                            disabled={pwdCountdown > 0}
                                            onClick={() =>
                                                sendCode(
                                                    currentUser?.userAccount ||
                                                        "",
                                                    "password",
                                                )
                                            }
                                        >
                                            {pwdCountdown > 0
                                                ? `${pwdCountdown}s`
                                                : "获取验证码"}
                                        </Button>
                                    </div>
                                </Form.Item>
                                <Form.Item
                                    label="新密码"
                                    name="newPassword"
                                    rules={[
                                        {
                                            required: true,
                                            message: "请输入新密码",
                                        },
                                        { min: 8, message: "密码至少8位" },
                                    ]}
                                >
                                    <Input.Password placeholder="请输入新密码" />
                                </Form.Item>
                                <Form.Item
                                    label="确认新密码"
                                    name="checkPassword"
                                    dependencies={["newPassword"]}
                                    rules={[
                                        {
                                            required: true,
                                            message: "请确认新密码",
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (
                                                    !value ||
                                                    getFieldValue(
                                                        "newPassword",
                                                    ) === value
                                                ) {
                                                    return Promise.resolve()
                                                }
                                                return Promise.reject(
                                                    new Error("两次密码不一致"),
                                                )
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password placeholder="请再次输入新密码" />
                                </Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                >
                                    确认修改
                                </Button>
                            </Form>
                        ),
                    },
                    {
                        key: "email",
                        label: "换绑邮箱",
                        children: (
                            <Form
                                form={emailForm}
                                layout="vertical"
                                onFinish={handleUpdateEmail}
                            >
                                <div
                                    style={{ marginBottom: 16, color: "#999" }}
                                >
                                    换绑后，您将使用新邮箱进行登录。
                                </div>
                                <Form.Item
                                    label="新邮箱地址"
                                    name="userAccount"
                                    rules={[
                                        {
                                            required: true,
                                            message: "请输入新邮箱",
                                        },
                                        {
                                            type: "email",
                                            message: "邮箱格式不正确",
                                        },
                                    ]}
                                >
                                    <Input placeholder="请输入新的邮箱地址" />
                                </Form.Item>
                                <Form.Item
                                    label="验证码"
                                    name="emailCode"
                                    rules={[
                                        {
                                            required: true,
                                            message: "请输入验证码",
                                        },
                                    ]}
                                >
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <Input placeholder="输入新邮箱收到的验证码" />
                                        <Button
                                            htmlType="button"
                                            disabled={emailCountdown > 0}
                                            onClick={async () => {
                                                try {
                                                    const email =
                                                        await emailForm
                                                            .validateFields([
                                                                "userAccount",
                                                            ])
                                                            .then(
                                                                (v) =>
                                                                    v.userAccount,
                                                            )
                                                    sendCode(email, "email")
                                                } catch (_e) {
                                                    // validation failed
                                                }
                                            }}
                                        >
                                            {emailCountdown > 0
                                                ? `${emailCountdown}s`
                                                : "获取验证码"}
                                        </Button>
                                    </div>
                                </Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                >
                                    确认换绑
                                </Button>
                            </Form>
                        ),
                    },
                ]}
            />
        </Modal>
    )
}
