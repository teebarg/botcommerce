import type React from "react";
import { Bell } from "lucide-react";
import ActivityView from "./activity";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { Activity } from "@/schemas";

const ActivityTray: React.FC = () => {
    const { data: activities, isLoading } = useQuery({
        queryKey: ["activity"],
        queryFn: async () => await api.get<Activity[]>("/activities/me"),
    });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground cursor-pointer">
                    <Bell size={22} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="md:w-[450px] w-full p-0" sideOffset={5}>
                <div className="max-h-[calc(100svh-100px)] overflow-y-auto overflow-x-hidden">
                    <ActivityView activities={activities} isLoading={isLoading} />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ActivityTray;
