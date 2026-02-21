import { api } from "@/utils/api.server";
import { createServerFn } from "@tanstack/react-start";
import type { Order } from "@/schemas";
import { z } from "zod";
import { deleteCookie } from "@tanstack/react-start/server";

const CART_COOKIE = "_cart_id";

export const verifyPaymentFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => z.object({ reference: z.string() }).parse(input))
    .handler(async ({ data }) => {
        const res = await api.get<Order>(`/payment/verify/${data?.reference}`);
        deleteCookie(CART_COOKIE, { path: "/" });
        return res;
    });
