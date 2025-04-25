"use client";

import { useState, useEffect } from "react";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

import StatCard from "@/components/ui/stat-card";
import { currency } from "@/lib/util/util";

// In a real app, this would come from your API
const mockStats = {
    revenue: { value: 12945.5, previousValue: 9876.25 },
    orders: { value: 156, previousValue: 132 },
    products: { value: 78, previousValue: 65 },
    customers: { value: 1243, previousValue: 1015 },
};

const StatComponent: React.FC = () => {
    const [stats, setStats] = useState(mockStats);

    // This would be a real API call in a production app
    useEffect(() => {
        // Simulate API loading
        const timer = setTimeout(() => {
            setStats(mockStats);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const getPercentageChange = (current: number, previous: number): { value: string; trend: "up" | "down" | "neutral" } => {
        const change = ((current - previous) / previous) * 100;

        return {
            value: `${change.toFixed(1)}%`,
            trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
        };
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-medium mb-3">Store Overview</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    icon={<DollarSign size={20} />}
                    title="Total Revenue"
                    trend={getPercentageChange(stats.revenue.value, stats.revenue.previousValue).trend}
                    trendValue={getPercentageChange(stats.revenue.value, stats.revenue.previousValue).value}
                    value={currency(stats.revenue.value)}
                />

                <StatCard
                    icon={<ShoppingCart size={20} />}
                    title="Total Orders"
                    trend={getPercentageChange(stats.orders.value, stats.orders.previousValue).trend}
                    trendValue={getPercentageChange(stats.orders.value, stats.orders.previousValue).value}
                    value={stats.orders.value}
                />

                <StatCard
                    icon={<Package size={20} />}
                    title="Products"
                    trend={getPercentageChange(stats.products.value, stats.products.previousValue).trend}
                    trendValue={getPercentageChange(stats.products.value, stats.products.previousValue).value}
                    value={stats.products.value}
                />

                <StatCard
                    icon={<Users size={20} />}
                    title="Customers"
                    trend={getPercentageChange(stats.customers.value, stats.customers.previousValue).trend}
                    trendValue={getPercentageChange(stats.customers.value, stats.customers.previousValue).value}
                    value={stats.customers.value}
                />
            </div>
        </div>
    );
};

export default StatComponent;
