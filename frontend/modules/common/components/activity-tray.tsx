"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "nui-react-icons";
import { useWebSocket } from "@lib/hooks/use-websocket";
import useWatch from "@lib/hooks/use-watch";

import Activity from "./activity";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ActivityTray: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const { messages: wsMessages, connect: initializeWebsocket, disconnect: disconnectWebsocket } = useWebSocket({ type: ["activities"] });

    const currentMessage = wsMessages[wsMessages.length - 1];

    useEffect(() => {
        fetchActivities();
        initializeWebsocket();

        return () => {
            disconnectWebsocket();
        };
    }, []);

    useWatch(currentMessage, () => {
        // Update the live activity message
        setActivities((prev) => [currentMessage, ...prev]);
    });

    const fetchActivities = async () => {
        setLoading(true);
        // const { data, error } = await fetch<any>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activities/`);
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
                    {loading ? <div className="h-full p-4">Loading...</div> : <Activity activities={activities} onRemove={onRemove} />}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ActivityTray;
