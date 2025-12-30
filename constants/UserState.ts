import accessEnum from "@/access/accessEnum"

export const DefauleUser: API.LoginUserVO = {
    userName: "未登录",
    userProfile: "暂无简介",
    userRole: accessEnum.NOT_LOGIN,
}
