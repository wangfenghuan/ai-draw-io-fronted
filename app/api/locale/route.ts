import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Locale } from "@/i18n"

export async function POST(request: Request) {
    try {
        const { locale } = (await request.json()) as { locale: Locale }

        if (!locale || !["zh", "en"].includes(locale)) {
            return NextResponse.json(
                { error: "Invalid locale" },
                { status: 400 }
            )
        }

        const cookieStore = await cookies()
        cookieStore.set("locale", locale, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: "lax",
        })

        return NextResponse.json({ success: true, locale })
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to set locale" },
            { status: 500 }
        )
    }
}