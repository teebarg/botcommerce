import type { MetadataRoute } from "next";

import { siteUrls } from "@config/urls";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
        },
        sitemap: `${siteUrls.publicUrl}/api/sitemap.xml`,
    };
}
