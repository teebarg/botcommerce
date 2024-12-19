export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: process.env.NEXT_PUBLIC_NAME,
    description: "Make beautiful websites regardless of your coding experience.",
    contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    navMenuItems: [
        {
            label: "Profile",
            href: "/account/profile",
        },
        {
            label: "Dashboard",
            href: "/account",
        },
        {
            label: "Orders",
            href: "/account/orders",
        },
        {
            label: "Addresses",
            href: "/account/addresses",
        },
        {
            label: "Logout",
            href: "/logout",
        },
    ],
    links: {
        github: "https://github.com/teebarg",
        twitter: "https://twitter.com",
        docs: "",
        youtube: "https://youtube.com",
        whatsapp: "https://youtube.com",
    },
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
