// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 内部鉴权 供 Node.js 调用，校验 WebSocket 连接权限 POST /internal/auth */
export async function checkAuth(
  body: API.AuthRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAuthResponse>("/internal/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 内部保存 供 Node.js 回调保存图表数据 POST /internal/save */
export async function saveSnapshot(
  body: API.SaveRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/internal/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
