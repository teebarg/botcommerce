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
        name: shopSettings.shop_name || "Thriftbyoba",
        description:
            "Discover a wide range of high-quality products at unbeatable prices. Shop now for exclusive deals and fast shipping, ensuring a seamless shopping experience tailored just for you.",
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

export const openingHours = [
    {
        day: "Monday",
        time: "8:00am - 7:00pm",
    },
    {
        day: "Tuesday",
        time: "8:00am - 7:00pm",
    },
    {
        day: "Wednesday",
        time: "8:00am - 7:00pm",
    },
    {
        day: "Thursday",
        time: "10:00am - 7:00pm",
    },
    {
        day: "Friday",
        time: "8:00am - 7:00pm",
    },
    {
        day: "Saturday",
        time: "9:00am - 7:00pm",
    },
    {
        day: "Sunday",
        time: "Closed",
    },
];
