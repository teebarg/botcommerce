"use client";

// import React from "react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import { AGE_OPTIONS } from "@/lib/constants";

// interface AgeRangeSelectorProps {
//     value?: string;
//     onValueChange: (value: string) => void;
//     placeholder?: string;
//     disabled?: boolean;
// }

// export function AgeRangeSelector({ value, onValueChange, placeholder = "Select Age Range", disabled = false }: AgeRangeSelectorProps) {
//     return (
//         <div className="space-y-2">
//             <Label className="text-sm">Age Range</Label>
//             <Select value={value || ""} onValueChange={onValueChange} disabled={disabled}>
//                 <SelectTrigger>
//                     <SelectValue placeholder={placeholder} />
//                 </SelectTrigger>
//                 <SelectContent>
//                     {AGE_OPTIONS.map((age: string) => (
//                         <SelectItem key={age} value={age}>
//                             {age}
//                         </SelectItem>
//                     ))}
//                 </SelectContent>
//             </Select>
//         </div>
//     );
// }

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PRESET_AGE_RANGES = ["0-2", "2-3", "3-4", "4-5", "5-6", "6-8", "8-10", "10-12", "12-14"];

interface AgeRangeSelectorProps {
    selectedRange: string;
    onChange: (range: string) => void;
}

export const AgeRangeSelector = ({ selectedRange, onChange }: AgeRangeSelectorProps) => {
    const [customRange, setCustomRange] = useState<string>("");
    const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

    const toggleRange = (range: string) => {
        if (selectedRange === range) {
            onChange(range);
        } else {
            onChange(range);
        }
    };

    const addCustomRange = () => {
        if ((customRange.trim() && !selectedRange) || selectedRange === customRange.trim()) {
            onChange(customRange.trim());
            setCustomRange("");
            setShowCustomInput(false);
        }
    };

    const removeRange = (range: string) => {
        onChange(selectedRange);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Select Age Ranges</label>
                <div className="flex flex-wrap gap-2">
                    {PRESET_AGE_RANGES.map((range) => (
                        <button
                            key={range}
                            type="button"
                            onClick={() => toggleRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                selectedRange === range
                                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md scale-105"
                                    : "bg-muted text-muted-foreground hover:bg-border hover:scale-105"
                            }`}
                        >
                            {range} years
                        </button>
                    ))}
                </div>
            </div>

            {selectedRange && (
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Selected Ranges</label>
                    <div className="flex flex-wrap gap-2">
                        {selectedRange && (
                            <Badge
                                key={selectedRange}
                                variant="secondary"
                                className="px-3 py-1.5 bg-gradient-to-r from-accent to-accent-light text-accent-foreground flex items-center gap-2"
                            >
                                <span>{selectedRange} years</span>
                                <button type="button" onClick={() => removeRange(selectedRange)} className="hover:opacity-70 transition-opacity">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            <div>
                {!showCustomInput ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowCustomInput(true)} className="border-dashed">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Range
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="e.g., 1-3"
                            value={customRange}
                            onChange={(e) => setCustomRange(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addCustomRange()}
                            className="max-w-xs"
                        />
                        <Button type="button" onClick={addCustomRange} size="sm">
                            Add
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setShowCustomInput(false);
                                setCustomRange("");
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
