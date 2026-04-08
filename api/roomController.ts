// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 保存图表数据 保存协作房间的图表编辑数据。

**功能说明：**
- 用于协同编辑场景保存图表状态
- 数据以加密字节数组形式存储

**权限要求：**
- 需要有房间的编辑权限 POST /room/${param0}/save */
export async function save(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.saveParams,
  body: string,
  options?: { [key: string]: any }
) {
  const { roomId: param0, ...queryParams } = params;
  return request<API.BaseResponseBoolean>(`/room/${param0}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 创建房间 创建协作房间用于多人实时编辑。

**功能说明：**
- 为图表创建协作房间
- 如果房间已存在则直接返回已存在的房间ID
- 创建人自动成为房间管理员

**权限要求：**
- 需要登录
- 需要有对应空间的权限 POST /room/add */
export async function addRoom(
  body: API.RoomAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/room/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除房间 删除指定的协作房间。

**权限要求：**
- 需要登录
- 协作房间：需要有房间用户管理权限
- 管理员可以删除任何房间
 POST /room/delete */
export async function deleteDiagramRoom(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/room/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 编辑房间（给用户使用） POST /room/edit */
export async function editDiagramRoom(
  body: API.RoomEditRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/room/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据ID获取房间详情 根据ID获取房间详细信息（封装类）。

**权限要求：**
- 需要登录
- 需要有房间的查看权限 GET /room/get/vo */
export async function getDiagramRoomVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDiagramRoomVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseRoomVO>("/room/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取房间内的图表详情 根据ID获取图表的详细信息。

**权限要求：**
- 需要登录
- 协作房间：需要有房间查看权限
- 管理员可以查看所有房间

**返回内容：**
- 图表基本信息（ID、名称、描述等）
- 文件URL（svgUrl、pictureUrl）
- 文件大小（svgSize、pngSize、picSize）
- 所属空间信息（spaceId）
 GET /room/getDiagram */
export async function getRoomDiagramVo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRoomDiagramVOParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseDiagramVO>("/room/getDiagram", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 分页获取房间列表（仅管理员可用） POST /room/list/page */
export async function listDiagramRoomByPage(
  body: API.RoomQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageDiagramRoom>("/room/list/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页获取房间列表（封装类） POST /room/list/page/vo */
export async function listDiagramRoomVoByPage(
  body: API.RoomQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageRoomVO>("/room/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页获取我创建的房间列表 分页查询当前登录用户创建的所有协作房间。

**权限要求：**
- 需要登录
- 只能查询自己创建的房间

**限制条件：**
- 每页最多20条 POST /room/my/list/page/vo */
export async function listMyDiagramRoomVoByPage(
  body: API.RoomQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageRoomVO>("/room/my/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新房间信息（仅管理员可用） POST /room/update */
export async function updateDiagramRoom(
  body: API.RoomUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/room/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改房间访问地址 更新协作房间的访问URL。

**功能说明：**
- 修改房间的分享链接地址

**权限要求：**
- 需要登录 POST /room/updateRoomUrl */
export async function updateRoomUrl(
  body: API.RoomUrlEditRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/room/updateRoomUrl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
