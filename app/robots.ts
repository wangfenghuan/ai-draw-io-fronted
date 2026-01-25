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
        sitemap: "http://47.95.35.178/sitemap.xml",
    }
}
