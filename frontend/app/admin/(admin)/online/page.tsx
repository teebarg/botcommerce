import OnlineUsersWidget from "@/components/admin/online/OnlineUsersWidget";

export default function OnlineUsers() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">E-Commerce Dashboard</h1>
                    <p className="text-lg text-gray-600">Real-time user activity monitoring</p>
                </div>

                <OnlineUsersWidget />
            </div>
        </div>
    );
}
