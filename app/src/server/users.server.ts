import { api } from "@/utils/api";
import { createServerFn } from "@tanstack/react-start";
import type { Session, User } from "@/schemas";
import { useAppSession } from "@/utils/session";

export const getMeFn = createServerFn({ method: "GET" }).handler(async () => {
    return await api.get<User>("/users/me");
});

export const getUserFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data: email }) => {
        return await api.get<User>(`/users/get-user?email=${email}`);
    });

export const logoutFn = createServerFn().handler(async () => {
    const session = await useAppSession();
    session.clear();
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
