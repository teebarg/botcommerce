"use client";

import React, { useState } from "react";
import { toast } from "sonner";

import { ShopSettings } from "@/types/models";
import { api } from "@/apis";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CustomSettingsProps {
    settings: ShopSettings[];
}

const settingTypes = [
    { label: "Feature Toggle", value: "FEATURE" },
    { label: "Shop Detail", value: "SHOP_DETAIL" },
    { label: "Custom", value: "CUSTOM" },
];

export function CustomSettings({ settings }: CustomSettingsProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [newSetting, setNewSetting] = useState({
        key: "",
        value: "",
        type: "CUSTOM",
    });

    const handleCreate = async () => {
        if (!newSetting.key) {
            toast.error("Key is required");

            return;
        }

        setIsLoading(true);

        const { error } = await api.shopSettings.create(newSetting);

        if (error) {
            toast.error(error);
            setIsLoading(false);

            return;
        }

        toast.success("Setting created successfully");
        setNewSetting({
            key: "",
            value: "",
            type: "CUSTOM",
        });
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Add New Setting</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Key"
                        placeholder="setting_key"
                        value={newSetting.key}
                        onChange={(e) => setNewSetting((prev: any) => ({ ...prev, key: e.target.value }))}
                    />

                    <div>
                        <label className="text-sm text-default-500" htmlFor="type">
                            Type
                        </label>
                        <Select value={newSetting.type} onValueChange={(value) => setNewSetting((prev: any) => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {settingTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Textarea
                            label="Value"
                            placeholder="Enter the setting value"
                            value={newSetting.value}
                            onChange={(e) => setNewSetting((prev) => ({ ...prev, value: e.target.value }))}
                        />
                    </div>
                </div>

                <Button color="primary" isLoading={isLoading} onClick={handleCreate}>
                    Add Setting
                </Button>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Existing Custom Settings</h3>
                <div className="space-y-4">
                    {settings.map((setting) => (
                        <div key={setting.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium">{setting.key}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Type: {setting.type}</p>
                                </div>
                                <Button
                                    color="danger"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        // Add delete functionality
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                            <div className="mt-2">
                                <p className="text-sm">Value: {setting.value || "Not set"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
