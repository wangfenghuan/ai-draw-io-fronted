"use client"

import { App, Form, Input, Modal, Select, Space } from "antd"
import { useEffect, useState } from "react"
import { addDiagram } from "@/api/diagramController"
import { listMySpaceVoByPage, listSpaceLevel } from "@/api/spaceController"

const { Option } = Select

interface CreateDiagramDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (diagramId: string | number) => void
    initialName?: string
    initialDiagramCode?: string
}

export function CreateDiagramDialog({
    open,
    onOpenChange,
    onSuccess,
    initialName,
    initialDiagramCode,
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
            loadSpaceLevels()
            form.resetFields()
            // 默认不选择空间（公共图库）
            form.setFieldValue("spaceId", "none")
            // Apply initial name if provided
            if (initialName) {
                form.setFieldValue("name", initialName)
            }
        }
    }, [open, form, initialName])

    const loadSpaces = async () => {
        setSpacesLoading(true)
        try {
            console.log("[创建图表] 开始获取空间列表...")
            // Fix: Cast response to match runtime behavior
            const response = (await listMySpaceVoByPage({
                current: 1,
                pageSize: 20, // 每页最多20条（接口限制）
                sortField: "createTime",
                sortOrder: "desc",
            })) as unknown as API.BaseResponsePageSpaceVO

            console.log("[创建图表] 空间列表响应:", response)

            if (response?.code === 0 && response?.data) {
                const records = response.data.records || []
                console.log("[创建图表] 获取到空间数量:", records.length)
                console.log("[创建图表] 空间列表详情:", records)
                setSpaces(records)
            } else {
                console.error("[创建图表] 获取空间列表失败:", response?.message)
            }
        } catch (error) {
            console.error("[创建图表] 获取空间列表异常:", error)
        } finally {
            setSpacesLoading(false)
        }
    }

    const loadSpaceLevels = async () => {
        setSpaceLevelsLoading(true)
        try {
            const response =
                (await listSpaceLevel()) as unknown as API.BaseResponseListSpaceLevel
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

            const response = (await addDiagram({
                name: values.name || "未命名图表",
                diagramCode: initialDiagramCode || "",
                pictureUrl: "",
                spaceId: values.spaceId === "none" ? undefined : values.spaceId,
            })) as unknown as API.BaseResponseLong

            if (response?.code === 0 && response.data) {
                message.success("图表创建成功！")
                form.resetFields()
                onOpenChange(false)
                onSuccess?.(response.data)
            } else {
                message.error(response?.message || "创建失败")
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
                    label="图表名称"
                    name="name"
                    rules={[
                        { required: true, message: "请输入图表名称" },
                        { max: 50, message: "图表名称最多50个字符" },
                    ]}
                    tooltip="给您的图表起一个易于识别的名称"
                >
                    <Input
                        placeholder="请输入图表名称"
                        maxLength={50}
                        showCount
                        allowClear
                    />
                </Form.Item>

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
                                space.maxCount && Number(space.maxCount) > 0
                                    ? Math.round(
                                          (Number(space.totalCount || 0) /
                                              Number(space.maxCount)) *
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
