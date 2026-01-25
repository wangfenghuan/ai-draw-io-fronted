import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/admin/",
                "/my-diagrams/",
                "/my-spaces/",
                "/my-rooms/",
                "/team-spaces/",
                "/user/",
            ],
        },
        sitemap: "https://next-ai-drawio.jiang.jp/sitemap.xml",
    }
}
