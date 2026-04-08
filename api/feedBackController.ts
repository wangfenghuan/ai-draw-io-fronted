// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 添加反馈 用户提交反馈意见。

**功能说明：**
- 记录用户反馈内容
- 支持附带图片URL
- 自动关联当前登录用户

**内容校验：**
- 反馈内容不能为空
- 最多2000字符

**权限要求：**
- 需要登录 POST /feedback/add */
export async function addFeedback(
  body: API.FeedbackAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/feedback/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 管理员删除反馈 删除指定的反馈记录。

**权限要求：**
- 仅限admin角色 POST /feedback/delete */
export async function deleteFeedback(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/feedback/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据ID获取反馈 根据ID获取反馈详细信息。

**权限要求：**
- 需要登录 GET /feedback/get */
export async function getFeedbackById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFeedbackByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseFeedback>("/feedback/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 根据ID获取反馈封装类 根据ID获取反馈详情（封装类）。

**返回内容：**
- 反馈基本信息
- 提交用户信息

**权限要求：**
- 需要登录 GET /feedback/get/vo */
export async function getFeedbackVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getFeedbackVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseFeedbackVO>("/feedback/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 分页获取反馈列表 分页查询反馈列表（实体类）。

**权限要求：**
- 仅限admin角色 POST /feedback/list/page */
export async function listFeedbackByPage(
  body: API.FeedbackQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageFeedback>("/feedback/list/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页获取反馈封装列表 分页查询反馈列表（封装类）。

**返回内容：**
- 反馈基本信息
- 提交用户信息

**权限要求：**
- 需要登录

**限制条件：**
- 每页最多20条 POST /feedback/list/page/vo */
export async function listFeedbackVoByPage(
  body: API.FeedbackQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageFeedbackVO>("/feedback/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取我提交的反馈列表 分页查询当前登录用户提交的反馈。

**权限要求：**
- 需要登录
- 只能查询自己提交的反馈

**限制条件：**
- 每页最多20条 POST /feedback/my/list/page/vo */
export async function listMyFeedbackVoByPage(
  body: API.FeedbackQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageFeedbackVO>("/feedback/my/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 管理员编辑反馈 更新反馈的处理状态。

**功能说明：**
- 标记反馈是否已处理

**权限要求：**
- 仅限admin角色 POST /feedback/update */
export async function updateFeedback(
  body: API.FeedbackUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/feedback/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 上传反馈图片 上传反馈相关的图片文件。

**功能说明：**
- 上传图片到对象存储
- 目录格式：feedback/{userId}/{filename}

**文件校验：**
- 最大5MB
- 仅支持图片格式

**权限要求：**
- 需要登录 POST /feedback/upload/image */
export async function uploadFeedbackImage(
  body: {},
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>("/feedback/upload/image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
