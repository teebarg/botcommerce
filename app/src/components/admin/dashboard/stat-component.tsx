import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import StatCard from "@/components/ui/stat-card";
import { currency } from "@/utils";
import EmptyState from "@/components/generic/empty";

const StatComponent = ({ summary }: { summary?: any }) => {
    const getPercentageChange = (growth: number): { value: string; trend: "up" | "down" | "neutral" } => {
        return {
            value: `${growth}%`,
            trend: growth > 0 ? "up" : growth < 0 ? "down" : "neutral",
        };
    };

    if (!summary) {
        return (
            <EmptyState
                icon={Package}
                title="No stats yet"
                description="There is currently no available stats."
            />
        );
    }

    return (
        <div className="px-4 md:px-10">
            <h2 className="text-lg font-medium">Store Overview</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    icon={<DollarSign size={20} />}
                    title="Total Revenue"
                    trend={getPercentageChange(summary?.revenueGrowth).trend}
                    trendValue={getPercentageChange(summary?.revenueGrowth).value}
                    value={currency(summary?.totalRevenue)}
                />

                <StatCard
                    icon={<ShoppingCart size={20} />}
                    title="Total Orders"
                    trend={getPercentageChange(summary?.ordersGrowth).trend}
                    trendValue={getPercentageChange(summary?.ordersGrowth).value}
                    value={summary?.totalOrders}
                />

                <StatCard icon={<Package size={20} />} title="Products" value={summary?.totalProducts} />

                <StatCard
                    icon={<Users size={20} />}
                    title="Customers"
                    trend={getPercentageChange(summary?.customersGrowth).trend}
                    trendValue={getPercentageChange(summary?.customersGrowth).value}
                    value={summary?.totalCustomers}
                />
            </div>
        </div>
    );
};

export default StatComponent;
