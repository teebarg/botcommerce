import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
        <div className={cn("bg-secondary rounded-lg p-4 shadow-lg", className)}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium">{title}</p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>
                    {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}

                    {trend && trendValue && (
                        <Badge variant={trend === "up" ? "emerald" : trend === "down" ? "destructive" : "default"}>{trendValue}</Badge>
                    )}
                </div>
                {icon && <div className="p-2 rounded-full bg-accent/10 text-accent">{icon}</div>}
            </div>
        </div>
    );
};

export default StatCard;
