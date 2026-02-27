"use client"

import { Modal } from "antd"
import { useEffect, useState } from "react"
import { listAnnouncementVoByPage } from "@/api/announcementController"

export const HomeAnnouncementDialog = () => {
    const [visible, setVisible] = useState(false)
    const [announcement, setAnnouncement] = useState<API.AnnouncementVO | null>(null)

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const res = await listAnnouncementVoByPage({
                    current: 1,
                    pageSize: 1,
                    sortField: "createTime",
                    sortOrder: "descend",
                })

                if (res.code === 0 && res.data?.records && res.data.records.length > 0) {
                    const latestAnnouncement = res.data.records[0]
                    
                    if (latestAnnouncement) {
                        setAnnouncement(latestAnnouncement)
                        setVisible(true)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch home announcement", error)
            }
        }
        
        fetchAnnouncement()
    }, [])

    const handleClose = () => {
        setVisible(false)
    }

    if (!announcement) {
        return null
    }

    return (
        <Modal
            title={
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                    系统公告
                </div>
            }
            open={visible}
            onCancel={handleClose}
            onOk={handleClose}
            okText="我知道了"
            cancelButtonProps={{ style: { display: "none" } }}
            centered
            maskClosable={false}
        >
            <div
                style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                    textAlign: "center",
                    color: "#1f1f1f",
                }}
            >
                {announcement.title}
            </div>
            <div
                style={{
                    whiteSpace: "pre-wrap",
                    maxHeight: "60vh",
                    overflowY: "auto",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    marginTop: "12px",
                    marginBottom: "12px",
                }}
            >
                {announcement.content}
            </div>
            <div
                style={{
                    textAlign: "right",
                    color: "#999",
                    fontSize: "12px",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: "12px",
                }}
            >
                发布时间:{" "}
                {new Date(announcement.createTime || "").toLocaleString()}
            </div>
        </Modal>
    )
}
