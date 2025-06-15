import { api } from "./base";

import { PaginatedAddress, Address } from "@/schemas";
import { revalidate } from "@/actions/revalidate";
import { ApiResult } from "@/lib/try-catch";
import { Message } from "@/schemas";

// Address API methods
export const addressApi = {
    async all(input?: { search?: string; page?: number; limit?: number }): ApiResult<PaginatedAddress> {
        const searchParams = { search: input?.search || "", page: input?.page || 1, limit: input?.limit || 20 };

        return await api.get<PaginatedAddress>("/address/", { params: { ...searchParams }, cache: "default", next: { tags: ["addresses"] } });
    },
    async get(id: number): ApiResult<Address> {
        return await api.get<Address>(`/address/${id}`);
    },
    async create(input: any): ApiResult<Address> {
        const response = await api.post<Address>(`/address/`, input);

        if (!response.error) {
            revalidate("addresses");
        }

        return response;
    },
    async update(id: number, input: any): ApiResult<Address> {
        const response = await api.patch<Address>(`/address/${id}`, input);

        if (!response.error) {
            revalidate("addresses");
        }

        return response;
    },
    async delete(id: number): ApiResult<Message> {
        const response = await api.delete<Message>(`/address/${id}`);

        if (!response.error) {
            revalidate("addresses");
        }

        return response;
    },
};
