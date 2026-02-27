import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n.ts")

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    // Next.js 16 默认使用 Turbopack，需要添加此配置避免 webpack 配置冲突报错
    turbopack: {},
    // eslint: {
    //     ignoreDuringBuilds: true,
    // },
    typescript: {
        ignoreBuildErrors: true,
    },
    async rewrites() {
        const isDev = process.env.NODE_ENV === "development"
        // 注意: /api/chat/stream 和 /api/chat/custom/stream 由 Route Handler 处理
        // Next.js 会优先匹配 Route Handler，所以这里的 rewrite 不会影响 SSE 流
        return [
            {
                source: "/api/:path*",
                destination: isDev
                    ? "http://localhost:8081/api/:path*"
                    : "http://47.95.35.178:8081/api/:path*",
            },
        ]
    },
    webpack: (config, { isServer, webpack }) => {
        if (!isServer) {
            
        }
        
        // Enable async WebAssembly
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            layers: true, // Enable layers for experiments
        }

        // Force ignore these modules to prevent dynamic import errors in web-tree-sitter
        // Use IgnorePlugin to completely ignore Node.js specific imports in web-tree-sitter
        // config.plugins.push(
        //    new webpack.IgnorePlugin({
        //        resourceRegExp: /^(fs|fs\/promises|module)$/,
        //        contextRegExp: /web-tree-sitter/,
        //    })
        // )
        
        // Add rule to handle .wasm files if not already present
        // config.module.rules.push({
        //   test: /\.wasm$/,
        //   type: "asset/resource",
        // })

        return config
    },
}

export default withNextIntl(nextConfig)
