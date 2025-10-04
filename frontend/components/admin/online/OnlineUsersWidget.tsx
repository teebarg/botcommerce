"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, Eye, TrendingUp } from "lucide-react";

import UserCounter from "./UserCounter";
import UserAvatar from "./UserAvatar";
import ActivityIndicator from "./ActivityIndicator";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/providers/websocket";

interface Session {
    id: string;
    type: string;
    email?: string;
    path: string;
    location: string;
    last_seen: number;
    name: string;
}

const OnlineUsersWidget: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const { currentMessage } = useWebSocket();

    useEffect(() => {
        if (currentMessage?.type === "online-users") {
            setSessions(currentMessage.users);
        }
    }, [currentMessage]);

    const total = sessions.length;
    const loggedIn = sessions.filter((s) => s.type === "user").length;
    const guests = total - loggedIn;
    const active = sessions.filter((s) => s.last_seen <= 60).length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <UserCounter color="blue" count={total} icon={<Users className="h-5 w-5" />} label="Total Online" trend="+12%" />
                <UserCounter color="green" count={loggedIn} icon={<UserCheck className="h-5 w-5" />} label="Logged In" trend="+8%" />
                <UserCounter color="purple" count={guests} icon={<Eye className="h-5 w-5" />} label="Visitors" trend="+15%" />
                <UserCounter color="orange" count={active} icon={<TrendingUp className="h-5 w-5" />} label="Active Now" trend="+5%" />
            </div>

            <Card className="shadow-lg border-0 bg-secondary">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <ActivityIndicator />
                        Live User Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {sessions.map((user: Session, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-card">
                                <div className="flex items-center gap-3">
                                    <UserAvatar user={user} />
                                    <div>
                                        <div className="font-medium">{user.email !== "Unknown" ? user.email : "Anonymous Visitor"}</div>
                                        <div className="text-sm text-muted-foreground">Viewing: {user.path}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground">{user.location}</div>
                                    <div className="text-xs text-muted-foreground">{user.last_seen}s ago</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OnlineUsersWidget;
