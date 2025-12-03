import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { BankDetails, ConversationStatus, DeliveryOption, Message, PaginatedChat } from "@/schemas";
import { StatsTrends } from "@/types/models";
import { getStatsTrendsFn } from "@/server/admin.server";

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
    const session: any = null;

    return useMutation({
        mutationFn: async (message: string) => {
            const conversationId = sessionStorage.getItem("chatbotConversationId");
            const body = {
                user_id: session?.id,
                conversation_uuid: conversationId,
                user_message: message,
            };

            return await api.post<{ reply: string; conversation_uuid: string }>("/chat/", body);
        },
        onError: (error) => {
            toast.error("Failed to chat" + error);
        },
    });
};

export const useChats = (searchParams: ConversationParams) => {
    return useQuery({
        queryKey: ["chats"],
        queryFn: async () => await api.get<PaginatedChat>("/chat/", { params: { ...searchParams } }),
    });
};

export const useDeleteChat = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<Message>(`/chat/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            toast.success("Chat deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete chat" + error);
        },
    });
};

export const useStatsTrends = () =>
  queryOptions({
    queryKey: ["stats-trends"],
    queryFn: () => getStatsTrendsFn(),
  })

export const useDeliveryOptions = () => {
    return useQuery({
        queryKey: ["delivery", "available"],
        queryFn: async () => await api.get<DeliveryOption[]>("/delivery/available"),
    });
};

export const useAdminDeliveryOptions = () => {
    return useQuery({
        queryKey: ["delivery"],
        queryFn: async () => await api.get<DeliveryOption[]>("/delivery/"),
    });
};

export const useInvalidate = () => {
    const queryClient = useQueryClient();

    const invalidate = (key: string) => {
        queryClient.invalidateQueries({ queryKey: [key] });
    };

    return invalidate;
};
