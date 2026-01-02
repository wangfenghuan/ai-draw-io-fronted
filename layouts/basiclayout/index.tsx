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

    // 判断是否是图表编辑页面
    const isEditorPage = pathName.startsWith("/diagram/edit/")

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
                overflow: "hidden", // 外层保持 hidden，防止双重滚动条
            }}
        >
            <ProLayout
                title="智能协同云画图"
                logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
                layout="top"
                location={{
                    pathname: pathName,
                }}
                style={{
                    height: "100vh",
                }}
                // --- 修复重点 1：contentStyle ---
                contentStyle={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    // 编辑页：0 padding，隐藏溢出
                    // 普通页：保留 padding，允许 Y 轴滚动 (overflowY: "auto")
                    padding: isEditorPage ? 0 : 24,
                    overflowY: isEditorPage ? "hidden" : "auto",
                    overflowX: "hidden",
                    height: "100%", // 让内容区撑满剩余高度，从而让滚动条出现在内容区内部
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
                // 编辑页不需要 Footer，普通页显示小 Footer
                footerRender={() => (isEditorPage ? null : <GlobalFooter />)}
            >
                {/* --- 修复重点 2：子容器 Wrapper --- */}
                <div
                    style={{
                        width: "100%",
                        // 编辑页：强制占满高度，隐藏溢出（因为编辑器内部有滚动条）
                        // 普通页：不需要 height: 100%，让内容自然撑开；也不要 overflow: hidden
                        ...(isEditorPage
                            ? {
                                  height: "100%",
                                  overflow: "hidden",
                                  display: "flex",
                                  flexDirection: "column",
                              }
                            : {
                                  // 普通页面模式：不做限制，让内容自然生长
                                  minHeight: "100%", // 确保至少撑满一屏
                              }),
                    }}
                >
                    {children}
                </div>
            </ProLayout>
        </div>
    )
}
