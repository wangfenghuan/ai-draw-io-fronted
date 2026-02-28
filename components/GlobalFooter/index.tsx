"use client"
import { GithubOutlined } from "@ant-design/icons"
import { useTranslations } from "next-intl"
import type React from "react"

const GlobalFooter: React.FC = () => {
    const t = useTranslations("footer")
    const year = new Date().getFullYear()

    return (
        <div
            style={{
                textAlign: "center",
                padding: "12px 0",
                color: "rgba(0, 0, 0, 0.45)",
                background: "transparent",
                fontSize: "12px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "24px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    {t("copyright", { year })}
                </div>
                <div>
                    <a
                        href="https://github.com/wangfenghuan"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            color: "rgba(0, 0, 0, 0.45)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            transition: "color 0.3s",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color =
                                "rgba(0, 0, 0, 0.85)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                                "rgba(0, 0, 0, 0.45)")
                        }
                    >
                        <GithubOutlined /> {t("developer")}
                    </a>
                </div>
                <div>
                    <a
                        href="https://beian.miit.gov.cn/"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            color: "rgba(0, 0, 0, 0.45)",
                            textDecoration: "none",
                        }}
                    >
                        冀ICP备2026004927号
                    </a>
                </div>
            </div>
        </div>
    )
}

export default GlobalFooter
