"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
    className?: string;
    value?: DateRange;
    onChange?: (date: DateRange | undefined) => void;
    placeholder?: string;
}

export function DateRangePicker({ className, value, onChange, placeholder = "Pick a date range" }: DateRangePickerProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        className={cn("w-full justify-start text-left font-normal h-11", !value && "text-muted-foreground")}
                        id="date"
                        variant={"outline"}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value?.from ? (
                            value.to ? (
                                <>
                                    {format(value.from, "LLL dd, y")} - {format(value.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(value.from, "LLL dd, y")
                            )
                        ) : (
                            <span>{placeholder}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                    <Calendar initialFocus defaultMonth={value?.from} mode="range" numberOfMonths={2} selected={value} onSelect={onChange} />
                </PopoverContent>
            </Popover>
        </div>
    );
}
