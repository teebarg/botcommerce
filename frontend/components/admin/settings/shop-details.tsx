"use client";

import React from "react";

import { ShopDetailsForm } from "./shop-details-form";
import { ShopSocialForm } from "./shop-social-form";

import { ShopSettings } from "@/types/models";

interface ShopDetailsProps {
    settings: ShopSettings[];
}

export function ShopDetails({ settings }: ShopDetailsProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-medium mb-2">Shop Details</h3>
                <ShopDetailsForm settings={settings} />
            </div>
            <div>
                <h3 className="font-medium mb-2">Social Media</h3>
                <ShopSocialForm settings={settings} />
            </div>
        </div>
    );
}
