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
