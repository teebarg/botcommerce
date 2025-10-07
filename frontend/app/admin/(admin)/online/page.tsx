import { Metadata } from "next";

import OnlineUsersWidget from "@/components/admin/online/OnlineUsersWidget";

export const metadata: Metadata = {
    title: "Online Users",
};

export default function OnlineUsers() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Online Users</h1>
                <p className="text-muted-foreground">Real-time user activity monitoring</p>
            </div>
            <OnlineUsersWidget />
        </div>
    );
}
