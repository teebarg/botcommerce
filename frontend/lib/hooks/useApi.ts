import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import {
    Address,
    BankDetails,
    Brand,
    Category,
    ChatMessage,
    Collection,
    ConversationStatus,
    FAQ,
    PaginatedConversation,
    PaginatedOrder,
    PaginatedProduct,
    PaginatedProductSearch,
    PaginatedReview,
    PaginatedUser,
    Review,
    StatsTrends,
    User,
    Wishlist,
} from "@/types/models";

export const useMe = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            return await api.get<User>("/users/me");
        },
        enabled: typeof window !== "undefined", // prevent server fetch
    });
};

export const useBank = () => {
    return useQuery({
        queryKey: ["bank"],
        queryFn: async () => {
            return await api.get<BankDetails[]>("/bank-details/");
        },
        enabled: typeof window !== "undefined",
    });
};

export const useAddress = (addressId: number) => {
    return useQuery({
        queryKey: ["cart-address", addressId],
        queryFn: async () => await api.get<Address>(`/address/${addressId}`),
        enabled: !!addressId, // prevents running when addressId is null
    });
};

export const useProductReviews = (productId: number) => {
    return useQuery({
        queryKey: ["product-reviews", productId],
        queryFn: async () => await api.get<Review[]>(`/product/${productId}/reviews`),
        enabled: !!productId, // prevents running when productId is null
    });
};

interface SearchParams {
    query?: string;
    categories?: string;
    collections?: string;
    min_price?: number | string;
    max_price?: number | string;
    page?: number;
    limit?: number;
    sort?: string;
}

export const useProductSearch = (searchParams: SearchParams) => {
    return useQuery({
        queryKey: ["product-search", searchParams],
        queryFn: async () => await api.get<PaginatedProductSearch>("/product/search", { params: { ...searchParams } }),
        enabled: !!searchParams, // prevents running when searchParams is null
    });
};

interface OrderSearchParams {
    query?: string;
    status?: string;
    skip?: number;
    take?: number;
    customer_id?: number;
    sort?: string;
}

export const useOrders = (searchParams: OrderSearchParams) => {
    return useQuery({
        queryKey: ["orders", { ...searchParams }],
        queryFn: async () => await api.get<PaginatedOrder>(`/order/`, { params: { ...searchParams } }),
        enabled: !!searchParams, // prevents running when searchParams is null
    });
};

interface ProductParams {
    query?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort?: string;
}

export const useProducts = (searchParams: ProductParams) => {
    return useQuery({
        queryKey: ["products", { ...searchParams }],
        queryFn: async () => await api.get<PaginatedProduct>(`/product/`, { params: { ...searchParams } }),
    });
};

export const useBrands = (query?: string) => {
    return useQuery({
        queryKey: ["brands", query],
        queryFn: async () => await api.get<Brand[]>(`/brand/all`, { params: { query: query ?? "" } }),
    });
};

export const useCategories = (query?: string) => {
    return useQuery({
        queryKey: ["categories", query],
        queryFn: async () => await api.get<Category[]>(`/category/`, { params: { query: query ?? "" } }),
    });
};

export const useCollections = (query?: string) => {
    return useQuery({
        queryKey: ["collections", query],
        queryFn: async () => await api.get<Collection[]>(`/collection/all`, { params: { query: query ?? "" } }),
    });
};

interface CustomerParams {
    query?: string;
    role?: "ADMIN" | "CUSTOMER";
    status?: "ACTIVE" | "INACTIVE" | "PENDING";
    page?: number;
    limit?: number;
    sort?: string;
}

export const useCustomers = (searchParams: CustomerParams) => {
    return useQuery({
        queryKey: ["customers", { ...searchParams }],
        queryFn: async () => await api.get<PaginatedUser>(`/users/`, { params: { ...searchParams } }),
    });
};

interface ConversationParams {
    user_id?: number;
    status?: ConversationStatus;
    skip?: number;
    limit?: number;
}

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

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<User>(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            toast.success("Customer deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete customer" + error);
        },
    });
};

export const useUserWishlist = () => {
    return useQuery({
        queryKey: ["user-wishlist"],
        queryFn: async () => await api.get<Wishlist>(`/users/wishlist`),
    });
};

interface Stat {
    orders_count?: number;
    total_revenue?: number;
    products_count?: number;
    customers_count?: number;
}

export const useStats = () => {
    return useQuery({
        queryKey: ["stats"],
        queryFn: async () => await api.get<Stat>("/stats"),
    });
};

export const useStatsTrends = () => {
    return useQuery({
        queryKey: ["stats-trends"],
        queryFn: async () => await api.get<StatsTrends>("/stats/trends"),
    });
};

export const useFaqs = () => {
    return useQuery({
        queryKey: ["faqs"],
        queryFn: async () => await api.get<FAQ[]>("/faq/"),
    });
};

export const useDeleteFaq = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => await api.delete<FAQ>(`/faq/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["faqs"] });
            toast.success("FAQ deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete FAQ" + error);
        },
    });
};

interface ReviewParams {
    skip?: number;
    limit?: number;
}

export const useReviews = (params: ReviewParams) => {
    return useQuery({
        queryKey: ["reviews"],
        queryFn: async () => await api.get<PaginatedReview>("/reviews/", { params: { ...params } }),
    });
};

// export const useDeleteCustomer = () => {
//     const queryClient = useQueryClient();
//     const { mutateAsync } = useMutation({
//         mutationFn: async (id: number) => await api.delete<User>(`/users/${id}`),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ["customers"] });
//             toast.success("Customer deleted successfully");
//         },
//         onError: (error) => {
//             toast.error("Failed to delete customer");
//         },
//     });

//     return mutateAsync;
// };

export const useInvalidate = () => {
    const queryClient = useQueryClient();

    const invalidate = (key: string) => {
        queryClient.invalidateQueries({ queryKey: [key] });
    };

    return invalidate;
};
