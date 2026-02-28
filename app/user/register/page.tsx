"use client"
import {
    GithubOutlined,
    LockOutlined,
    MailOutlined,
    UserOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons"
import {
    LoginForm,
    ProConfigProvider,
    ProFormText,
} from "@ant-design/pro-components"
import { ProForm } from "@ant-design/pro-form/lib"
import { App, Button } from "antd"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState, useEffect } from "react"
import { sendRegisterCode, userRegister } from "@/api/userController"

const UserRegister: React.FC = () => {
    const { message } = App.useApp()
    const t = useTranslations("user")
    const tApp = useTranslations("app")
    const [form] = ProForm.useForm()
    const router = useRouter()
    
    // Countdown state
    const [countdown, setCountdown] = useState(0)
    const [sending, setSending] = useState(false)

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

    const handleSendCode = async () => {
        try {
            const email = form.getFieldValue("userAccount")
            if (!email) {
                message.error(t("enterEmailFirst"))
                return
            }
            // Basic email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                message.error(t("enterValidEmail"))
                return
            }

            setSending(true)
            const res = await sendRegisterCode({ userAccount: email })
            if (res.code === 0) {
                message.success(t("codeSent"))
                setCountdown(60)
            } else {
                message.error(res.message || t("sendFailed"))
            }
        } catch (error) {
            message.error(t("sendFailedLater"))
        } finally {
            setSending(false)
        }
    }

    const submit = async (values: API.UserRegisterRequest) => {
        try {
            const res = await userRegister(values)
            if (res.code === 0) {
                message.success(t("registerSuccess"))
                router.replace("/user/login")
            } else {
                message.error(res.message || t("registerFailed"))
            }
        } catch (_e) {
            message.error(t("registerFailed"))
        }
    }

    const handleGithubLogin = () => {
        const isDev = process.env.NODE_ENV === "development"
        const baseURL = "/api"
        window.location.href = `${baseURL}/oauth2/authorization/github`
    }

    return (
        <ProConfigProvider hashed={false}>
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #f9f0ff 100%)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Decorative background blurs */}
                <div style={{ position: "absolute", top: "15%", left: "10%", width: 400, height: 400, background: "rgba(22, 119, 255, 0.1)", filter: "blur(80px)", borderRadius: "50%", zIndex: 0 }} />
                <div style={{ position: "absolute", bottom: "10%", right: "20%", width: 400, height: 400, background: "rgba(114, 46, 209, 0.1)", filter: "blur(80px)", borderRadius: "50%", zIndex: 0 }} />
                
                <div style={{
                    width: "100%", maxWidth: 440, zIndex: 1, padding: "20px",
                    background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)",
                    borderRadius: 24, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
                    border: "1px solid rgba(255,255,255,0.8)",
                    maxHeight: "95vh", overflowY: "auto"
                }}>
                    <LoginForm
                        submitter={{
                            searchConfig: {
                                submitText: t("registerAccount"),
                            },
                        }}
                        form={form}
                        onFinish={submit}
                        logo="https://github.githubassets.com/favicons/favicon.png"
                        title="IntelliDraw"
                        subTitle={<span style={{ fontWeight: 500, color: "#1677ff" }}>{t("openInfinitePossibilities")}</span>}
                        contentStyle={{ padding: "0 20px" }}
                        actions={
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                    height: 40,
                                    width: 40,
                                    border: "1px solid #D4D8DD",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                }}
                                onClick={handleGithubLogin}
                            >
                                <GithubOutlined
                                    style={{
                                        fontSize: 24,
                                        color: "#1677ff",
                                    }}
                                />
                            </div>
                        </div>
                    }
                >
                    <ProFormText
                        name="userAccount"
                        fieldProps={{
                            size: "large",
                            prefix: <MailOutlined className={"prefixIcon"} />,
                        }}
                        placeholder={t("enterEmail")}
                        rules={[
                            {
                                required: true,
                                message: t("enterEmail"),
                            },
                            {
                                type: "email",
                                message: t("enterValidEmail"),
                            },
                        ]}
                    />
                    <ProFormText
                        name="userName"
                        fieldProps={{
                            size: "large",
                            prefix: <UserOutlined className={"prefixIcon"} />,
                        }}
                        placeholder={t("enterUsername")}
                        rules={[
                            {
                                required: true,
                                message: t("enterUsernameRequired"),
                            },
                        ]}
                    />
                    <ProFormText.Password
                        name="userPassword"
                        fieldProps={{
                            size: "large",
                            prefix: <LockOutlined className={"prefixIcon"} />,
                            strengthText:
                                "Password should contain numbers, letters and special characters, at least 8 characters long.",
                        }}
                        placeholder={t("enterPassword")}
                        rules={[
                            {
                                required: true,
                                message: t("enterPassword"),
                            },
                            {
                                min: 8,
                                message: t("passwordMinLength"),
                            }
                        ]}
                    />
                    <ProFormText.Password
                        name="checkPassword"
                        fieldProps={{
                            size: "large",
                            prefix: <LockOutlined className={"prefixIcon"} />,
                        }}
                        placeholder={t("confirmPassword")}
                        rules={[
                            {
                                required: true,
                                message: t("confirmPasswordRequired"),
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (!value || getFieldValue('userPassword') === value) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error(t("passwordNotMatch")));
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
                                    {countdown > 0 ? `${countdown}${t("resendAfter")}` : (sending ? t("sending") : t("sendCode"))}
                                </Button>
                            )
                        }}
                        placeholder={t("enterEmailCode")}
                        rules={[
                            {
                                required: true,
                                message: t("enterCodeRequired"),
                            },
                            {
                                len: 6,
                                message: t("codeLength"),
                            }
                        ]}
                    />
                    
                    <div
                        style={{
                            marginBlockEnd: 24,
                            textAlign: "end",
                        }}
                    >
                        <Link href={"/user/login"}>{t("goToLogin")}</Link>
                    </div>
                </LoginForm>
                </div>
            </div>
        </ProConfigProvider>
    )
}

export default UserRegister
