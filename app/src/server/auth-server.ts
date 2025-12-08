import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { authConfig } from "@/utils/auth";
import { getSession } from "start-authjs";

export const credentialsSchema = z.object({
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
    const request = getRequest();
    return await getSession(request, authConfig);
});
