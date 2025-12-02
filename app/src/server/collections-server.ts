import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

export const GetProductsFn = createServerFn({ method: "GET" })
    .inputValidator((data: any) => data)
    .handler(async ({ data }) => {
        console.log("🚀 ~ file: product.server.ts:8 ~ data:-----", data)
        const res = await serverApi.get<PaginatedProductSearch>("/product/", { params: { skip: 0, ...data } });
        return res;
    });
