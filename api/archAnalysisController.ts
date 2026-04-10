// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 流式生成项目架构图 两阶段架构图生成流程：

**阶段1：架构摘要生成**
- 分析AST抽象语法树数据
- 识别项目分层结构（Web层、服务层、缓存层、持久层等）
- 识别中间件依赖（Redis、MySQL、PostgreSQL等）
- 推导设计策略和优化策略
- 输出YAML格式的架构摘要

**阶段2：架构图生成**
- 根据YAML摘要生成draw.io架构图
- 采用分层布局展示各层组件
- 使用颜色区分不同层次
- 标注核心流转路径和数据流向

**请求参数：**
- diagramId：图表ID（必填，用于保存生成的架构图）
- astData：AST抽象语法树数据（必填）
- modelId：模型ID（可选，默认使用系统配置）

**限流规则：**
- 用户级别限流，3秒内最多1次

**权限要求：**
- 需要登录
- 需要消耗AI调用额度 POST /arch/generate/stream */
export async function genArchDiagramStream(
  body: API.ArchAnalysisRequest,
  options?: { [key: string]: any }
) {
  return request<API.SseEmitter>("/arch/generate/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 同步生成项目架构图 同步模式生成项目架构图（适用于小规模AST数据）。

**与流式接口的区别：**
- 流式接口实时返回生成过程，适合大规模AST分析
- 同步接口等待完整生成后返回，适合需要完整结果的场景

**请求参数：**
- diagramId：图表ID（必填）
- astData：AST抽象语法树数据（必填）
- modelId：模型ID（可选）

**限流规则：**
- 用户级别限流，5秒内最多1次

**权限要求：**
- 需要登录 POST /arch/generate/sync */
export async function genArchDiagramSync(
  body: API.ArchAnalysisRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>("/arch/generate/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
