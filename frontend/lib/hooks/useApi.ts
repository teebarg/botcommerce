import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { api } from "@/apis/client";
import { BankDetails, ConversationStatus, DeliveryOption, PaginatedConversation, User } from "@/schemas";
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

export const useChatMutation = () => {
    const { data: session } = useSession();

    return useMutation({
        mutationFn: async (message: string) => {
            const conversationId = sessionStorage.getItem("chatbotConversationId");
            const body = {
                user_id: session?.id,
                conversation_uuid: conversationId,
                user_message: message,
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            return response.json();
        },
        onError: (error) => {
            toast.error("Failed to chat" + error);
        },
    });
};

export const useConversations = (searchParams: ConversationParams) => {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: async () => await api.get<PaginatedConversation>("/conversation/", { params: { ...searchParams } }),
    });
};

export const useDeleteConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<User>(`/conversation/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast.success("Conversation deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete conversation" + error);
        },
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
