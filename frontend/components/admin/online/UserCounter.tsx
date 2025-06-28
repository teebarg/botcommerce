import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface UserCounterProps {
    icon: ReactNode;
    label: string;
    count: number;
    trend: string;
    color: "blue" | "green" | "purple" | "orange";
}

const UserCounter: React.FC<UserCounterProps> = ({ icon, label, count, trend, color }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        green: "bg-green-50 text-green-600 border-green-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200",
        orange: "bg-orange-50 text-orange-600 border-orange-200",
    };

    const trendColorClasses = {
        blue: "text-blue-500",
        green: "text-green-500",
        purple: "text-purple-500",
        orange: "text-orange-500",
    };

    return (
        <Card className={`border-2 ${colorClasses[color]} hover:shadow-md transition-all duration-200 hover:scale-105`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-white/50">{icon}</div>
                    <span className={`text-xs font-medium ${trendColorClasses[color]}`}>{trend}</span>
                </div>
                <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900 animate-pulse">{count}</p>
                    <p className="text-sm text-gray-600 font-medium">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserCounter;
