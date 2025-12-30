# 后端 SSE 流式对话实现说明

## 📋 功能概述

已完成从前端 AI 调用改为后端 SSE 流式接口的改造，实现以下功能：

### ✅ 已完成功能

1. **后端 SSE 流式调用**
   - 使用原生 fetch API 处理 Server-Sent Events
   - 实时流式显示 AI 回复内容
   - 支持中断/停止生成

2. **历史对话记录加载**
   - 从后端 API 加载图表的历史对话记录
   - 自动转换为前端消息格式
   - 支持分页加载（默认100条）

3. **自动图表生成**
   - 解析 AI 返回的 XML 内容
   - 自动加载到 Draw.io 画布
   - 支持多种 XML 格式

4. **UI 优化**
   - 现代化深色主题设计
   - 白色字体，高对比度
   - 渐变背景和毛玻璃效果
   - 响应式布局

## 📁 文件结构

```
├── lib/
│   ├── use-backend-chat.ts          # SSE 流式请求 Hook
│   └── utils.ts                      # XML 解析工具函数
├── components/
│   └── simple-chat-panel.tsx        # 简化聊天面板组件
├── app/diagram/edit/[id]/
│   └── page.tsx                      # 图表编辑页面
└── api/
    └── conversionController.ts      # 后端 API 接口
```

## 🔧 核心实现

### 1. SSE 流式 Hook (`lib/use-backend-chat.ts`)

```typescript
const { messages, sendMessage, stop, clearMessages, isLoading, error } = useBackendChat({
    diagramId: string,
    onMessageComplete: (fullContent: string) => void,
    onError: (error: Error) => void
})
```

**功能**：
- 调用 `POST /chat/stream` 接口
- 实时接收并显示流式数据
- 支持取消请求（AbortController）
- 自动管理消息状态

### 2. 聊天面板组件 (`components/simple-chat-panel.tsx`)

**Props**：
```typescript
interface SimpleChatPanelProps {
    diagramId: string
    isVisible: boolean
    onToggleVisibility: () => void
    darkMode: boolean
}
```

**特性**：
- 实时流式显示 AI 回复
- 发送/停止按钮
- 清空对话功能
- 面板折叠/展开
- 优雅的错误提示

### 3. XML 解析工具 (`lib/utils.ts`)

```typescript
parseXmlAndLoadDiagram(content: string, loadDiagram: Function)
```

**支持的格式**：
- `<mxfile>...</mxfile>` 完整格式
- `<mxGraphModel>...</mxGraphModel>` 简化格式
- 自动包装和加载到画布

## 🎨 样式设计

### 颜色方案
- **背景**：深色渐变 (slate-950 → slate-900 → slate-950)
- **文字**：白色及白色半透明 (text-white, text-white/70)
- **用户消息**：蓝色渐变 (from-blue-600 to-blue-700)
- **AI 消息**：白色半透明毛玻璃 (bg-white/10)
- **边框**：白色半透明 (border-white/10)

### 组件样式
- 圆角：rounded-xl / rounded-2xl
- 阴影：shadow-2xl / shadow-lg
- 毛玻璃：backdrop-blur-sm
- 过渡动画：transition-all duration-200

## 🔌 后端接口

### 流式对话接口

**请求**：
```http
POST /chat/stream
Content-Type: application/json

{
  "message": "用户输入的消息",
  "diagramId": "图表ID"
}
```

**响应**：
- Content-Type: text/event-stream
- 流式返回文本数据

### 历史记录接口

**请求**：
```http
GET /conversion/diagram/{diagramId}?pageSize=100
```

**响应**：
```json
{
  "code": 0,
  "data": {
    "records": [
      {
        "id": 1,
        "diagramId": 123,
        "messageType": "user",
        "message": "用户消息",
        "createTime": "2024-12-30 10:00:00"
      }
    ]
  }
}
```

## 🚀 使用流程

1. **创建图表**
   - 访问首页 (`/`)
   - 点击"立即创建我的图表"
   - 自动跳转到编辑页面 (`/diagram/edit/{diagramId}`)

2. **AI 对话**
   - 在聊天面板输入问题
   - 点击"发送"按钮
   - 实时查看 AI 流式回复
   - 自动生成并加载图表到画布

3. **管理对话**
   - 点击"清空"清除历史记录
   - 点击停止按钮中断生成
   - 点击折叠图标隐藏/显示面板

## 📝 注意事项

### 后端要求
- 后端必须实现 SSE 流式接口
- 返回纯文本数据，不包含 "data:" 前缀
- 支持 CORS（如果前后端分离）

### 前端配置
- 确保 `diagramId` 正确传递
- 检查网络请求是否正常
- 查看浏览器控制台错误信息

### 调试建议
```typescript
// 在 use-backend-chat.ts 中添加日志
console.log("[SSE] Received chunk:", chunk)
console.log("[SSE] Full content:", fullContent)
```

## 🐛 常见问题

### 1. 流式响应不显示
- 检查后端接口是否返回 SSE 格式
- 查看网络面板的响应内容
- 确认 fetch 请求成功

### 2. XML 解析失败
- 检查 AI 返回的内容格式
- 查看控制台的解析日志
- 确认 XML 格式正确

### 3. 样式显示异常
- 检查 Tailwind CSS 配置
- 确认暗色模式是否启用
- 验证颜色类名是否正确

## 🔜 未来优化

- [ ] 保存对话记录到后端
- [ ] 支持多轮对话上下文
- [ ] 添加对话导出功能
- [ ] 支持图片上传和分析
- [ ] 添加快捷指令模板
- [ ] 优化移动端体验

## 📞 技术支持

如有问题，请检查：
1. 后端接口文档
2. 浏览器控制台错误
3. 网络请求响应
4. 代码注释说明

---

**最后更新**: 2024-12-30
**版本**: v1.0.0
**作者**: AI Assistant
