import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, DollarSign, Percent, Users, Tag } from "lucide-react";
import { useCouponsAnalytics } from "@/hooks/useCoupon";

const AnalyticsStats = () => {
    const { data } = useCouponsAnalytics();

    const totalCoupons = data?.total_coupons || 0;
    const usedCoupons = data?.used_coupons || 0;
    const totalRedemptions = data?.total_redemptions || 0;
    const avgRedemptionRate = data?.avg_redemption_rate || 0;
    const activeCoupons = data?.active_coupons || 0;

    return (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
                    <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalCoupons}</div>
                    <p className="text-xs text-muted-foreground">{activeCoupons} active</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalRedemptions}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Used Coupons</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{usedCoupons}</div>
                    <p className="text-xs text-muted-foreground flex items-center">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Discounts given
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Redemption Rate</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{avgRedemptionRate}%</div>
                    <p className="text-xs text-muted-foreground">Of max usage limit</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsStats;
