import { useUserRecentlyViewed } from "@/hooks/useUser";
import ProductsCarousel from "@/components/store/product-carousel";
import { useRouteContext } from "@tanstack/react-router";

interface RecentlyViewedSectionProps {
    limit?: number;
}

export default function RecentlyViewedSection({ limit = 5 }: RecentlyViewedSectionProps) {
    const { session } = useRouteContext({ strict: false });
    const { data, isLoading } = useUserRecentlyViewed(limit, Boolean(session?.user));

    if (!data || data.length === 0 || isLoading) return null;

    return (
        <div className="py-8 px-2 bg-linear-to-b from-card/30 to-background">
            <ProductsCarousel products={data || []} />
        </div>
    );
}
