"use client"
import {
    GithubFilled,
    LogoutOutlined,
    PlusCircleFilled,
    SearchOutlined,
} from "@ant-design/icons"
import { ProLayout } from "@ant-design/pro-components"
import { App, Dropdown, Input, theme } from "antd"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"
import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getAccessibleMenus } from "@/access/menuAccess"
import { userLogout } from "@/api/userController"
import GlobalFooter from "@/components/GlobalFooter"
import menus from "@/config/menu"
import { DefauleUser } from "@/constants/UserState"
import type { AppDispatch, RootState } from "@/stores"
import { setLoginUser } from "@/stores/loginUser"

const SearchInput = () => {
    const { token } = theme.useToken()
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginInlineEnd: 24,
            }}
        >
            <Input
                style={{
                    borderRadius: 4,
                    marginInlineEnd: 12,
                    backgroundColor: token.colorBgTextHover,
                }}
                prefix={<SearchOutlined />}
                placeholder="搜索方案"
                variant="borderless"
            />
            <PlusCircleFilled
                style={{
                    color: token.colorPrimary,
                    fontSize: 24,
                    cursor: "pointer",
                }}
            />
        </div>
    )
}

interface Props {
    children: React.ReactNode
}

export default function BasicLayout({ children }: Props) {
    const { message } = App.useApp()
    const pathName = usePathname()
    const loginUser = useSelector((state: RootState) => state.loginUser)
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()

    const logout = useCallback(async () => {
        try {
            const res = await userLogout()
            if (res.data.code === 0) {
                message.success("账号已经退出")
                dispatch(setLoginUser(DefauleUser))
                router.push("/user/login")
            }
        } catch (_e) {
            message.error("退出失败")
        }
    }, [dispatch, router, message])

    return (
        <div
            id="basiclayout"
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <ProLayout
                title="智能协同云画图"
                logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
                layout="top"
                location={{
                    pathname: pathName,
                }}
                // 核心：强制 ProLayout 内部容器撑满高度
                style={{
                    minHeight: "100vh",
                }}
                // 核心：内容区样式，确保 flex 布局
                contentStyle={{
                    display: "flex",
                    flexDirection: "column",
                    paddingBlockEnd: 0, // 移除默认内边距以免干扰 footer
                }}
                avatarProps={{
                    src:
                        loginUser.userAvatar ||
                        "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
                    size: "small",
                    title: loginUser.userName || "用户",
                    render: (_props, dom) => (
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: "logout",
                                        icon: <LogoutOutlined />,
                                        label: "退出登录",
                                    },
                                ],
                                onClick: async ({ key }) => {
                                    if (key === "logout") await logout()
                                },
                            }}
                        >
                            {dom}
                        </Dropdown>
                    ),
                }}
                actionsRender={(props) => {
                    if (props.isMobile) return []
                    return [
                        <SearchInput key="search" />,
                        <a
                            key="github"
                            href="https://github.com/wangfenghuan"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <GithubFilled
                                style={{ fontSize: 20, color: "#666" }}
                            />
                        </a>,
                    ]
                }}
                headerTitleRender={(logo, title) => (
                    <Link href="/">
                        {logo}
                        {title}
                    </Link>
                )}
                menuDataRender={() => getAccessibleMenus(loginUser, menus)}
                menuItemRender={(item, dom) => (
                    <Link href={item.path || "/"} target={item.target}>
                        {dom}
                    </Link>
                )}
                // 注入全局 Footer
                footerRender={() => <GlobalFooter />}
            >
                {/* 核心：flex: 1 会自动占据所有剩余空间，
                  从而将底部的 footer 推到页面最下方
                */}
                <div
                    style={{
                        flex: 1,
                        // 检测是否是图表编辑页面，如果是则移除 padding
                        padding: pathName.startsWith("/diagram/edit/")
                            ? "0"
                            : "24px",
                        // 图表编辑页面需要完全弹性占满
                        ...(pathName.startsWith("/diagram/edit/")
                            ? {
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  overflow: "hidden",
                              }
                            : {}),
                    }}
                >
                    {children}
                </div>
            </ProLayout>
        </div>
    )
}
