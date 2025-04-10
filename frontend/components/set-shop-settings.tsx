"use client";

import { useEffect } from "react";

import { useStore } from "@/app/store/use-store";
import { setCookie } from "@/lib/util/cookie";

interface SetShopSettingsProps {
    shopSettings: Record<string, string>;
}

const SetShopSettings = ({ shopSettings }: SetShopSettingsProps) => {
    const { setShopSettings } = useStore();

    useEffect(() => {
        setShopSettings(shopSettings);
        setCookie("configs", JSON.stringify(shopSettings));
    }, [shopSettings]);

    return null;
};

export default SetShopSettings;
