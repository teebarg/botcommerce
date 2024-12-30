/** @type {import('next').NextConfig} */
const nextConfig = {
    // reactStrictMode: true,
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
        ],
    },
};

module.exports = nextConfig;
