"use client"

import { GlobalOutlined } from "@ant-design/icons"
import { Button, Dropdown } from "antd"
import type React from "react"
import { useCallback, useState } from "react"
import { useLocale, useTranslations } from "next-intl"

interface LanguageSwitcherProps {
    style?: React.CSSProperties
}

export function LanguageSwitcher({ style }: LanguageSwitcherProps) {
    const t = useTranslations("language")
    const locale = useLocale()
    const [isLoading, setIsLoading] = useState(false)

    const switchLanguage = useCallback(async (newLocale: string) => {
        if (isLoading) return
        
        setIsLoading(true)
        try {
            const response = await fetch("/api/locale", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ locale: newLocale }),
            })

            if (response.ok) {
                // 使用硬刷新确保服务器重新获取 cookie
                window.location.href = window.location.pathname + window.location.search
            }
        } catch (error) {
            console.error("Failed to switch language:", error)
        } finally {
            setIsLoading(false)
        }
    }, [isLoading])

    const menuItems = [
        {
            key: "zh",
            label: t("zh"),
            onClick: () => switchLanguage("zh"),
        },
        {
            key: "en",
            label: t("en"),
            onClick: () => switchLanguage("en"),
        },
    ]

    return (
        <Dropdown menu={{ items: menuItems, selectedKeys: [locale] }} trigger={["click"]}>
            <Button
                type="text"
                icon={<GlobalOutlined style={{ fontSize: 18 }} />}
                style={{ color: "#666", ...style }}
                title={t("switch")}
                loading={isLoading}
            />
        </Dropdown>
    )
}
