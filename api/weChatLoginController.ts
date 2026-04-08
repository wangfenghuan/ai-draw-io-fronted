// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 生成扫码登录二维码 PC端调用，返回小程序码图片和场景ID GET /wechat/login/qrcode */
export async function generateQrCode(options?: { [key: string]: any }) {
  return request<API.BaseResponseWeChatQrCodeVO>("/wechat/login/qrcode", {
    method: "GET",
    ...(options || {}),
  });
}

/** 小程序扫码确认登录 小程序端调用，传递场景ID和微信code完成登录 POST /wechat/login/scan */
export async function scanLogin(
  body: API.WeChatScanLoginRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/wechat/login/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询登录状态 PC端轮询，返回当前扫码状态和登录凭证 GET /wechat/login/status */
export async function queryStatus(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryStatusParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseWeChatLoginStatusVO>("/wechat/login/status", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
