// @ts-expect-error
/* eslint-disable */
import request from "@/lib/request"

/** 创建空间 POST /space/add */
export async function addSpace(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.addSpaceParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/space/add", {
        method: "POST",
        params: {
            ...params,
            spaceAddReqeust: undefined,
            ...params["spaceAddReqeust"],
        },
        ...(options || {}),
    })
}

/** 删除空间 删除指定的空间，并自动删除空间内的所有图表。

**功能说明：**
- 删除空间记录
- 级联删除空间内的所有图表
- 使用事务确保删除操作的原子性

**额度处理：**
- 删除空间不会释放额度（因为空间本身被删除了）
- 删除图表时也不会释放额度（因为关联的空间也被删除了）

**权限要求：**
- 需要登录
- 仅空间创建人或管理员可删除

**注意事项：**
- 删除操作不可逆，请谨慎操作
- 删除后空间内的所有图表都会被删除
- 对象存储中的文件不会自动删除（可通过定时任务清理）
 POST /space/delete */
export async function deleteSpace(
    body: API.DeleteRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/space/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 查询空间级别列表 获取所有可用的空间级别信息，用于前端展示空间等级和对应的额度限制。

**返回内容：**
- value：级别值（0=普通版，1=专业版，2=旗舰版）
- text：级别名称（"普通版"、"专业版"、"旗舰版"）
- maxCount：最大图表数量
- maxSize：最大存储空间（字节）

**级别说明：**
- **普通版（value=0）：**
  - 最大100个图表
  - 最大100MB存储空间
- **专业版（value=1）：**
  - 最大1000个图表
  - 最大1000MB存储空间
- **旗舰版（value=2）：**
  - 最大10000个图表
  - 最大10000MB存储空间

**权限要求：**
- 无需登录，所有用户可查询
 GET /space/list/level */
export async function listSpaceLevel(options?: { [key: string]: any }) {
    return request<API.BaseResponseListSpaceLevel>("/space/list/level", {
        method: "GET",
        ...(options || {}),
    })
}

/** 更新空间信息（管理员专用） 管理员专用的空间信息更新接口。

**权限要求：**
- 仅限admin角色使用

**注意事项：**
- 如果修改了空间级别，会自动重新设置maxCount和maxSize
- 不会影响当前的totalSize和totalCount
 POST /space/update */
export async function updateSpace(
    body: API.SpaceUpdateRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/space/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}
