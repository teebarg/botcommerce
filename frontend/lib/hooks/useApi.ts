import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { BankDetails, ChatMessage, ConversationStatus, DeliveryOption, PaginatedConversation, User } from "@/schemas";
import { StatsTrends } from "@/types/models";

interface ConversationParams {
    user_id?: number;
    status?: ConversationStatus;
    skip?: number;
    limit?: number;
}

export const useBankDetails = () => {
    return useQuery({
        queryKey: ["bank-details"],
        queryFn: async () => {
            return await api.get<BankDetails[]>("/bank-details/");
        },
    });
};

export const useConversations = (searchParams: ConversationParams) => {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: async () => await api.get<PaginatedConversation>(`/conversation/conversations/`, { params: { ...searchParams } }),
    });
};

export const useDeleteConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<User>(`/conversation/conversations/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast.success("Conversation deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete conversation" + error);
        },
    });
};

export const useConversationMessages = (uid: string) => {
    return useQuery({
        queryKey: ["conversations", uid],
        queryFn: async () => await api.get<ChatMessage[]>(`/conversation/conversations/${uid}/messages`),
    });
};

export const useStatsTrends = () => {
    return useQuery({
        queryKey: ["stats-trends"],
        queryFn: async () => await api.get<StatsTrends>("/stats/trends"),
    });
};

export const useDeliveryOptions = () => {
    return useQuery({
        queryKey: ["delivery", "available"],
        queryFn: async () => await api.get<DeliveryOption[]>("/delivery/available"),
    });
};

export const useAdminDeliveryOptions = () => {
    return useQuery({
        queryKey: ["delivery"],
        queryFn: async () => await api.get<DeliveryOption[]>("/delivery"),
    });
};

export const useInvalidate = () => {
    const queryClient = useQueryClient();

    const invalidate = (key: string) => {
        queryClient.invalidateQueries({ queryKey: [key] });
    };

    return invalidate;
};
