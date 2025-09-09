/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "2mb",
        },
    },
    reactStrictMode: process.env.NODE_ENV === "production",
    bundlePagesRouterDependencies: true,
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
            },
            {
                protocol: "https",
                hostname: "storage.googleapis.com",
            },
            {
                protocol: "https",
                hostname: "firebasestorage.googleapis.com",
            },
            {
                protocol: "https",
                hostname: "bzjitsvxyblegrvtzvef.supabase.co",
            },
            {
                protocol: "https",
                hostname: "hvddfokeceaoanzpioou.supabase.co",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: "/api/sitemap.xml",
                    destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sitemap.xml`,
                },
            ],
        };
    },
};

module.exports = nextConfig;
