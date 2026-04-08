"use client"

import {
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons"
import {
    App,
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    Modal,
    Popconfirm,
    Space,
    Table,
    Tabs,
    Tag,
} from "antd"
import type { ColumnsType } from "antd/es/table"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import {
    addAnnouncement,
    deleteAnnouncement,
    listAnnouncementVoByPage,
    updateAnnouncement,
} from "@/api/announcementController"

interface AnnouncementModalProps {
    visible: boolean
    onCancel: () => void
    onSubmit: (values: API.AnnouncementAddRequest) => Promise<void>
    initialValues?: API.AnnouncementVO
    loading: boolean
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    loading,
}) => {
    const [form] = Form.useForm()
    const [content, setContent] = useState("")
    const [activeTab, setActiveTab] = useState("edit")

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue(initialValues)
                setContent(initialValues.content || "")
            } else {
                form.resetFields()
                form.setFieldsValue({ priority: 1 })
                setContent("")
            }
            setActiveTab("edit")
        }
    }, [visible, initialValues, form])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            await onSubmit(values)
        } catch (_error) {
            // Form validation failed
        }
    }

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setContent(value)
        // 同步更新 Form 字段的值
        form.setFieldsValue({ content: value })
    }

    return (
        <Modal
            title={initialValues ? "编辑公告" : "新建公告"}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            destroyOnClose
            width={700}
        >
            <Form form={form} layout="vertical" preserve={false}>
                <Form.Item
                    name="title"
                    label="公告标题"
                    rules={[{ required: true, message: "请输入公告标题" }]}
                >
                    <Input placeholder="请输入公告标题" maxLength={100} />
                </Form.Item>
                <Form.Item
                    name="content"
                    label={
                        <span>
                            公告内容
                            <span
                                style={{
                                    color: "#999",
                                    fontWeight: "normal",
                                    fontSize: "12px",
                                    marginLeft: "8px",
                                }}
                            >
                                (支持 Markdown 格式，如
                                [链接文字](https://example.com))
                            </span>
                        </span>
                    }
                    rules={[{ required: true, message: "请输入公告内容" }]}
                    hidden
                >
                    <Input />
                </Form.Item>
                <div style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>
                        公告内容
                        <span
                            style={{
                                color: "#999",
                                fontWeight: "normal",
                                fontSize: "12px",
                                marginLeft: "8px",
                            }}
                        >
                            (支持 Markdown 格式，如
                            [链接文字](https://example.com))
                        </span>
                    </div>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        size="small"
                        items={[
                            {
                                key: "edit",
                                label: "编辑",
                                children: (
                                    <Input.TextArea
                                        placeholder="请输入公告内容，支持 Markdown 格式&#10;例如：点击 [这里](https://example.com) 查看详情"
                                        rows={6}
                                        maxLength={1000}
                                        showCount
                                        value={content}
                                        onChange={handleContentChange}
                                        status={!content ? "error" : undefined}
                                    />
                                ),
                            },
                            {
                                key: "preview",
                                label: (
                                    <span>
                                        <EyeOutlined
                                            style={{ marginRight: 4 }}
                                        />
                                        预览
                                    </span>
                                ),
                                children: (
                                    <div
                                        style={{
                                            minHeight: 150,
                                            maxHeight: 300,
                                            overflowY: "auto",
                                            padding: "12px",
                                            border: "1px solid #d9d9d9",
                                            borderRadius: "6px",
                                            background: "#fafafa",
                                        }}
                                    >
                                        {content ? (
                                            <ReactMarkdown
                                                components={{
                                                    a: ({ href, children }) => (
                                                        <a
                                                            href={href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                color: "#1677ff",
                                                                textDecoration:
                                                                    "underline",
                                                            }}
                                                        >
                                                            {children}
                                                        </a>
                                                    ),
                                                    p: ({ children }) => (
                                                        <p
                                                            style={{
                                                                marginBottom:
                                                                    "8px",
                                                            }}
                                                        >
                                                            {children}
                                                        </p>
                                                    ),
                                                }}
                                            >
                                                {content}
                                            </ReactMarkdown>
                                        ) : (
                                            <span style={{ color: "#999" }}>
                                                暂无内容，请先编辑
                                            </span>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                    />
                    {!content && (
                        <div
                            style={{
                                color: "#ff4d4f",
                                fontSize: 12,
                                marginTop: 4,
                            }}
                        >
                            请输入公告内容
                        </div>
                    )}
                </div>
                <Form.Item
                    name="priority"
                    label="优先级"
                    tooltip="优先级越高越靠前显示，0表示取消置顶或普通显示"
                    rules={[{ required: true, message: "请输入优先级" }]}
                >
                    <InputNumber
                        min={0}
                        max={999}
                        style={{ width: "100%" }}
                        placeholder="请输入优先级 (0-999)"
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export const AdminAnnouncementManagement = () => {
    const { message } = App.useApp()
    const [searchText, setSearchText] = useState("")
    const [announcements, setAnnouncements] = useState<API.AnnouncementVO[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    })

    const [modalVisible, setModalVisible] = useState(false)
    const [modalLoading, setModalLoading] = useState(false)
    const [editingAnnouncement, setEditingAnnouncement] = useState<
        API.AnnouncementVO | undefined
    >(undefined)

    const loadData = async (
        current = pagination.current,
        pageSize = pagination.pageSize,
    ) => {
        setLoading(true)
        try {
            const res = await listAnnouncementVoByPage({
                current,
                pageSize,
                title: searchText,
                sortField: "priority",
                sortOrder: "descend",
            })
            if (res.code === 0 && res.data) {
                setAnnouncements(res.data.records || [])
                setPagination({
                    current: Number(res.data.current) || 1,
                    pageSize: Number(res.data.size) || 10,
                    total: Number(res.data.total) || 0,
                })
            } else {
                message.error("加载公告列表失败")
            }
        } catch (_error) {
            message.error("加载公告列表失败，请稍后重试")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleSearch = () => {
        setPagination({ ...pagination, current: 1 })
        loadData(1, pagination.pageSize)
    }

    const handleDelete = async (id: string) => {
        try {
            const res = await deleteAnnouncement({ id })
            if (res.code === 0) {
                message.success("删除成功")
                loadData()
            } else {
                message.error("删除失败：" + res.message)
            }
        } catch (_error) {
            message.error("删除失败，请稍后重试")
        }
    }

    const handleEdit = (record: API.AnnouncementVO) => {
        setEditingAnnouncement(record)
        setModalVisible(true)
    }

    const handleAdd = () => {
        setEditingAnnouncement(undefined)
        setModalVisible(true)
    }

    const handleModalSubmit = async (values: API.AnnouncementAddRequest) => {
        setModalLoading(true)
        try {
            let res
            if (editingAnnouncement) {
                res = await updateAnnouncement({
                    ...values,
                    id: editingAnnouncement.id,
                })
            } else {
                res = await addAnnouncement(values)
            }

            if (res.code === 0) {
                message.success(editingAnnouncement ? "更新成功" : "创建成功")
                setModalVisible(false)
                loadData()
            } else {
                message.error(
                    (editingAnnouncement ? "更新" : "创建") +
                        "失败：" +
                        res.message,
                )
            }
        } catch (_error) {
            message.error("操作失败，请稍后重试")
        } finally {
            setModalLoading(false)
        }
    }

    const columns: ColumnsType<API.AnnouncementVO> = [
        {
            title: "标题",
            dataIndex: "title",
            key: "title",
            width: 200,
            ellipsis: true,
        },
        {
            title: "内容",
            dataIndex: "content",
            key: "content",
            ellipsis: true,
        },
        {
            title: "优先级",
            dataIndex: "priority",
            key: "priority",
            width: 100,
            sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
            render: (priority) => (
                <Tag
                    color={
                        priority > 5 ? "red" : priority > 0 ? "orange" : "blue"
                    }
                >
                    {priority}
                </Tag>
            ),
        },
        {
            title: "发布人",
            dataIndex: ["userVO", "userName"],
            key: "publisher",
            width: 120,
        },
        {
            title: "创建时间",
            dataIndex: "createTime",
            key: "createTime",
            width: 180,
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: "操作",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定删除此公告吗？"
                        description="删除后不可恢复"
                        onConfirm={() => handleDelete(record.id as string)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div style={{ padding: "24px" }}>
            <Card
                bordered={false}
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <ExclamationCircleOutlined
                            style={{ color: "#1890ff" }}
                        />
                        <span>公告管理</span>
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        发布公告
                    </Button>
                }
            >
                <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
                    <Input
                        placeholder="搜索公告标题"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 200 }}
                        onPressEnter={handleSearch}
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleSearch}
                    >
                        搜索
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={announcements}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showTotal: (total) => `共 ${total} 条公告`,
                        onChange: (page, pageSize) => {
                            setPagination({
                                ...pagination,
                                current: page,
                                pageSize,
                            })
                            loadData(page, pageSize)
                        },
                    }}
                />
            </Card>

            <AnnouncementModal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSubmit={handleModalSubmit}
                initialValues={editingAnnouncement}
                loading={modalLoading}
            />
        </div>
    )
}
