"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AGE_OPTIONS } from "@/lib/constants";

interface AgeRangeSelectorProps {
    selectedRange: string;
    onChange: (range: string) => void;
}

export const AgeRangeSelector = ({ selectedRange, onChange }: AgeRangeSelectorProps) => {
    const [customRange, setCustomRange] = useState<string>("");
    const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

    const toggleRange = (range: string) => {
        if (selectedRange === range) {
            onChange("");
        } else {
            onChange(range);
        }
    };

    const addCustomRange = () => {
        if (customRange.trim() && selectedRange !== customRange.trim()) {
            onChange(customRange.trim());
            setCustomRange("");
            setShowCustomInput(false);
        }
    };

    const isCustomValue = selectedRange.trim() !== "" && !AGE_OPTIONS.includes(selectedRange.trim());

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Age Ranges</label>
                <div className="flex flex-wrap gap-2">
                    {AGE_OPTIONS.map((range) => (
                        <button
                            key={range}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                selectedRange === range
                                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                                    : "bg-muted text-muted-foreground hover:bg-border hover:scale-105"
                            }`}
                            type="button"
                            onClick={() => toggleRange(range)}
                        >
                            {range}
                        </button>
                    ))}
                    {isCustomValue && (
                        <button
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow-md scale-105"
                            type="button"
                            onClick={() => toggleRange(selectedRange.trim())}
                        >
                            {selectedRange.trim()}
                        </button>
                    )}
                </div>
            </div>

            <div>
                {!showCustomInput ? (
                    <Button className="border-dashed" type="button" onClick={() => setShowCustomInput(true)}>
                        <Plus className="h-4 w-4" />
                        Custom Range
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Input
                            className="max-w-xs"
                            placeholder="e.g., 1-3 years"
                            type="text"
                            value={customRange}
                            onChange={(e) => setCustomRange(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addCustomRange()}
                        />
                        <Button type="button" onClick={addCustomRange}>
                            Add
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
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
