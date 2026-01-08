"use client"

import { App, Form, Modal, Select, Space } from "antd"
import { useEffect, useState } from "react"
import { addDiagram } from "@/api/diagramController"
import { listMySpaceVoByPage, listSpaceLevel } from "@/api/spaceController"

const { Option } = Select

interface CreateDiagramDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (diagramId: string | number) => void
}

export function CreateDiagramDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateDiagramDialogProps) {
    const { message } = App.useApp()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [spaces, setSpaces] = useState<API.SpaceVO[]>([])
    const [spacesLoading, setSpacesLoading] = useState(false)
    const [spaceLevels, setSpaceLevels] = useState<API.SpaceLevel[]>([])
    const [_spaceLevelsLoading, setSpaceLevelsLoading] = useState(false)

    useEffect(() => {
        if (open) {
            loadSpaces()
            loadSpaceLevels()
            form.resetFields()
            // 默认不选择空间（公共图库）
            form.setFieldValue("spaceId", "none")
        }
    }, [open, form])

    const loadSpaces = async () => {
        setSpacesLoading(true)
        try {
            const response = await listMySpaceVoByPage({
                current: 1,
                pageSize: 100, // 获取所有空间
                sortField: "createTime",
                sortOrder: "desc",
            })

            if (response?.code === 0 && response?.data) {
                setSpaces(response.data.records || [])
            }
        } catch (error) {
            console.error("获取空间列表失败:", error)
        } finally {
            setSpacesLoading(false)
        }
    }

    const loadSpaceLevels = async () => {
        setSpaceLevelsLoading(true)
        try {
            const response = await listSpaceLevel()
            if (response?.code === 0 && response?.data) {
                setSpaceLevels(response.data)
            }
        } catch (error) {
            console.error("获取空间级别失败:", error)
        } finally {
            setSpaceLevelsLoading(false)
        }
    }

    // 根据级别值获取级别信息
    const getSpaceLevelInfo = (level: number) => {
        return spaceLevels.find((item) => item.value === level)
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            setLoading(true)

            const response = await addDiagram({
                name: "未命名图表",
                diagramCode: "",
                pictureUrl: "",
                spaceId: values.spaceId === "none" ? undefined : values.spaceId,
            })

            if (response?.code === 0 && response.data) {
                message.success("图表创建成功！")
                form.resetFields()
                onOpenChange(false)
                onSuccess?.(response.data)
            } else {
                message.error("创建失败：" + (response?.message || "未知错误"))
            }
        } catch (error: any) {
            if (error.errorFields) {
                // 表单验证错误
                return
            }
            console.error("创建图表失败:", error)
            message.error("创建失败，请稍后重试")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title="创建图表"
            open={open}
            onOk={handleSubmit}
            onCancel={() => onOpenChange(false)}
            okText="创建"
            cancelText="取消"
            confirmLoading={loading}
            width={500}
        >
            <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
                <Form.Item
                    label="选择空间"
                    name="spaceId"
                    rules={[{ required: true, message: "请选择空间" }]}
                    tooltip={
                        "选择空间后，图表会计入空间的额度。公共图库不计入空间额度。"
                    }
                >
                    <Select
                        placeholder="请选择空间"
                        loading={spacesLoading}
                        showSearch
                        optionFilterProp="children"
                    >
                        <Option key="none" value="none">
                            <Space>
                                <span>📚</span>
                                <span>公共图库（不占用空间额度）</span>
                            </Space>
                        </Option>
                        {spaces.map((space) => {
                            const levelInfo = getSpaceLevelInfo(
                                space.spaceLevel || 0,
                            )

                            const countPercent =
                                space.maxCount && space.maxCount > 0
                                    ? Math.round(
                                          ((space.totalCount || 0) /
                                              space.maxCount) *
                                              100,
                                      )
                                    : 0

                            return (
                                <Option
                                    key={space.id}
                                    value={space.id}
                                    disabled={countPercent >= 100}
                                >
                                    <Space>
                                        <span>{space.spaceName}</span>
                                        {levelInfo && (
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#999",
                                                }}
                                            >
                                                [{levelInfo.text}]
                                            </span>
                                        )}
                                        {countPercent >= 100 ? (
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#ff4d4f",
                                                }}
                                            >
                                                （已满）
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#999",
                                                }}
                                            >
                                                ({space.totalCount || 0}/
                                                {space.maxCount || 0})
                                            </span>
                                        )}
                                    </Space>
                                </Option>
                            )
                        })}
                    </Select>
                </Form.Item>

                {spaces.length === 0 && !spacesLoading && (
                    <div
                        style={{
                            padding: "12px",
                            background: "#f0f5ff",
                            borderRadius: "4px",
                            fontSize: "13px",
                            color: "#666",
                        }}
                    >
                        💡
                        提示：您还没有创建空间，图表将保存到公共图库。如需私有空间，请先创建空间。
                    </div>
                )}
            </Form>
        </Modal>
    )
}
