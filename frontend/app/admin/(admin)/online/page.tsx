import { Metadata } from "next";

import OnlineUsersWidget from "@/components/admin/online/OnlineUsersWidget";

export const metadata: Metadata = {
    title: "Online Users",
};

export default function OnlineUsers() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-default-900">Online Users</h1>
                <p className="text-default-500">Real-time user activity monitoring</p>
            </div>

            <OnlineUsersWidget />
        </div>
    );
}
