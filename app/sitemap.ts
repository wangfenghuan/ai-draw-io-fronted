import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "http://47.95.35.178",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: "http://47.95.35.178/about",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: "http://47.95.35.178/material-marketplace",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
    ]
}
