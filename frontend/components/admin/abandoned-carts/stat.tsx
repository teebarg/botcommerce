import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currency } from "@/lib/utils";
import { ShoppingCart, DollarSign, TrendingUp, BarChart3 } from "lucide-react";

interface Stat {
    active_count: number;
    abandoned_count: number;
    converted_count: number;
    potential_revenue: number;
}

interface AbandonedCartStatsProps {
    stat: Stat;
}

export const AbandonedCartStats = ({ stat }: AbandonedCartStatsProps) => {
    const stats = [
        {
            title: "Active Carts",
            value: stat.active_count.toString(),
            icon: ShoppingCart,
            description: "Currently abandoned",
            color: "text-amber-500",
        },
        {
            title: "Abandoned Carts",
            value: stat.abandoned_count.toString(),
            icon: DollarSign,
            description: "",
            color: "text-primary",
        },
        {
            title: "Converted Carts",
            value: stat.converted_count.toString(),
            icon: BarChart3,
            description: "",
            color: "text-primary",
        },
        {
            title: "Total Abandoned Value",
            value: currency(stat.potential_revenue),
            icon: TrendingUp,
            description: "Potential revenue",
            color: "text-green-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-primary/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
