// @ts-expect-error
/* eslint-disable */
import request from "@/lib/request"

/** 此处后端没有提供注释 GET /admin/system/ai-usage */
export async function getAiUsage(options?: { [key: string]: any }) {
    return request<API.BaseResponseString>("/admin/system/ai-usage", {
        method: "GET",
        ...(options || {}),
    })
}

/** 此处后端没有提供注释 POST /admin/system/resume-ai */
export async function resumeAi(options?: { [key: string]: any }) {
    return request<API.BaseResponseString>("/admin/system/resume-ai", {
        method: "POST",
        ...(options || {}),
    })
}

/** 此处后端没有提供注释 POST /admin/system/shutdown-ai */
export async function shutdownAi(options?: { [key: string]: any }) {
    return request<API.BaseResponseString>("/admin/system/shutdown-ai", {
        method: "POST",
        ...(options || {}),
    })
}

/** 此处后端没有提供注释 GET /admin/system/status-ai */
export async function getGlobalAiStatus(options?: { [key: string]: any }) {
    return request<API.BaseResponseBoolean>("/admin/system/status-ai", {
        method: "GET",
        ...(options || {}),
    })
}

/** 此处后端没有提供注释 GET /admin/system/user-ai-status */
export async function getUserAiStatus(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getUserAiStatusParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/admin/system/user-ai-status", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 此处后端没有提供注释 POST /admin/system/user-ai-switch */
export async function toggleUserAi(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.toggleUserAiParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseString>("/admin/system/user-ai-switch", {
        method: "POST",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}
