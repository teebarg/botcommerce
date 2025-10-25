"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AGE_OPTIONS } from "@/lib/constants";

interface AgeRangeSelectorProps {
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function AgeRangeSelector({ 
    value, 
    onValueChange, 
    placeholder = "Select Age Range",
    disabled = false 
}: AgeRangeSelectorProps) {
    return (
        <div className="space-y-2">
            <Label className="text-sm">Age Range</Label>
            <Select 
                value={value || ""} 
                onValueChange={onValueChange}
                disabled={disabled}
            >
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {AGE_OPTIONS.map((age: string) => (
                        <SelectItem key={age} value={age}>
                            {age}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}