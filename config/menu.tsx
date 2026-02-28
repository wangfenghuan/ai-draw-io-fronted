import {
    CrownOutlined,
    HomeOutlined,
    MessageOutlined,
    NotificationOutlined,
    ShopOutlined,
    TableOutlined,
    UserOutlined,
    RocketOutlined,
} from "@ant-design/icons"
import type { MenuDataItem } from "@ant-design/pro-layout"

// 菜单键名映射
export const menuKeys = {
    home: "nav.home",
    freeTrial: "nav.freeTrial",
    templates: "nav.templates",
    diagramMarketplace: "nav.diagramMarketplace",
    myDiagrams: "nav.myDiagrams",
    myRooms: "nav.myRooms",
    mySpaces: "nav.mySpaces",
    announcement: "nav.announcement",
    feedback: "nav.feedback",
    adminConsole: "nav.adminConsole",
} as const

// 原始菜单配置（使用 key 而非直接文本）
export const menus: MenuDataItem[] = [
    {
        name: "home",
        path: "/",
        icon: <HomeOutlined />,
        access: "notLogin",
    },
     {
        name: "freeTrial",
        path: "/demo",
        icon: <RocketOutlined />,
        access: "onlyNotLogin",
    },
    {
        name: "templates",
        path: "/templates",
        icon: <ShopOutlined />,
        access: "notLogin",
    },
   
    {
        name: "diagramMarketplace",
        path: "/diagram-marketplace",
        icon: <CrownOutlined />,
        access: "notLogin",
    },
    {
        name: "myDiagrams",
        path: "/my-diagrams",
        icon: <TableOutlined />,
    },
    {
        name: "myRooms",
        path: "/my-rooms",
        icon: <UserOutlined />,
    },
    {
        name: "mySpaces",
        path: "/my-spaces",
        icon: <UserOutlined />,
    },
    {
        name: "announcement",
        path: "/announcement",
        icon: <NotificationOutlined />,
    },
    {
        name: "feedback",
        path: "/user/feedback",
        icon: <MessageOutlined />,
    },
    {
        path: "/admin",
        name: "adminConsole",
        access: "admin",
    },
]

// 获取带翻译的菜单 (t 已经是 useTranslations("nav") 的结果，不需要再加 nav. 前缀)
export const getTranslatedMenus = (t: (key: string) => string): MenuDataItem[] => {
    return menus.map(item => ({
        ...item,
        name: t(item.name as string),
    }))
}

export default menus

export const findAllMenuItemByPath = (path: string): MenuDataItem | null => {
    return findMenuItemByPath(menus, path)
}
export const findMenuItemByPath = (
    menus: MenuDataItem[],
    path: string,
): MenuDataItem | null => {
    for (const menu of menus) {
        if (menu.path === path) {
            return menu
        }
        if (menu.children) {
            const matchedMenuItem = findMenuItemByPath(menu.children, path)
            if (matchedMenuItem) {
                return matchedMenuItem
            }
        }
    }
    return null
}
