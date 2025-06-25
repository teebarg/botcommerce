"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, Eye, TrendingUp } from "lucide-react";

import UserCounter from "./UserCounter";
import UserAvatar from "./UserAvatar";
import ActivityIndicator from "./ActivityIndicator";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OnlineUser {
    id: string;
    name: string;
    avatar?: string;
    isLoggedIn: boolean;
    lastActivity: Date;
    currentPage: string;
    location?: string;
}

const OnlineUsersWidget: React.FC = () => {
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [totalVisitors, setTotalVisitors] = useState(0);
    const [loggedInUsers, setLoggedInUsers] = useState(0);

    // Mock data generation
    const generateMockUsers = (): OnlineUser[] => {
        const names = ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Emma Brown", "Frank Miller"];
        const pages = ["/products", "/checkout", "/profile", "/cart", "/home", "/categories"];
        const locations = ["New York", "London", "Tokyo", "Paris", "Sydney", "Toronto"];

        return Array.from({ length: Math.floor(Math.random() * 12) + 5 }, (_, i) => ({
            id: `user-${i}`,
            name: Math.random() > 0.3 ? names[Math.floor(Math.random() * names.length)] : `Visitor ${i + 1}`,
            isLoggedIn: Math.random() > 0.4,
            lastActivity: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
            currentPage: pages[Math.floor(Math.random() * pages.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
        }));
    };

    // Simulate real-time updates
    useEffect(() => {
        const updateUsers = () => {
            const users = generateMockUsers();

            setOnlineUsers(users);
            setTotalVisitors(users.length);
            setLoggedInUsers(users.filter((user) => user.isLoggedIn).length);
        };

        updateUsers();
        const interval = setInterval(updateUsers, 5000);

        return () => clearInterval(interval);
    }, []);

    const anonymousVisitors = totalVisitors - loggedInUsers;

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <UserCounter color="blue" count={totalVisitors} icon={<Users className="h-5 w-5" />} label="Total Online" trend="+12%" />
                <UserCounter color="green" count={loggedInUsers} icon={<UserCheck className="h-5 w-5" />} label="Logged In" trend="+8%" />
                <UserCounter color="purple" count={anonymousVisitors} icon={<Eye className="h-5 w-5" />} label="Visitors" trend="+15%" />
                <UserCounter
                    color="orange"
                    count={Math.floor(totalVisitors * 0.7)}
                    icon={<TrendingUp className="h-5 w-5" />}
                    label="Active Now"
                    trend="+5%"
                />
            </div>

            {/* Live Users Feed */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <ActivityIndicator />
                            Live User Activity
                        </CardTitle>
                        <div className="text-sm text-gray-500">Updates every 5 seconds</div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {onlineUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex items-center gap-3">
                                    <UserAvatar user={user} />
                                    <div>
                                        <div className="font-medium text-gray-900">{user.isLoggedIn ? user.name : "Anonymous Visitor"}</div>
                                        <div className="text-sm text-gray-500">Viewing: {user.currentPage}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">{user.location}</div>
                                    <div className="text-xs text-gray-400">{Math.floor((Date.now() - user.lastActivity.getTime()) / 1000)}s ago</div>
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
