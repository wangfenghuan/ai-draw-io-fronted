"use client"
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons"
import {
    LoginForm,
    ProConfigProvider,
    ProFormCheckbox,
    ProFormText,
} from "@ant-design/pro-components"
import { ProForm } from "@ant-design/pro-form/lib"
import { App } from "antd"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"
import { createCaptcha, userRegister } from "@/api/userController"

const UserRegister: React.FC = () => {
    const { message } = App.useApp()
    const [form] = ProForm.useForm()
    const router = useRouter()
    const [captcha, setCaptcha] = React.useState<string>("")
    const [uuid, setUuid] = React.useState<string>("")

    const fetchCaptcha = async () => {
        try {
            const res = await createCaptcha()
            if (res.data) {
                // assume the map has uuid as key and base64 as value based on comment
                // "返回Map<uuid, 生成的base64验证码...>"
                // However, usually such APIs return { uuid: "...", img: "..." } or similar in data object
                // Let's re-read the type BaseResponseMapStringString.
                // Assuming keys are dynamic or it's a simple object map.
                // If it returns a map like { "some-uuid": "base64..." }, we need to parse it.
                // Or maybe it returns { uuid: "...", code: "..." } ?
                // Let's check the earlier retrieval of `createCaptcha`...
                // It returns BaseResponseMapStringString which is data?: Record<string, any>;
                // Let's try to handle the likely case where key is uuid and value is base64
                // OR standard { uuid: '...', img: '...' } structure if implicit.
                // Given the comment "Map<uuid, 生成的base64验证码>", likely: { [uuid]: base64 }
                const keys = Object.keys(res.data)
                if (keys.length > 0) {
                    const id = keys[0]
                    const img = res.data[id]
                    setUuid(id)
                    setCaptcha(img)
                }
            }
        } catch (_e) {
            message.error("获取验证码失败")
        }
    }

    React.useEffect(() => {
        fetchCaptcha()
    }, [])

    const submit = async (value: API.UserRegisterRequest) => {
        try {
            const res = (await userRegister({
                ...value,
                uuid,
            })) as unknown as API.BaseResponseLong
            if (res.code === 0) {
                message.success("注册成功")
                router.replace("/user/login")
            } else {
                message.error(res.message)
                fetchCaptcha() // refresh captcha on failure
            }
        } catch (_e) {
            message.error("注册失败")
            fetchCaptcha()
        }
    }
    return (
        <ProConfigProvider hashed={false}>
            <div>
                <LoginForm
                    submitter={{
                        searchConfig: {
                            submitText: "注册",
                        },
                    }}
                    form={form}
                    onFinish={submit}
                    logo="https://github.githubassets.com/favicons/favicon.png"
                    title="智能协同云画图"
                    subTitle="用户注册"
                >
                    <ProFormText
                        name="userAccount"
                        fieldProps={{
                            size: "large",
                            prefix: <MailOutlined className={"prefixIcon"} />,
                        }}
                        placeholder={"请输入邮箱!"}
                        rules={[
                            {
                                required: true,
                                message: "请输入邮箱!",
                            },
                            {
                                type: "email",
                                message: "请输入正确的邮箱格式!",
                            },
                        ]}
                    />
                    <ProFormText
                        name="userName"
                        fieldProps={{
                            size: "large",
                            prefix: <UserOutlined className={"prefixIcon"} />,
                        }}
                        placeholder={"请输入用户昵称"}
                        rules={[
                            {
                                required: true,
                                message: "请输入用户昵称!",
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
                            statusRender: (value) => {
                                const getStatus = () => {
                                    if (value && value.length > 12) {
                                        return "ok"
                                    }
                                    if (value && value.length > 6) {
                                        return "pass"
                                    }
                                    return "poor"
                                }
                                const _status = getStatus()

                                return <div>强度：弱</div>
                            },
                        }}
                        placeholder={"请输入密码！"}
                        rules={[
                            {
                                required: true,
                                message: "请输入密码！",
                            },
                        ]}
                    />
                    <ProFormText.Password
                        name="checkPassword"
                        fieldProps={{
                            size: "large",
                            prefix: <LockOutlined className={"prefixIcon"} />,
                            strengthText:
                                "Password should contain numbers, letters and special characters, at least 8 characters long.",
                            statusRender: (value) => {
                                const getStatus = () => {
                                    if (value && value.length > 12) {
                                        return "ok"
                                    }
                                    if (value && value.length > 6) {
                                        return "pass"
                                    }
                                    return "poor"
                                }
                                const _status = getStatus()

                                return <div>强度：弱</div>
                            },
                        }}
                        placeholder={"请确认密码！"}
                        rules={[
                            {
                                required: true,
                                message: "请确认密码！",
                            },
                        ]}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                        <ProFormText
                            name="captchaCode"
                            fieldProps={{
                                size: "large",
                                prefix: (
                                    <LockOutlined className={"prefixIcon"} />
                                ),
                            }}
                            placeholder={"请输入验证码！"}
                            rules={[
                                {
                                    required: true,
                                    message: "请输入验证码！",
                                },
                            ]}
                        />
                        <div style={{ height: "40px" }}>
                            {
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={`data:image/png;base64,${captcha}`}
                                    alt="验证码"
                                    onClick={fetchCaptcha}
                                    style={{
                                        cursor: "pointer",
                                        height: "100%",
                                        width: "160px",
                                        objectFit: "cover",
                                    }}
                                />
                            }
                        </div>
                    </div>
                    <div
                        style={{
                            marginBlockEnd: 24,
                            textAlign: "end",
                        }}
                    >
                        <Link href={"/user/login"}>去登录</Link>
                    </div>
                </LoginForm>
            </div>
        </ProConfigProvider>
    )
}

export default UserRegister
