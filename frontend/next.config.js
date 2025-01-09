/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
        ],
    },
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: "/sitemap.xml",
                    destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/sitemap.xml`,
                },
            ],
        };
    },
};

module.exports = nextConfig;
