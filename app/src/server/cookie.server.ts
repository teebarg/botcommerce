import { createServerFn } from "@tanstack/react-start";
import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";
import z from "zod";

export const getCookieFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        return getCookie(data);
    });

const cookieSchema = z.object({
    key: z.string(),
    value: z.string(),
});

export const setCookieFn = createServerFn({ method: "GET" })
    .inputValidator(cookieSchema)
    .handler(async ({ data }) => {
        return setCookie(data.key, data.value);
    });

export const deleteCookieFn = createServerFn({ method: "GET" })
    .inputValidator((d: string) => d)
    .handler(async ({ data }) => {
        return deleteCookie(data);
    });
