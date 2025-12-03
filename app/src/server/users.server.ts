import { serverApi } from "@/apis/server-client";
import { PaginatedUser } from "@/schemas";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";

export const UserSearchSchema = z.object({
    query: z.string().optional(),
    role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),
    skip: z.number().optional(),
    limit: z.number().optional(),
    sort: z.string().optional(),
});

export const getUsersFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => UserSearchSchema.parse(input))
    .handler(async ({ data }) => {
        const res = await serverApi.get<PaginatedUser>("/users/", { params: { ...data } });
        console.log("🚀 ~ file: admin.server.tsx:10 ~ res:", res);
        return res;
    });