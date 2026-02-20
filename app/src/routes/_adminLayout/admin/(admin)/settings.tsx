import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShopDetails } from "@/components/admin/settings/shop-details";
import { FeatureToggles } from "@/components/admin/settings/feature-toggles";
import { ShopPayments } from "@/components/admin/settings/shop-payments";
import DeliveryOverview from "@/components/admin/delivery/delivery-overview";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getShopSettingsFn } from "@/server/generic.server";

const useShopSettingsQuery = () =>
    queryOptions({
        queryKey: ["shop-settings"],
        queryFn: () => getShopSettingsFn(),
    });

export const Route = createFileRoute("/_adminLayout/admin/(admin)/settings")({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(useShopSettingsQuery());
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { data: settings } = useSuspenseQuery(useShopSettingsQuery());

    return (
        <div className="py-8 px-2 md:px-8">
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
