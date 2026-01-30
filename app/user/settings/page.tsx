"use client"
import {
    LockOutlined,
    MailOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons"
import {
    LoginForm,
    ProConfigProvider,
    ProFormText,
} from "@ant-design/pro-components"
import { App, Button, Card, Typography } from "antd"
import { useRouter } from "next/navigation"
import React, { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { getLoginUser, sendRegisterCode, updateUserAccount, userLogout } from "@/api/userController"
import { setLoginUser } from "@/stores/loginUser"

const UserSettings: React.FC = () => {
    const { message, modal } = App.useApp()
    const router = useRouter()
    const dispatch = useDispatch()
    
    const [currentUser, setCurrentUser] = useState<API.LoginUserVO>()
    const [countdown, setCountdown] = useState(0)
    const [sending, setSending] = useState(false)
    const [newEmail, setNewEmail] = useState<string>("")

    // Handle countdown timer
    useEffect(() => {
        let timer: NodeJS.Timeout
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown((prev) => prev - 1)
            }, 1000)
        }
        return () => clearTimeout(timer)
    }, [countdown])

    // Load user info
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await getLoginUser()
                if (res.code === 0 && res.data) {
                    setCurrentUser(res.data)
                } else {
                    message.error("未登录或登录已过期")
                    router.push("/user/login")
                }
            } catch (e) {
                router.push("/user/login")
            }
        }
        fetchUser()
    }, [router, message])

    const handleSendCode = async () => {
        const targetEmail = newEmail || currentUser?.userAccount
        
        if (!targetEmail) {
            message.error("无法获取目标邮箱")
            return
        }
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
            message.error("请输入有效的邮箱地址")
            return
        }

        try {
            setSending(true)
            const res = await sendRegisterCode({ userAccount: targetEmail })
            if (res.code === 0) {
                message.success(`验证码已发送至 ${targetEmail}`)
                setCountdown(60)
            } else {
                message.error(res.message || "发送失败")
            }
        } catch (error) {
            message.error("发送失败，请稍后重试")
        } finally {
            setSending(false)
        }
    }

    const handleSubmit = async (values: any) => {
        const { emailCode, newPassword, checkPassword } = values
        
        // Use new email if provided, otherwise use current email as the identifier
        const userAccount = newEmail || currentUser?.userAccount

        if (!userAccount) return

        try {
            const res = await updateUserAccount({
                userAccount,
                emailCode,
                newPassword,
                checkPassword
            })

            if (res.code === 0) {
                modal.success({
                    title: '更新成功',
                    content: '账户信息已更新，请重新登录',
                    onOk: async () => {
                        await userLogout()
                        dispatch(setLoginUser(undefined))
                        router.push("/user/login")
                    }
                })
            } else {
                message.error(res.message || "更新失败")
            }
        } catch (e) {
            message.error("请求失败，请稍后重试")
        }
    }

    if (!currentUser) return null

    return (
        <ProConfigProvider hashed={false}>
            <div style={{ maxWidth: 480, margin: "40px auto" }}>
                <Card title="账户安全设置" bordered={false} className="shadow-lg">
                    <Typography.Text type="secondary" className="block mb-6 text-center">
                        当前账号: {currentUser.userAccount}
                    </Typography.Text>

                    <LoginForm
                        submitter={{
                            searchConfig: {
                                submitText: "确认修改",
                            },
                        }}
                        onFinish={handleSubmit}
                    >
                         <ProFormText
                            fieldProps={{
                                size: "large",
                                prefix: <MailOutlined className={"prefixIcon"} />,
                                value: newEmail,
                                onChange: (e) => setNewEmail(e.target.value),
                            }}
                            placeholder={"新邮箱（仅修改邮箱时填写）"}
                            name="newEmail"
                        />
                        
                        <ProFormText.Password
                            name="newPassword"
                            fieldProps={{
                                size: "large",
                                prefix: <LockOutlined className={"prefixIcon"} />,
                                strengthText:
                                    "Password should contain numbers, letters and special characters, at least 8 characters long.",
                            }}
                            placeholder={"新密码（仅修改密码时填写）"}
                            rules={[
                                {
                                    min: 8,
                                    message: "密码至少8位",
                                }
                            ]}
                        />
                        <ProFormText.Password
                            name="checkPassword"
                            fieldProps={{
                                size: "large",
                                prefix: <LockOutlined className={"prefixIcon"} />,
                            }}
                            placeholder={"确认新密码"}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (!value || !getFieldValue('newPassword') || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(new Error('两次输入的密码不一致!'));
                                    },
                                }),
                            ]}
                        />

                        <ProFormText
                            name="emailCode"
                            fieldProps={{
                                size: "large",
                                prefix: (
                                    <SafetyCertificateOutlined className={"prefixIcon"} />
                                ),
                                addonAfter: (
                                    <Button 
                                        type="link" 
                                        disabled={countdown > 0 || sending} 
                                        onClick={handleSendCode}
                                        style={{ padding: '0 8px' }}
                                    >
                                        {countdown > 0 ? `${countdown}秒后重新发送` : (sending ? "发送中..." : "发送验证码")}
                                    </Button>
                                )
                            }}
                            placeholder={"验证码（必填）"}
                            rules={[
                                {
                                    required: true,
                                    message: "请输入验证码！",
                                },
                                {
                                    len: 6,
                                    message: "验证码长度为6位",
                                }
                            ]}
                        />
                    </LoginForm>
                </Card>
            </div>
        </ProConfigProvider>
    )
}

export default UserSettings
