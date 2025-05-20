"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import { Filter, Search, X } from "lucide-react";

import { useUpdateQuery } from "@/lib/hooks/useUpdateQuery";
import { OrderStatus } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";

interface OrderFiltersProps {}

const OrderFilters: React.FC<OrderFiltersProps> = () => {
    const { updateQuery } = useUpdateQuery(200);
    const searchParams = useSearchParams();

    const [filters, setFilters] = useState({
        status: "",
        search: "",
    });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const status = searchParams.get("status") || "";

    const updateStatusQuery = (status?: OrderStatus) => {
        updateQuery([{ key: "status", value: status ?? "" }]);
    };

    const applyFilters = () => {
        const query = [
            { key: "status", value: filters.status },
            { key: "search", value: filters.search },
        ];

        if (dateRange?.from) query.push({ key: "start_date", value: new Date(dateRange?.from).toISOString() });
        if (dateRange?.to) query.push({ key: "end_date", value: new Date(dateRange?.to).toISOString() });
        updateQuery(query);
    };

    const clearFilters = () => {
        updateQuery([
            { key: "status", value: "" },
            { key: "search", value: "" },
            { key: "start_date", value: "" },
            { key: "end_date", value: "" },
        ]);
    };

    return (
        <div className="mb-2">
            <div className="hidden md:flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-8"
                            placeholder="Search orders..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* <SelectItem value="">All Status</SelectItem> */}
                            {["PENDING", "PAID", "PROCESSING", "FULFILLED", "CANCELED", "REFUNDED"].map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DateRangePicker className="w-[300px]" placeholder="Filter by date" value={dateRange} onChange={setDateRange} />
                    <Button variant="secondary" onClick={applyFilters}>
                        <Filter className="h-4 w-4 mr-2" />
                        Apply Filters
                    </Button>
                    <Button variant="outline" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                    </Button>
                </div>
            </div>
            <div className="flex md:hidden space-x-2 overflow-x-auto pb-2 mb-4">
                <button
                    className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
                        !status ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => updateStatusQuery()}
                >
                    All
                </button>
                {[
                    { status: "PENDING", label: "PENDING", color: "bg-warning" },
                    { status: "PROCESSING", label: "PROCESSING", color: "bg-primary" },
                    { status: "SHIPPED", label: "SHIPPED", color: "bg-blue-500" },
                    { status: "DELIVERED", label: "DELIVERED", color: "bg-green-500" },
                    { status: "PAID", label: "PAID", color: "bg-green-500" },
                    { status: "REFUNDED", label: "REFUNDED", color: "bg-gray-100" },
                ].map((item: { status: string; label: string; color: string }, idx: number) => (
                    <button
                        key={idx}
                        className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
                            status === item.status ? item.color + " text-white" : "bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => updateStatusQuery(item.status as OrderStatus)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OrderFilters;
