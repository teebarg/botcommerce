import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteActivityFn, getMyActivitiesFn } from "@/server/activities.server";

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
