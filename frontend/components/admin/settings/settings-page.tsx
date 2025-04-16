"use client";

import React from "react";

import { FeatureToggles } from "./feature-toggles";
import { ShopDetails } from "./shop-details";
import { CustomSettings } from "./custom-settings";
import { ShopPayments } from "./shop-payments";

import { BankDetails, ShopSettings } from "@/types/models";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsPageProps {
    settings: ShopSettings[];
    bankDetails: BankDetails[];
}

export function SettingsPage({ settings, bankDetails }: SettingsPageProps) {
    const features = settings.filter((s) => s.type === "FEATURE");
    const shopDetails = settings.filter((s) => s.type === "SHOP_DETAIL");
    const customSettings = settings.filter((s) => s.type === "CUSTOM");

    return (
        <div className="py-8 px-2 md:px-8">
            <h1 className="text-2xl font-semibold mb-8">Store Settings</h1>
            <Tabs defaultValue="shop-details">
                <TabsList className="mb-4">
                    <TabsTrigger value="shop-details">Shop Details</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="custom-settings">Custom Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="shop-details">
                    <Card>
                        <CardContent>
                            <ShopDetails settings={shopDetails} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="details">
                    <FeatureToggles toggles={features} />
                </TabsContent>
                <TabsContent value="payments">
                    <ShopPayments bankDetails={bankDetails} settings={settings} />
                </TabsContent>
                <TabsContent value="custom-settings">
                    <Card>
                        <CardContent>
                            <CustomSettings settings={customSettings} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
