/**
 * @purpose This file contains all the site urls
 *
 * To add a new URL:
 * 1. Add a new property to the siteUrls object with the URL path.
 * 2. Import the siteUrls object from "@/config/urls" in the file where you want to use the URL.
 * 3. Use the URL in the file.
 */

export const siteUrls = {
    publicUrl: "https://commerce.niyi.com.ng/",
    github: "https://github.com/teebarg/botcommerce",
    home: "/",
    support: "/support",
    auth: {
        login: "/auth/signin",
        signup: "/auth/signup",
    },
    admin: {
        dashboard: "/admin/dashboard",
        users: "/admin/users",
    },
    profile: {
        settings: "/profile/settings",
    },
} as const;

export const publicRoutes: string[] = [siteUrls.publicUrl, siteUrls.home, siteUrls.support];

export const protectedRoutes: string[] = [
    siteUrls.auth.login,
    siteUrls.auth.signup,
    siteUrls.admin.dashboard,
    siteUrls.admin.users,
    siteUrls.profile.settings,
];
