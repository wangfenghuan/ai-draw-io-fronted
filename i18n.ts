import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

export const locales = ["zh", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "zh"

export default getRequestConfig(async () => {
    // 从 cookie 中获取用户语言偏好
    const cookieStore = await cookies()
    const locale = (cookieStore.get("locale")?.value as Locale) || defaultLocale

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
    }
})