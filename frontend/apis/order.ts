import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { Message, Order, PaginatedOrder } from "@/types/models";
import { ApiResult, tryCatch } from "@/lib/try-catch";
import { revalidate } from "@/actions/revalidate";

// Order API methods
export const orderApi = {
    async query(input?: { search?: string; skip?: number; take?: number }): ApiResult<PaginatedOrder> {
        const searchParams = { search: input?.search || "", skip: input?.skip || 0, take: input?.take || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`, searchParams);

        return await tryCatch<PaginatedOrder>(fetcher(url, { next: { tags: ["orders"] } }));
    },
    async get(id: string): ApiResult<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/${id}`;

        return await tryCatch<Order>(fetcher(url));
    },
    async create(input: Order): ApiResult<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/`;
        const response = await tryCatch<Order>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("orders");
        }

        return response;
    },
    async update(id: string, input: Order): ApiResult<Order> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/${id}`;
        const response = await tryCatch<Order>(fetcher(url, { method: "PATCH", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("orders");
        }

        return response;
    },
    async delete(id: string): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/${id}`;
        const response = await tryCatch<Message>(fetcher(url, { method: "DELETE" }));

        if (!response.error) {
            revalidate("orders");
        }

        return response;
    },
};

// import { api } from "./base";
// import { OrderResponse, OrderListResponse, OrderCreate, OrderUpdate } from "@/types/order";

// export const orderApi = {
//     list: async (params?: {
//         page?: number;
//         limit?: number;
//         status?: string;
//         search?: string;
//         start_date?: string;
//         end_date?: string;
//         customer_id?: number;
//     }): Promise<OrderListResponse> => {
//         const response = await api.get("/orders", { params });
//         return response.data;
//     },

//     get: async (id: string): Promise<OrderResponse> => {
//         const response = await api.get(`/orders/${id}`);
//         return response.data;
//     },

//     create: async (data: OrderCreate): Promise<OrderResponse> => {
//         const response = await api.post("/orders", data);
//         return response.data;
//     },

//     update: async (id: string, data: OrderUpdate): Promise<OrderResponse> => {
//         const response = await api.put(`/orders/${id}`, data);
//         return response.data;
//     },

//     cancel: async (id: string): Promise<OrderResponse> => {
//         const response = await api.post(`/orders/${id}/cancel`);
//         return response.data;
//     },

//     fulfill: async (id: string): Promise<OrderResponse> => {
//         const response = await api.post(`/orders/${id}/fulfill`);
//         return response.data;
//     },

//     refund: async (id: string): Promise<OrderResponse> => {
//         const response = await api.post(`/orders/${id}/refund`);
//         return response.data;
//     },
// };
