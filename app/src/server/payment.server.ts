import { serverApi } from "@/apis/server-client";
import { createServerFn } from "@tanstack/react-start";
import { Order } from "@/schemas";
import z from "zod";


export const verifyPaymentFn = createServerFn({ method: "GET" })
    .inputValidator((input: unknown) => z.object({ reference: z.string() }).parse(input))
    .handler(async ({data}) => {
    const res = await serverApi.get<Order>(`/payment/verify/${data?.reference}`);
    return res;
});