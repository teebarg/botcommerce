import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/utils/api";
import { BankDetails, Chat, ConversationStatus, DeliveryOption, Message } from "@/schemas";

export const useBankDetails = () => {
    return useQuery({
        queryKey: ["bank-details"],
        queryFn: () => api.get<BankDetails[]>("/bank-details/"),
    });
};

export const useChat = (uid: string) => {
    return useQuery({
        queryKey: ["chat", uid],
        queryFn: () => api.get<Chat>(`/chat/${uid}`),
        staleTime: 1000 * 60 * 5,
    });
};

export const useChatMutation = () => {
    return useMutation({
        mutationFn: async (message: string) => {
            const conversationUuid = localStorage.getItem("chat_session_id");
            return await api.post<{ reply: string; conversation_uuid: string }>("/chat/", {
                conversation_uuid: conversationUuid!,
                message: message,
            });
        },
        onError: (error) => {
            toast.error("Failed to chat" + error);
        },
    });
};


export const useChatStatusMutation = () => {
    return useMutation({
        mutationFn: async ({ conversationUuid, status }: { conversationUuid: string; status: ConversationStatus }) => {
            return await api.post<Message>("/chat/status", {
                conversation_uuid: conversationUuid,
                status,
            });
        },
        onError: (error) => {
            toast.error("Failed to chat" + error);
        },
    });
};

export const useAdminMessageMutation = () => {
    return useMutation({
        mutationFn: async ({ conversationUuid, message }: { conversationUuid: string; message: string }) => {
            return await api.post<Message>("/chat/support", {
                conversation_uuid: conversationUuid,
                message: message,
            });
        },
        onError: (error) => {
            toast.error("Failed to chat" + error);
        },
    });
};

export const useChatHandOff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ conversationUuid }: { conversationUuid: string }) => {
            return await api.post<Message>("/chat/handoff", {
                conversation_uuid: conversationUuid,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            toast.success("Chat handed off successfully");
        },
        onError: (error) => {
            toast.error("Failed to handoff chat" + error);
        },
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

export const useSendPushNotification = () => {
    return useMutation({
        mutationFn: async ({
            title,
            body,
            image,
            path,
            notificationId,
        }: {
            title: string;
            body: string;
            image?: string;
            path?: string;
            notificationId: string;
        }) =>
            await api.post<Message>("/notification/push", {
                notificationId,
                title,
                body,
                image,
                path,
            }),
        onSuccess: () => {
            toast.success("Push notification sent successfully");
        },
        onError: (error) => {
            toast.error("Failed to send push notification" + error);
        },
    });
};

export const useDeliveryOptions = () => {
    return useQuery({
        queryKey: ["delivery"],
        queryFn: () => api.get<DeliveryOption[]>("/delivery/"),
        staleTime: Infinity,
    });
};

