import { getCookie } from "@/lib/util/server-utils";

export const getSiteConfig = async () => {
    let shopSettings: Record<string, string> = {};

    try {
        const cookie = (await getCookie("configs")) ?? "{}";

        shopSettings = JSON.parse(cookie) || {};
    } catch {
        shopSettings = {};
    }

    const siteConfig = {
        name: shopSettings.shop_name || "Thriftbyoba Store",
        address: shopSettings.address || "",
        description: "Discover a wide range of high-quality products at unbeatable prices. Shop now for exclusive deals and fast shipping.",
        contactEmail: shopSettings.contact_email || "",
        contactPhone: shopSettings.contact_phone || "",
        shopEmail: shopSettings.shop_email || "",
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
        links: {
            facebook: `https://web.facebook.com/profile.php?id=${shopSettings.facebook}`,
            instagram: `https://www.instagram.com/${shopSettings.instagram}`,
            twitter: `https://twitter.com/${shopSettings.twitter}`,
            x: `https://x.com/${shopSettings.x}`,
            tiktok: `https://www.tiktok.com/@${shopSettings.tiktok}`,
            whatsapp: `https://wa.me/${shopSettings.whatsapp}`,
        },
    };

    return siteConfig;
};
