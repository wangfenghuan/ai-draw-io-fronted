import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    /* config options here */
    output: "standalone",
    // eslint: {
    //     ignoreDuringBuilds: true,
    // },
    // typescript: {
    //     ignoreBuildErrors: true,
    // },
    async rewrites() {
        const isDev = process.env.NODE_ENV === "development"
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

export default nextConfig
