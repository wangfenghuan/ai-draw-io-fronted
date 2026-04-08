// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 分页查询图表对话历史 分页查询指定图表的AI对话历史记录。

**功能说明：**
- 查询图表的AI生成对话历史
- 支持游标分页（基于创建时间）
- 返回对话记录列表

**权限要求：**
- 需要登录
- 仅图表创建人可查询 GET /conversion/diagram/${param0} */
export async function listDiagramChatHistory(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listDiagramChatHistoryParams,
  options?: { [key: string]: any }
) {
  const { diagramId: param0, ...queryParams } = params;
  return request<API.BaseResponsePageConversion>(
    `/conversion/diagram/${param0}`,
    {
      method: "GET",
      params: {
        // pageSize has a default value: 10
        pageSize: "10",
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}
