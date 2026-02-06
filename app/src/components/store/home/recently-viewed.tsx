import { useUserRecentlyViewed } from "@/hooks/useUser";
import { useRouteContext } from "@tanstack/react-router";
import ProductSection from "../product-section";

interface RecentlyViewedSectionProps {
    limit?: number;
}

export default function RecentlyViewedSection({ limit = 5 }: RecentlyViewedSectionProps) {
    const { session } = useRouteContext({ strict: false });
    const { data, isLoading } = useUserRecentlyViewed(limit, Boolean(session?.user));

    if (!data || data.length === 0 || isLoading) return null;
    return <ProductSection title="Featured" products={data || []} href="/collections/featured" showGradient />;
}
