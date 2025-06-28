"use client";

import React, { useEffect } from "react";
import { Bell } from "nui-react-icons";

import ActivityView from "./activity";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useWebSocket } from "@/providers/websocket";
import { useMyActivities } from "@/lib/hooks/useActivities";
import { useInvalidate } from "@/lib/hooks/useApi";

const ActivityTray: React.FC = () => {
    const invalidate = useInvalidate()
    const { currentMessage, messages } = useWebSocket();
    const { data: activities, isLoading } = useMyActivities();

    useEffect(() => {
        if (currentMessage?.type === "activities") {
            invalidate("activities")
        }
    }, [messages]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center text-default-500 cursor-pointer outline-none">
                    <Bell size={22} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[450px] p-0" sideOffset={5}>
                <div className="max-h-[calc(100vh-100px)] overflow-y-auto overflow-x-hidden">
                    {isLoading ? <div className="h-full p-4">Loading...</div> : <ActivityView activities={activities} />}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ActivityTray;
