import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PaginatedActivity } from "@/schemas";
import { deleteActivityFn, getActivitiesFn, getMyActivitiesFn } from "@/server/activities.server";

const LIMIT = 10;

export const useActivities = () => {
    return useInfiniteQuery({
        queryKey: ["activities"],
        queryFn: ({ pageParam = 0 }) => getActivitiesFn({ data: { skip: pageParam as number, limit: LIMIT } }),
        getNextPageParam: (lastPage: PaginatedActivity) => {
            const nextSkip = lastPage.skip + lastPage.limit;
            const hasMore = nextSkip < lastPage.total_count;

            return hasMore ? nextSkip : undefined;
        },
        initialPageParam: 0,
    });
};

export const useMyActivities = () => {
    // const { data: session } = useSession();

    return useQuery({
        queryKey: ["activity"],
        // The server function handles the API call
        queryFn: () => getMyActivitiesFn(),
        // enabled: Boolean(session?.user),
    });
};

export const useDeleteActivity = () => {
    return useMutation({
        mutationFn: async (id: number) => await deleteActivityFn({ data: id }),
        onSuccess: () => {
            toast.success("Activity deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete FAQ" + error);
        },
    });
};
