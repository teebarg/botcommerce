export type SortOptions = "price_asc" | "price_desc" | "created_at";

export type IconProps = {
    color?: string;
    size?: string | number;
} & React.SVGAttributes<SVGElement>;

export interface DashboardSummary {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
}

export interface DashboardTrend {
    date: string; // format: "YYYY-MM" or "YYYY-MM-DD" depending on granularity
    orders: number;
    signups: number;
}

export interface StatsTrends {
    summary: DashboardSummary;
    trends: DashboardTrend[];
}
