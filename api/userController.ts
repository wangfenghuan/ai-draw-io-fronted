// @ts-ignore
/* eslint-disable */
import request from "@/lib/request";

/** 创建用户 管理员创建新用户。

**权限要求：**
- 仅限admin角色 POST /user/add */
export async function addUser(
  body: API.UserAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/user/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 生成图片验证码 生成图形验证码用于注册校验。

**返回内容：**
- key：验证码UUID
- value：Base64编码的验证码图片

**有效期：**
- 验证码60秒内有效 GET /user/createCaptcha */
export async function createCaptcha(options?: { [key: string]: any }) {
  return request<API.BaseResponseMapStringString>("/user/createCaptcha", {
    method: "GET",
    ...(options || {}),
  });
}

/** 删除用户 管理员删除指定用户。

**权限要求：**
- 仅限admin角色 POST /user/delete */
export async function deleteUser(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/user/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据ID获取用户 管理员根据ID获取用户详细信息。

**权限要求：**
- 仅限admin角色 GET /user/get */
export async function getUserById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseUser>("/user/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 查询用户的AI调用额度 查询当前用户的AI调用额度信息。

**返回内容：**
- dailyQuota：每日额度（默认5次/天）
- bonusQuota：永久奖励额度
- totalQuota：总额度

**权限要求：**
- 需要登录 GET /user/get/ai/quota */
export async function getUserAiQuota(options?: { [key: string]: any }) {
  return request<API.BaseResponseMapStringInteger>("/user/get/ai/quota", {
    method: "GET",
    ...(options || {}),
  });
}

/** 获取当前登录用户 获取当前登录用户的详细信息。

**返回内容：**
- 用户基本信息
- JWT Token（用于WebSocket认证，7天有效期） GET /user/get/login */
export async function getLoginUser(options?: { [key: string]: any }) {
  return request<API.BaseResponseLoginUserVO>("/user/get/login", {
    method: "GET",
    ...(options || {}),
  });
}

/** 根据ID获取用户封装类 根据ID获取用户详情（封装类）。

**返回内容：**
- 用户基本信息
- 用户权限列表

**权限要求：**
- 需要登录 GET /user/get/vo */
export async function getUserVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseUserVO>("/user/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 查询所有角色及对应权限 获取系统中所有角色及其权限配置。

**返回内容：**
- 角色信息
- 角色对应的权限列表

**权限要求：**
- 仅限admin角色 GET /user/getAuth */
export async function getAllRoleAndAuth(options?: { [key: string]: any }) {
  return request<API.BaseResponseListRoleWithAuthoritiesVO>("/user/getAuth", {
    method: "GET",
    ...(options || {}),
  });
}

/** 分页获取用户列表 管理员分页查询用户列表。

**权限要求：**
- 仅限admin角色 POST /user/list/page */
export async function listUserByPage(
  body: API.UserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageUser>("/user/list/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页获取用户封装列表 分页查询用户列表（封装类）。

**权限要求：**
- 需要登录

**限制条件：**
- 每页最多20条 POST /user/list/page/vo */
export async function listUserVoByPage(
  body: API.UserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageUserVO>("/user/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 用户登录 用户使用账号密码登录。

**功能说明：**
- 验证账号密码
- 创建Session会话
- 返回JWT Token（用于WebSocket认证）

**返回内容：**
- 用户基本信息
- JWT Token（7天有效期） POST /user/login */
export async function userLogin(
  body: API.UserLoginRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLoginUserVO>("/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 用户退出登录 用户退出登录，清除Session会话。

**功能说明：**
- 清除当前用户的Session
- 清除相关登录状态 POST /user/logout */
export async function userLogout(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>("/user/logout", {
    method: "POST",
    ...(options || {}),
  });
}

/** 用户注册 用户邮箱注册账号。

**功能说明：**
- 使用邮箱作为账号注册
- 需要邮箱验证码验证
- 支持邀请码机制

**校验规则：**
- 账号长度不少于4位
- 密码长度不少于8位
- 两次密码输入必须一致
- 需要有效的邮箱验证码 POST /user/register */
export async function userRegister(
  body: API.UserRegisterRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/user/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改角色权限 修改指定角色的权限配置。

**功能说明：**
- 可以批量设置角色的权限
- 权限变更后立即生效

**权限要求：**
- 仅限admin角色 POST /user/role/update/authorities */
export async function updateRoleAuthorities(
  body: API.RoleAuthorityUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/user/role/update/authorities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 发送注册验证码 向指定邮箱发送注册验证码。

**功能说明：**
- 发送6位数字验证码到邮箱
- 验证码5分钟内有效

**限流规则：**
- 同一IP每分钟最多发送1次

**邮箱格式校验：**
- 必须是有效的邮箱格式 POST /user/send-register-code */
export async function sendRegisterCode(
  body: API.UserEmailCodeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/user/send-register-code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新用户 管理员更新用户信息。

**权限要求：**
- 仅限admin角色 POST /user/update */
export async function updateUser(
  body: API.UserUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/user/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新账号信息 更新账号信息，支持修改密码或换绑邮箱。

**场景1：修改密码**
- 需要验证当前邮箱的验证码
- 新密码不少于8位
- 两次密码输入必须一致

**场景2：换绑邮箱**
- 需要验证新邮箱的验证码
- 新邮箱不能已被其他用户绑定

**权限要求：**
- 需要登录 POST /user/update/account */
export async function updateAccount(
  body: API.UserUpdateAccountRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/user/update/account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新个人信息 用户更新自己的个人信息。

**可修改字段：**
- 用户名
- 头像

**权限要求：**
- 需要登录
- 只能修改自己的信息 POST /user/update/my */
export async function updateMyUser(
  body: API.UserUpdateMyRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/user/update/my", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 修改用户角色 修改指定用户的角色。

**功能说明：**
- 一个用户可以拥有多个角色
- 角色变更后立即生效

**权限要求：**
- 仅限admin角色 POST /user/update/roles */
export async function updateUserRoles(
  body: API.UserRoleUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/user/update/roles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 上传头像图片 上传用户头像图片到对象存储。

**文件校验：**
- 最大5MB
- 仅支持图片格式

**权限要求：**
- 需要登录 POST /user/upload/image */
export async function uploadAvataImage(
  body: {},
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>("/user/upload/image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
