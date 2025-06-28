import OnlineUsersWidget from "@/components/admin/online/OnlineUsersWidget";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Online Users",
};

export default function OnlineUsers() {
    return (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Online Users</h1>
                    <p className="text-gray-600">Real-time user activity monitoring</p>
                </div>

                <OnlineUsersWidget />
            </div>
        </div>
    );
}
