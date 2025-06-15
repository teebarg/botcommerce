"use client";

import React from "react";

import DeliveryOverview from "../delivery/delivery-overview";

import { FeatureToggles } from "./feature-toggles";
import { ShopDetails } from "./shop-details";
import { ShopPayments } from "./shop-payments";

import { BankDetails, ShopSettings } from "@/schemas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsPageProps {
    settings: ShopSettings[];
    bankDetails: BankDetails[];
}

export function SettingsPage({ settings, bankDetails }: SettingsPageProps) {
    return (
        <div className="py-8 px-2 md:px-8">
            <h1 className="text-2xl font-semibold mb-4">Store Settings</h1>
            <Tabs defaultValue="shop-details">
                <TabsList className="mb-4">
                    <TabsTrigger value="shop-details">Shop Details</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery</TabsTrigger>
                </TabsList>
                <TabsContent value="shop-details">
                    <ShopDetails settings={settings} />
                </TabsContent>
                <TabsContent value="details">
                    <FeatureToggles toggles={settings} />
                </TabsContent>
                <TabsContent value="payments">
                    <ShopPayments bankDetails={bankDetails} settings={settings} />
                </TabsContent>
                <TabsContent value="delivery">
                    <DeliveryOverview />
                </TabsContent>
            </Tabs>
        </div>
    );
}
