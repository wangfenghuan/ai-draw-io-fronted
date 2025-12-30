import Forbidden from "next/dist/client/components/builtin/forbidden"
import { usePathname } from "next/navigation"
import type React from "react"
import { useSelector } from "react-redux"
import AccessEnum from "@/access/accessEnum"
import checkAccess from "@/access/checkAccess"
import { findAllMenuItemByPath } from "@/config/menu"
import type { RootState } from "@/stores"

const AccessLayout: React.FC<
    Readonly<{
        children: React.ReactNode
    }>
> = ({ children }) => {
    const pathname = usePathname()
    // 当前登录用户
    const loginUSer = useSelector((state: RootState) => state.loginUser)
    // 获取当前路径需要的权限
    const menu = findAllMenuItemByPath(pathname)
    const needAccess = menu?.access ?? AccessEnum.NOT_LOGIN
    // 校验权限
    const canAccess = checkAccess(loginUSer, needAccess)
    if (!canAccess) {
        return <Forbidden />
    }
    return children
}

export default AccessLayout
