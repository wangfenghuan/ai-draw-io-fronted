import type { MenuDataItem } from "@ant-design/pro-layout"
import checkAccess from "@/access/checkAccess"
import menus from "@/config/menu"

export const getAccessibleMenus = (
    loginUser: API.LoginUserVO,
    menuItems: MenuDataItem[] = menus,
) => {
    return menuItems.filter((item) => {
        if (!checkAccess(loginUser, item.access)) {
            return false
        }
        if (item.children) {
            item.children = getAccessibleMenus(loginUser, item.children)
        }
        return true
    })
}
