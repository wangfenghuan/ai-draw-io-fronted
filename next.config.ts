import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://47.95.35.178:8081/api/:path*",
            },
        ]
    },
}

export default nextConfig
