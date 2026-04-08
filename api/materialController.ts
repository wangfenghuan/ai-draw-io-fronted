// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 创建素材 创建新的素材资源。

**功能说明：**
- 创建素材记录
- 自动关联当前登录用户

**权限要求：**
- 仅限admin角色 POST /material/add */
export async function addMaterial(
  body: API.MaterialAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/material/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除素材 删除指定的素材资源。

**权限要求：**
- 仅限admin角色 POST /material/delete */
export async function deleteMaterial(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/material/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据ID获取素材 根据ID获取素材详细信息（实体类）。

**权限要求：**
- 仅限admin角色 GET /material/get */
export async function getMaterialById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMaterialByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseMaterial>("/material/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 根据ID获取素材封装类 根据ID获取素材详情（封装类）。

**返回内容：**
- 素材基本信息
- 创建用户信息

**权限要求：**
- 需要登录 GET /material/get/vo */
export async function getMaterialVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMaterialVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseMaterialVO>("/material/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 分页获取素材列表 分页查询素材列表（实体类）。

**权限要求：**
- 仅限admin角色 POST /material/list/page */
export async function listMaterialByPage(
  body: API.MaterialQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageMaterial>("/material/list/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页获取素材封装列表 分页查询素材列表（封装类）。

**返回内容：**
- 素材基本信息

**权限要求：**
- 需要登录

**限制条件：**
- 每页最多20条 POST /material/list/page/vo */
export async function listMaterialVoByPage(
  body: API.MaterialQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageMaterialVO>("/material/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新素材 更新素材资源信息。

**权限要求：**
- 仅限admin角色 POST /material/update */
export async function updateMaterial(
  body: API.MaterialUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/material/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
