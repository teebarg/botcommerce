import { fetcher } from "./fetcher";

import { buildUrl } from "@/lib/util/util";
import { PaginatedAddress, Address, Message } from "@/types/models";
import { revalidate } from "@/actions/revalidate";
import { ApiResult, tryCatch } from "@/lib/try-catch";

// Address API methods
export const addressApi = {
    async all(input?: { search?: string; page?: number; limit?: number }): ApiResult<PaginatedAddress> {
        const searchParams = { search: input?.search || "", page: input?.page || 1, limit: input?.limit || 20 };
        const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/`, searchParams);
        const response = await tryCatch<PaginatedAddress>(fetcher(url, { next: { tags: ["addresses"] } }));

        return response;
    },
    async get(id: number): ApiResult<Address> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/${id}`;
        const response = await tryCatch<Address>(fetcher(url));

        return response;
    },
    async create(input: any): ApiResult<Address> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/`;
        const response = await tryCatch<Address>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("addresses");
        }

        return response;
    },
    async update(id: number, input: any): ApiResult<Address> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/${id}`;
        const response = await tryCatch<Address>(fetcher(url, { method: "PATCH", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("addresses");
            revalidate("cart");
            revalidate("orders");
        }

        return response;
    },
    async delete(id: number): ApiResult<Message> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/${id}`;
        const response = await tryCatch<Message>(fetcher(url, { method: "DELETE" }));

        if (!response.error) {
            revalidate("addresses");
        }

        return response;
    },
    async billing(input: any): ApiResult<Address> {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/address/billing`;
        const response = await tryCatch<Address>(fetcher(url, { method: "POST", body: JSON.stringify(input) }));

        if (!response.error) {
            revalidate("addresses");
        }

        return response;
    },
};
