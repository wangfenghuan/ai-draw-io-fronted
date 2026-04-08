// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 使用自定义LLM生成图表 使用用户自定义的AI模型流式生成图表内容。

**功能说明：**
- 支持用户自定义AI模型（baseUrl、apiKey、modelId）
- 使用SSE实现流式响应

**请求参数：**
- message：用户消息（必填）
- diagramId：图表ID（必填）
- modelId：模型ID（必填）
- baseUrl：API基础URL（必填）
- apiKey：API密钥（必填）

**限流规则：**
- 用户级别限流，每秒最多1次

**权限要求：**
- 需要登录 POST /chat/custom/stream */
export async function doCustomChatStream(
  body: API.CustomChatRequest,
  options?: { [key: string]: any }
) {
  return request<API.SseEmitter>("/chat/custom/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 免费试用AI生成图表 无需登录即可体验AI生成图表功能。

**功能说明：**
- 创建临时图表用于体验
- 使用系统默认模型生成
- 生成结果可后续登录保存

**限流规则：**
- IP级别限流，每天最多3次
- 限流周期：24小时

**权限要求：**
- 无需登录 POST /chat/free/stream */
export async function freeTrialStream(
  body: API.FreeTrialRequest,
  options?: { [key: string]: any }
) {
  return request<API.SseEmitter>("/chat/free/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /chat/gen */
export async function doChat(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.doChatParams,
  options?: { [key: string]: any }
) {
  return request<string>("/chat/gen", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 系统默认LLM流式生成图表 使用系统默认的AI模型流式生成图表内容。

**功能说明：**
- 使用SSE（Server-Sent Events）实现流式响应
- 基于用户消息生成或修改图表
- 自动记录对话历史

**请求参数：**
- message：用户消息（必填）
- diagramId：图表ID（必填）

**限流规则：**
- 用户级别限流，每秒最多1次

**权限要求：**
- 需要登录
- 需要消耗AI调用额度 POST /chat/stream */
export async function doChatStream(
  body: API.CustomChatRequest,
  options?: { [key: string]: any }
) {
  return request<API.SseEmitter>("/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
