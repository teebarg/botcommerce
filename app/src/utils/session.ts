import { AuthUser } from "@/schemas";
import { useSession } from "@tanstack/react-start/server";

export type AppSession = {
    userId?: number;
    user?: AuthUser | null;
    isImpersonating?: boolean;
    impersonatedBy?: string | null;
    isAdmin?: boolean
    isAuthenticated?: boolean
};

export function useAppSession() {
    return useSession<AppSession>({
        password: process.env.SESSION_PASSWORD!,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60,
        },
    });
}
