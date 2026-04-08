// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 解析SQL DDL（Druid + 语义AI） 解析SQL DDL语句，提取表结构和推断关系。

**功能说明：**
- 使用Druid解析SQL语法
- 提取表名、字段名、字段类型
- 智能推断表间关系（外键、命名约定）

**支持格式：**
- 标准SQL DDL语句（CREATE TABLE等）

**返回内容：**
- 表名列表
- 字段信息（名称、类型、约束）
- 推断的表间关系 POST /codeparse/parse/sql */
export async function parseSql(body: {}, options?: { [key: string]: any }) {
  return request<API.BaseResponseListSqlParseResultDTO>(
    "/codeparse/parse/sql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 上传并分析Spring Boot项目（架构视图） 上传Spring Boot项目ZIP文件，获取简化的架构图数据。

**功能说明：**
- 返回架构图所需的节点和连线数据
- 自动识别层级结构（API、业务、数据、中间件）
- 适合直接用于前端渲染架构图

**返回内容：**
- layers：层级列表
- components：组件节点列表
- links：组件间关系连线
- externalSystems：外部系统/中间件列表 POST /codeparse/springboot/upload */
export async function uploadAndAnalyzeSimple(
  body: {},
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSimplifiedProjectDTO>(
    "/codeparse/springboot/upload",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 上传并分析Spring Boot项目（完整版） 上传Spring Boot项目ZIP文件，获取完整的架构分析结果。

**功能说明：**
- 解压并解析Spring Boot项目结构
- 提取Controller、Service、Repository等组件
- 分析组件间的依赖关系

**支持格式：**
- 仅支持ZIP压缩包

**返回内容：**
- 项目节点信息（类、接口、组件）
- 组件间关系
- 中间件信息 POST /codeparse/springboot/upload/simple */
export async function uploadAndAnalyze(
  body: {},
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseProjectAnalysisResult>(
    "/codeparse/springboot/upload/simple",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}
