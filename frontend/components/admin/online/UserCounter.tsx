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
        blue: "bg-blue-100 dark:bg-blue-500 text-blue-600 dark:text-white",
        green: "bg-green-100 dark:bg-green-500 text-green-600 dark:text-white",
        purple: "bg-purple-100 dark:bg-purple-500 text-purple-600 dark:text-white",
        orange: "bg-orange-100 dark:bg-orange-500 text-orange-600 dark:text-white",
    };

    const trendColorClasses = {
        blue: "text-blue-500 dark:text-blue-900",
        green: "text-green-500 dark:text-green-900",
        purple: "text-purple-500 dark:text-purple-900",
        orange: "text-orange-500 dark:text-orange-900",
    };

    return (
        <Card className={`${colorClasses[color]} hover:shadow-md transition-all duration-200 hover:scale-105`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-white/10">{icon}</div>
                    <span className={`text-xs font-medium ${trendColorClasses[color]}`}>{trend}</span>
                </div>
                <div className="space-y-1">
                    <p className="text-2xl font-bold animate-pulse">{count}</p>
                    <p className="text-sm text-muted-foreground font-medium">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserCounter;
