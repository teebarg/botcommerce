"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "nui-react-icons";

import ActivityView from "./activity";

import { Activity } from "@/types/models";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/apis";
import { useWebSocket } from "@/providers/websocket";

const ActivityTray: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const { currentMessage, messages } = useWebSocket();

    useEffect(() => {
        fetchActivities();
    }, []);

    useEffect(() => {
        if (currentMessage?.type === "activities") {
            setActivities((prev) => [currentMessage, ...prev]);
        }
    }, [messages]);

    const fetchActivities = async () => {
        setLoading(true);
        const { data: activities, error } = await api.activities.getMyActivities();

        if (!activities || error) {
            return;
        }
        setActivities(activities);
        setLoading(false);
    };

    const onRemove = async (id: string | number) => {
        setActivities((prev) => prev.filter((activity) => activity.id !== id));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center text-default-500 cursor-pointer outline-none">
                    <Bell size={22} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[450px] p-0" sideOffset={5}>
                <div className="max-h-[calc(100vh-100px)] overflow-y-auto">
                    {loading ? <div className="h-full p-4">Loading...</div> : <ActivityView activities={activities} onRemove={onRemove} />}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ActivityTray;
