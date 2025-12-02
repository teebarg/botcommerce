import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { serverApi } from "@/apis/server-client";
import { Category } from "@/schemas";

// Validation schemas
export const credentialsSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = credentialsSchema.extend({
    redirectUrl: z.string().optional(),
    fullName: z.string().optional(),
});

export const oauthSchema = z.object({
    redirectTo: z.string().optional(),
});

export const GetCategoriesFn = createServerFn({ method: "GET" }).handler(async () => {
    const data = await serverApi.get<Category[]>(`/category/`, { params: { query: "" } });
    return data;
});
