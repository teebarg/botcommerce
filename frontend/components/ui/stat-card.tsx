import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    description?: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, trend, trendValue, className }) => {
    return (
        <div className={cn("bg-content1 rounded-lg p-4 shadow-lg", className)}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-default-500">{title}</p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>
                    {description && <p className="text-sm text-default-500 mt-1">{description}</p>}

                    {trend && trendValue && (
                        <div className="flex items-center mt-2">
                            <span
                                className={cn(
                                    "text-xs font-medium rounded-full px-2 py-0.5",
                                    trend === "up" && "bg-success/20 text-success",
                                    trend === "down" && "bg-danger/20 text-danger",
                                    trend === "neutral" && "bg-default-100 text-default-600"
                                )}
                            >
                                {trendValue}
                            </span>
                        </div>
                    )}
                </div>
                {icon && <div className="p-2 rounded-full bg-secondary/10 text-secondary">{icon}</div>}
            </div>
        </div>
    );
};

export default StatCard;
