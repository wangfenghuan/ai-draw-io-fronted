// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 文件上传 上传文件到对象存储。

**功能说明：**
- 根据业务类型（biz）存储文件到对应目录
- 目录格式：{biz}/{userId}/{filename}
- 返回可访问的文件URL

**支持的业务类型：**
- USER_AVATAR：用户头像

**文件校验：**
- 用户头像：最大1MB，支持jpeg/jpg/svg/png/webp

**权限要求：**
- 需要登录 POST /file/upload */
export async function uploadFile(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadFileParams,
  body: {},
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>("/file/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      ...params,
      uploadFileRequest: undefined,
      ...params["uploadFileRequest"],
    },
    data: body,
    ...(options || {}),
  });
}
