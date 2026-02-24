import AccessEnum from "@/access/accessEnum"

const checkAccess = (
    loginUser: API.LoginUserVO,
    needAccess = AccessEnum.NOT_LOGIN,
) => {
    // 获取当前用户具有的权限
    const loginUserAccess = loginUser?.userRole ?? AccessEnum.NOT_LOGIN
    // 如果需要“仅未登录可以访问”的权限
    if (needAccess === AccessEnum.ONLY_NOT_LOGIN) {
        if (loginUserAccess !== AccessEnum.NOT_LOGIN) {
            return false // 已登录则没有权限
        }
        return true
    }
    // 如果不需要任何权限
    if (needAccess === AccessEnum.NOT_LOGIN) {
        return true
    }
    if (needAccess === AccessEnum.USER) {
        if (loginUserAccess === AccessEnum.NOT_LOGIN) {
            return false
        }
        return true
    }
    if (needAccess === AccessEnum.ADMIN) {
        if (loginUserAccess !== AccessEnum.ADMIN) {
            return false
        }
        return true
    }
    return true
}

export default checkAccess
