"use client"
import { GithubOutlined } from "@ant-design/icons"
import type React from "react"

const GlobalFooter: React.FC = () => {
    return (
        <div
            style={{
                textAlign: "center",
                padding: "24px 0",
                color: "rgba(0, 0, 0, 0.45)",
                background: "transparent",
                borderTop: "1px solid rgba(0, 0, 0, 0.06)",
            }}
        >
            <div style={{ marginBottom: 8 }}>
                © {new Date().getFullYear()} 智能协同云画图 | 让架构设计更简单
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
                    }}
                >
                    <GithubOutlined /> 程序员 wfh
                </a>
            </div>
        </div>
    )
}

export default GlobalFooter
