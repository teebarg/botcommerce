import { api } from "./base";

import { BankDetails, Message } from "@/types/models";
import { revalidate } from "@/actions/revalidate";
import { ApiResult } from "@/lib/try-catch";

export const bankSettingsApi = {
    async getBankDetails(cache: "force-cache" | "no-cache" = "force-cache"): ApiResult<BankDetails[]> {
        const res = await api.get<BankDetails[]>("/bank-details/", { next: { tags: ["banks-details"] }, cache });

        return res;
    },
    async createBankDetails(input: { bank_name: string; account_name: string; account_number: string }): ApiResult<BankDetails> {
        const response = await api.post<BankDetails>("/bank-details/", input);

        if (!response.error) {
            revalidate("banks-details");
        }

        return response;
    },
    async updateBankDetails(id: number, input: { bank_name: string; account_name: string; account_number: string }): ApiResult<BankDetails> {
        const response = await api.patch<BankDetails>(`/bank-details/${id}`, input);

        if (!response.error) {
            revalidate("banks-details");
        }

        return response;
    },
    async deleteBankDetails(id: number): ApiResult<Message> {
        const response = await api.delete<Message>(`/bank-details/${id}`);

        if (!response.error) {
            revalidate("banks-details");
        }

        return response;
    },
};
