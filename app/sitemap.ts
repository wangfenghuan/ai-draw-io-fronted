import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://next-ai-drawio.jiang.jp",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: "https://next-ai-drawio.jiang.jp/about",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: "https://next-ai-drawio.jiang.jp/material-marketplace",
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
    ]
}
