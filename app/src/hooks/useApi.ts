import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouteContext } from "@tanstack/react-router";
import { clientApi } from "@/utils/api.client";
import { BankDetails, Chat, DeliveryOption, Message } from "@/schemas";

export const useBankDetails = () => {
    return useQuery({
        queryKey: ["bank-details"],
        queryFn: () => clientApi.get<BankDetails[]>("/bank-details/"),
    });
};

export const useChat = (uid: string) => {
    return useQuery({
        queryKey: ["chats", uid],
        queryFn: () => clientApi.get<Chat>(`/chat/${uid}`),
        staleTime: 1000 * 60 * 5,
    });
};

export const useChatMutation = () => {
    return useMutation({
        mutationFn: async (message: string) => {
            const conversationUuid = sessionStorage.getItem("chat_session_id");
            return await clientApi.post<{ reply: string; conversation_uuid: string }>("/chat/", {
                conversation_uuid: conversationUuid!,
                message: message,
            });
        },
        onError: (error) => {
            toast.error("Failed to chat" + error);
        },
    });
};

export const useAdminMessageMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ conversationUuid, message }: { conversationUuid: string; message: string }) => {
            return await clientApi.post<{ reply: string; conversation_uuid: string }>("/chat/support", {
                conversation_uuid: conversationUuid,
                message: message,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            toast.success("Successfull!");
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
            return await clientApi.post<Message>("/chat/handoff", {
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
        mutationFn: async (id: number) => await clientApi.delete<Message>(`/chat/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            toast.success("Chat deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete chat" + error);
        },
    });
};

export const useDeliveryOptions = () => {
    return useQuery({
        queryKey: ["delivery"],
        queryFn: () => clientApi.get<DeliveryOption[]>("/delivery/"),
        staleTime: Infinity,
    });
};

export const useInvalidate = () => {
    const queryClient = useQueryClient();

    const invalidate = (key: string) => {
        queryClient.invalidateQueries({ queryKey: [key] });
    };

    return invalidate;
};
