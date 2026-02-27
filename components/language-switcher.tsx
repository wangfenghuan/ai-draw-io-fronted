"use client"

import { GlobalOutlined } from "@ant-design/icons"
import { Button, Dropdown } from "antd"
import type React from "react"
import { useCallback } from "react"
import { useLocale, useTranslations } from "next-intl"

interface LanguageSwitcherProps {
    style?: React.CSSProperties
}

export function LanguageSwitcher({ style }: LanguageSwitcherProps) {
    const t = useTranslations("language")
    const locale = useLocale()

    const switchLanguage = useCallback(async (newLocale: string) => {
        try {
            const response = await fetch("/api/locale", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ locale: newLocale }),
            })

            if (response.ok) {
                // 刷新页面以应用新语言
                window.location.reload()
            }
        } catch (error) {
            console.error("Failed to switch language:", error)
        }
    }, [])

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
            />
        </Dropdown>
    )
}