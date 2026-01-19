"use client"

import { App, Form, Input, Modal, Radio, Select, Space } from "antd"
import { useEffect, useState } from "react"
import { addSpace, listSpaceLevel } from "@/api/spaceController"

const { Option } = Select

interface CreateSpaceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

// 空间类型枚举
enum SpaceType {
    PERSONAL = 0, // 个人空间
    TEAM = 1, // 团队空间
}

export function CreateSpaceDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateSpaceDialogProps) {
    const { message } = App.useApp()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [spaceLevels, setSpaceLevels] = useState<API.SpaceLevel[]>([])
    const [spaceType, setSpaceType] = useState<SpaceType>(SpaceType.PERSONAL)

    useEffect(() => {
        if (open) {
            loadSpaceLevels()
            form.resetFields()
            // 默认选择个人空间
            setSpaceType(SpaceType.PERSONAL)
            form.setFieldValue("spaceType", SpaceType.PERSONAL)
        }
    }, [open, form])

    const loadSpaceLevels = async () => {
        try {
            const response = await listSpaceLevel()
            if (response?.code === 0 && response?.data) {
                setSpaceLevels(response.data)
                // 默认选择普通版
                form.setFieldValue("spaceLevel", 0)
            }
        } catch (error) {
            console.error("获取空间级别失败:", error)
            message.error("获取空间级别失败")
        }
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            setLoading(true)

            const response = await addSpace({
                spaceName: values.spaceName,
                spaceLevel: values.spaceLevel,
                spaceType: values.spaceType,
            })

            if (response?.code === 0) {
                message.success("创建成功")
                form.resetFields()
                onOpenChange(false)
                onSuccess?.()
            } else {
                message.error("创建失败：" + (response?.message || "未知错误"))
            }
        } catch (error: any) {
            if (error.errorFields) {
                // 表单验证错误
                return
            }
            console.error("创建空间失败:", error)
            message.error("创建失败，请稍后重试")
        } finally {
            setLoading(false)
        }
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / k ** i) * 100) / 100 + " " + sizes[i]
    }

    return (
        <Modal
            title="创建空间"
            open={open}
            onOk={handleSubmit}
            onCancel={() => onOpenChange(false)}
            okText="创建"
            cancelText="取消"
            confirmLoading={loading}
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: "24px" }}
                autoComplete="off"
            >
                <Form.Item
                    label="空间名称"
                    name="spaceName"
                    rules={[
                        { required: true, message: "请输入空间名称" },
                        { max: 50, message: "空间名称最多50个字符" },
                    ]}
                >
                    <Input placeholder="例如：我的设计空间" />
                </Form.Item>

                <Form.Item
                    label="空间类型"
                    name="spaceType"
                    rules={[{ required: true, message: "请选择空间类型" }]}
                    initialValue={SpaceType.PERSONAL}
                >
                    <Radio.Group
                        onChange={(e) => setSpaceType(e.target.value)}
                        style={{ width: "100%" }}
                    >
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Radio value={SpaceType.PERSONAL}>
                                <Space>
                                    <span>个人空间</span>
                                    <span
                                        style={{
                                            color: "#999",
                                            fontSize: "12px",
                                        }}
                                    >
                                        仅供个人使用
                                    </span>
                                </Space>
                            </Radio>
                            <Radio value={SpaceType.TEAM}>
                                <Space>
                                    <span>团队空间</span>
                                    <span
                                        style={{
                                            color: "#999",
                                            fontSize: "12px",
                                        }}
                                    >
                                        可邀请团队成员协作
                                    </span>
                                </Space>
                            </Radio>
                        </Space>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    label="空间级别"
                    name="spaceLevel"
                    rules={[{ required: true, message: "请选择空间级别" }]}
                    tooltip="不同级别有不同的额度和限制"
                >
                    <Select placeholder="请选择空间级别" size="large">
                        {spaceLevels.map((level) => (
                            <Option key={level.value} value={level.value}>
                                <Space
                                    size="middle"
                                    style={{
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span style={{ fontWeight: 500 }}>
                                        {level.text}
                                    </span>
                                    <span
                                        style={{
                                            color: "#999",
                                            fontSize: "12px",
                                        }}
                                    >
                                        {level.maxCount}个图表 /{" "}
                                        {formatBytes(level.maxSize!)}
                                    </span>
                                </Space>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <div
                    style={{
                        background: "#f5f5f5",
                        padding: "16px",
                        borderRadius: "8px",
                        fontSize: "14px",
                    }}
                >
                    <div style={{ fontWeight: 500, marginBottom: "8px" }}>
                        空间级别说明：
                    </div>
                    <ul
                        style={{
                            margin: 0,
                            paddingLeft: "20px",
                            color: "#666",
                        }}
                    >
                        <li>普通版：100个图表 / 100MB存储</li>
                        <li>专业版：1000个图表 / 1GB存储</li>
                        <li>旗舰版：10000个图表 / 10GB存储</li>
                    </ul>
                </div>
            </Form>
        </Modal>
    )
}
