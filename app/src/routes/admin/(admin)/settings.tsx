import { createFileRoute } from "@tanstack/react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShopSettings } from "@/hooks/useGeneric";
import ComponentLoader from "@/components/component-loader";
import { ShopDetails } from "@/components/admin/settings/shop-details";
import { FeatureToggles } from "@/components/admin/settings/feature-toggles";
import { ShopPayments } from "@/components/admin/settings/shop-payments";
import DeliveryOverview from "@/components/admin/delivery/delivery-overview";

export const Route = createFileRoute("/admin/(admin)/settings")({
    component: RouteComponent,
});

function RouteComponent() {
    const { data: settings, isLoading } = useShopSettings();

    return (
        <div className="py-8 px-2 md:px-8">
            <h1 className="text-2xl font-semibold mb-4">Store Settings</h1>
            {isLoading ? (
                <ComponentLoader className="h-[80vh]" />
            ) : (
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
            )}
        </div>
    );
}
