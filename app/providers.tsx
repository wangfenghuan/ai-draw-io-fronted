"use client"

import { AntdRegistry } from "@ant-design/nextjs-registry"
import { App as AntdApp, ConfigProvider } from "antd"
import zhCN from "antd/locale/zh_CN"
import enUS from "antd/locale/en_US"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import React, { useCallback, useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import AccessLayout from "@/access/AccessLayout"
import { getLoginUser } from "@/api/userController"
import { GlobalAnnouncementPopup } from "@/components/GlobalAnnouncementPopup"
import { DiagramProvider } from "@/contexts/diagram-context"
import BasicLayout from "@/layouts/basiclayout"
import store, { type AppDispatch } from "@/stores"
import { setLoginUser } from "@/stores/loginUser"

/**
 * 全局初始化组件：负责获取登录用户信息
 */
const InitLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>()
    const [isInitialized, setIsInitialized] = React.useState(false)

    const doInitLoginUser = useCallback(async () => {
        // 1. 检查 URL 中是否有 token (GitHub 登录回调)
        const params = new URLSearchParams(window.location.search)
        const token = params.get("token")
        if (token) {
            localStorage.setItem("token", token)
            // 清除 URL 中的 token 参数，保持美观
            const newUrl = window.location.pathname + window.location.hash
            window.history.replaceState({}, document.title, newUrl)
        }

        const currentPath = window.location.pathname
        // 先判断是否是公开页面，如果是，打印日志并注意不要误拦截
        const isPublic =
            currentPath === "/" ||
            currentPath.startsWith("/demo") ||
            currentPath.startsWith("/templates") ||
            currentPath.startsWith("/solutions") || // Also add solutions for SEO page
            currentPath.startsWith("/wiki") ||      // Also add wiki for SEO page
            currentPath.startsWith("/diagram-marketplace") ||
            currentPath.startsWith("/user/") ||
            currentPath.includes("sitemap.xml") ||
            currentPath.includes("robots.txt") ||
            currentPath.includes("manifest") ||
            currentPath.includes("favicon")

        try {
            const res = await getLoginUser()
            if (res.code === 0 && res.data) {
                // 登录成功，保存用户信息
                dispatch(setLoginUser(res.data))
            } else {
                // 未登录或登录失效
                // dispatch(
                //    setLoginUser({ userName: "未登录", userRole: "notLogin" }),
                // )

                // 只有非公开页面才跳转
                if (!isPublic && !currentPath.includes("/user/login")) {
                    window.location.href = `/user/login?redirect=${encodeURIComponent(currentPath + window.location.search)}`
                } else {
                    // 公开页面，记录为未登录即可
                    dispatch(
                        setLoginUser({
                            userName: "未登录",
                            userRole: "notLogin",
                        }),
                    )
                }
            }
        } catch (_error) {
            // console.error("初始化用户信息失败", error)
            dispatch(setLoginUser({ userName: "未登录", userRole: "notLogin" }))

            if (!isPublic && !currentPath.includes("/user/login")) {
                window.location.href = `/user/login?redirect=${encodeURIComponent(currentPath + window.location.search)}`
            }
        } finally {
            setIsInitialized(true)
        }
    }, [dispatch])

    useEffect(() => {
        doInitLoginUser()
    }, [doInitLoginUser])

    // 等待初始化完成再渲染子组件
    if (!isInitialized) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f5f5f5",
                }}
            >
                <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-600 rounded-full" />
            </div>
        )
    }

    return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AntdRegistry>
            <ConfigProvider
                locale={zhCN}
                theme={{
                    token: {
                        colorPrimary: "#1677ff",
                        colorInfo: "#1677ff",
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    },
                }}
            >
                <AntdApp>
                    <Provider store={store}>
                        <InitLayout>
                            <BasicLayout>
                                <AccessLayout>
                                    <DiagramProvider>
                                        {children}
                                    </DiagramProvider>
                                </AccessLayout>
                                <GlobalAnnouncementPopup />
                            </BasicLayout>
                        </InitLayout>
                    </Provider>
                </AntdApp>
            </ConfigProvider>
        </AntdRegistry>
    )
}

// 服务端组件包装器
export function IntlProvider({ 
    children, 
    locale, 
    messages 
}: { 
    children: React.ReactNode
    locale: string
    messages: Record<string, unknown>
}) {
    // 动态选择 antd locale
    const antdLocale = locale === "en" ? enUS : zhCN
    
    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <AntdRegistry>
                <ConfigProvider
                    locale={antdLocale}
                    theme={{
                        token: {
                            colorPrimary: "#1677ff",
                            colorInfo: "#1677ff",
                            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                        },
                    }}
                >
                    <AntdApp>
                        <Provider store={store}>
                            <InitLayout>
                                <BasicLayout>
                                    <AccessLayout>
                                        <DiagramProvider>
                                            {children}
                                        </DiagramProvider>
                                    </AccessLayout>
                                    <GlobalAnnouncementPopup />
                                </BasicLayout>
                            </InitLayout>
                        </Provider>
                    </AntdApp>
                </ConfigProvider>
            </AntdRegistry>
        </NextIntlClientProvider>
    )
}
