import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/apis/client";
import { Activity, PaginatedActivity } from "@/schemas";

const LIMIT = 10;

export const useActivities = () => {
    return useInfiniteQuery({
        queryKey: ["activities"],
        queryFn: async ({ pageParam = 0 }) => await api.get<PaginatedActivity>("/activities/", { params: { skip: pageParam, limit: LIMIT } }),
        getNextPageParam: (lastPage: PaginatedActivity) => {
            const nextSkip = lastPage.skip + lastPage.limit;
            const hasMore = nextSkip < lastPage.total_count;

            return hasMore ? nextSkip : undefined;
        },
        initialPageParam: 0,
    });
};

export const useDeleteActivity = () => {
    return useMutation({
        mutationFn: async (id: number) => await api.delete<void>(`/activities/${id}`),
        onSuccess: () => {
            toast.success("Activity deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete FAQ" + error);
        },
    });
};
