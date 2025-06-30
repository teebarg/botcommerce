import { api } from "@/apis/client";
import { Order } from "@/schemas";
import { ApiResult, tryCatch } from "@/lib/try-catch";

export const orderApi = {
    async get(id: string): ApiResult<Order> {
        return await tryCatch<Order>(api.get(`/order/${id}`));
    },
};
