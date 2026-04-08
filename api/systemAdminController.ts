// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 获取AI使用量统计 查询系统AI服务的使用量统计。

**返回内容：**
- AI调用总量统计

**权限要求：**
- 仅限admin角色 GET /admin/system/ai-usage */
export async function getAiUsage(options?: { [key: string]: any }) {
  return request<API.BaseResponseString>("/admin/system/ai-usage", {
    method: "GET",
    ...(options || {}),
  });
}

/** 全局启用AI服务 启用系统中所有用户的AI服务。

**功能说明：**
- 设置Redis全局开关为true
- 立即生效，恢复AI服务

**权限要求：**
- 仅限admin角色 POST /admin/system/resume-ai */
export async function resumeAi(options?: { [key: string]: any }) {
  return request<API.BaseResponseString>("/admin/system/resume-ai", {
    method: "POST",
    ...(options || {}),
  });
}

/** 全局禁用AI服务 禁用系统中所有用户的AI服务。

**功能说明：**
- 设置Redis全局开关为false
- 立即生效，所有AI请求将被拒绝

**权限要求：**
- 仅限admin角色 POST /admin/system/shutdown-ai */
export async function shutdownAi(options?: { [key: string]: any }) {
  return request<API.BaseResponseString>("/admin/system/shutdown-ai", {
    method: "POST",
    ...(options || {}),
  });
}

/** 获取全局AI服务状态 查询系统AI服务的全局开关状态。

**返回值：**
- true：AI服务已启用
- false：AI服务已禁用
- 默认为启用状态

**权限要求：**
- 仅限admin角色 GET /admin/system/status-ai */
export async function getGlobalAiStatus(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>("/admin/system/status-ai", {
    method: "GET",
    ...(options || {}),
  });
}

/** 获取用户AI服务状态 查询指定用户的AI服务开关状态。

**返回值：**
- true：该用户AI服务已启用
- false：该用户AI服务已禁用
- 默认为启用状态

**权限要求：**
- 仅限admin角色 GET /admin/system/user-ai-status */
export async function getUserAiStatus(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserAiStatusParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/admin/system/user-ai-status", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 切换用户AI服务权限 单独控制指定用户的AI服务权限。

**功能说明：**
- 设置用户级别的AI开关
- 不影响全局开关，可精细控制

**权限要求：**
- 仅限admin角色 POST /admin/system/user-ai-switch */
export async function toggleUserAi(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.toggleUserAiParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>("/admin/system/user-ai-switch", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
