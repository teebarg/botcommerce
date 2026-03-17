import type React from "react";
import { Bell } from "lucide-react";
import ActivityView from "./activity";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/utils/api.client";
import { Activity } from "@/schemas";

const ActivityTray: React.FC = () => {
    const { data: activities, isLoading } = useQuery({
        queryKey: ["activity"],
        queryFn: async () => await clientApi.get<Activity[]>("/activities/me"),
    });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center text-muted-foreground cursor-pointer outline-none">
                    <Bell size={22} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="md:w-[450px] w-full p-0" sideOffset={5}>
                <div className="max-h-[calc(100svh-100px)] overflow-y-auto overflow-x-hidden">
                    {isLoading ? <div className="h-full p-4">Loading your activities...</div> : <ActivityView activities={activities} />}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ActivityTray;
