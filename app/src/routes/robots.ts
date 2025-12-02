const BaseUrl = import.meta.env.VITE_BASE_URL

export default function robots() {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: `${BaseUrl}/api/sitemap.xml`,
    };
}
