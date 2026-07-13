import { api } from "@/utils/api";
import { createServerFn } from "@tanstack/react-start";
import type { Session, User } from "@/schemas";
import { AppSession, useAppSession } from "@/utils/session";

export const getMeFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<User>("/users/me");
});

export const fetchUserFn = createServerFn().handler(async (): Promise<AppSession> => {
    const { data } = await useAppSession();
    return {
        ...data,
        isAdmin: ["ADMIN"].includes(data?.user?.role || ""),
        isAuthenticated: Boolean(data.userId)
    }
});

export const logoutFn = createServerFn().handler(async () => {
    const session = await useAppSession();
    await session.clear();
});

export const loginFn = createServerFn({ method: "POST" })
    .inputValidator((d: { sessionUser: Session }) => d)
    .handler(async ({ data }) => {
        const session = await useAppSession();
        const { id, isImpersonating, impersonatedBy, ...user } = data.sessionUser
        await session.update({
            userId: id,
            user,
            isImpersonating,
            impersonatedBy,
        });
    });

export const updateAppSessionFn = createServerFn({ method: "POST" })
    .inputValidator((d: Session) => d)
    .handler(async ({ data }) => {
        const session = await useAppSession();
        const { id, isImpersonating, impersonatedBy, ...user } = data
        await session.update({
            userId: id,
            user,
            isImpersonating,
            impersonatedBy,
        });
    });
