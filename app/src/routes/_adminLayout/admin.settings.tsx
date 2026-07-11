import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShopDetails } from "@/components/admin/settings/shop-details";
import { FeatureToggles } from "@/components/admin/settings/feature-toggles";
import { ShopPayments } from "@/components/admin/settings/shop-payments";
import DeliveryOverview from "@/components/admin/delivery/delivery-overview";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSettingsQuery } from "@/hooks/useGeneric";
import { PageLoader } from "@/components/generic/page-loader";

export const Route = createFileRoute("/_adminLayout/admin/settings")({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(useSettingsQuery());
    },
    component: RouteComponent,
    pendingComponent: () => <PageLoader variant="detail" />
});

function RouteComponent() {
    const { data: settings } = useSuspenseQuery(useSettingsQuery());

    return (
        <div className="py-4 px-2.5 md:px-8 slide-in">
            <h1 className="text-2xl font-semibold mb-4">Store Settings</h1>
            <Tabs defaultValue="shop-details">
                <TabsList className="mb-4">
                    <TabsTrigger value="shop-details">Shop Details</TabsTrigger>
                    <TabsTrigger value="details">Features</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery</TabsTrigger>
                </TabsList>
                <TabsContent value="shop-details">
                    <ShopDetails settings={settings || []} />
                </TabsContent>
                <TabsContent value="details">
                    <FeatureToggles toggles={settings || []} />
                </TabsContent>
                <TabsContent value="payments">
                    <ShopPayments settings={settings || []} />
                </TabsContent>
                <TabsContent value="delivery">
                    <DeliveryOverview />
                </TabsContent>
            </Tabs>
        </div>
    );
}
