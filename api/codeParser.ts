// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** Parse SQL DDL (Druid + Semantic AI) Parses SQL DDL to extracted tables, columns, and infers relationships using semantic analysis POST /codeparse/parse/sql */
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

/** Upload and Analyze (Architecture Only) Returns architecture graph (nodes and links) for diagram generation POST /codeparse/springboot/upload */
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

/** Upload and Analyze Spring Boot Project Upload a ZIP file containing Spring Boot source code and get AI-ready architecture analysis POST /codeparse/springboot/upload/simple */
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
