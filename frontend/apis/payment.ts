import { ApiResult, tryCatch } from "@/lib/try-catch";
import { api } from "./base";
import type { PaymentInitialize, PaymentVerify, PaymentListResponse } from "@/types/payment";
import { fetcher } from "./fetcher";

export const paymentApi = {
    initialize: async (orderId: number): ApiResult<PaymentInitialize> => {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/initialize/${orderId}`;
        const response = await tryCatch<PaymentInitialize>(fetcher(url, { method: "POST" }));
        // const response = await api.post<{ data: PaymentInitialize }>(`/payments/initialize/${orderId}`);
        return response;
    },

    verify: async (reference: string): ApiResult<PaymentVerify> => {
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/verify/${reference}`;

        return await tryCatch<PaymentVerify>(fetcher(url));
        // const response = await api.get<{ data: PaymentVerify }>(`/payments/verify/${reference}`);
        // return response.data.data;
    },

    list: async (params?: { page?: number; limit?: number }): ApiResult<PaymentListResponse> => {
        const queryParams: Record<string, string> = {};
        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();

        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/list`;

        return await tryCatch<PaymentListResponse>(fetcher(url));

        // const response = await api.get<{ data: PaymentListResponse }>("/payments/list", {
        //     params: queryParams
        // });
        // return response.data.data;
    },
};
