import { useSession } from "@tanstack/react-start/server";

export type AuthUser = {
    firstName?: string;
    lastName?: string;
    image?: string;
    email?: string;
    role?: string;
    roles?: string[];
    isAdmin?: boolean;
};

export type SessionUser = {
    id: string | null;
    user: AuthUser;
    impersonated: boolean;
    impersonatedBy: string | null;
};

export function useAppSession() {
    return useSession<SessionUser>({
        password: process.env.SESSION_PASSWORD!,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60,
        },
    });
}
