import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chatMutationFn, deleteChatFn, getAdminDeliveryOptionsFn, getBankDetailsFn, getDeliveryOptionsFn } from "@/server/generic.server";
import { useRouteContext } from "@tanstack/react-router";

export const useBankDetails = () => {
    return useQuery({
        queryKey: ["bank-details"],
        queryFn: () => getBankDetailsFn(),
    });
};

export const useChatMutation = () => {
    const { session } = useRouteContext({ strict: false });

    return useMutation({
        mutationFn: async (message: string) => {
            const conversationId = sessionStorage.getItem("chatbotConversationId");
            const body = {
                user_id: session?.id,
                conversation_uuid: conversationId!,
                user_message: message,
            };

            return await chatMutationFn({ data: body });
        },
        onError: (error) => {
            toast.error("Failed to chat" + error);
        },
    });
};

export const useDeleteChat = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await deleteChatFn({ data: id }),
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
        queryKey: ["delivery", "available"],
        queryFn: () => getDeliveryOptionsFn(),
    });
};

export const useAdminDeliveryOptions = () => {
    return useQuery({
        queryKey: ["delivery"],
        queryFn: () => getAdminDeliveryOptionsFn(),
    });
};

export const useInvalidate = () => {
    const queryClient = useQueryClient();

    const invalidate = (key: string) => {
        queryClient.invalidateQueries({ queryKey: [key] });
    };

    return invalidate;
};
