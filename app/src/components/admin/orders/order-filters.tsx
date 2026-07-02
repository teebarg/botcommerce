import type React from "react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Filter, Search, X } from "lucide-react";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { OrderStatus } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useSearch } from "@tanstack/react-router";

const MOBILE_STATUSES = [
    { status: "PENDING", label: "Pending" },
    { status: "PROCESSING", label: "Processing" },
    { status: "SHIPPED", label: "Packed" },
    { status: "DELIVERED", label: "Delivered" },
    { status: "REFUNDED", label: "Refunded" },
];

const OrderFilters: React.FC = () => {
    const { updateQuery } = useUpdateQuery(200);
    const search = useSearch({ strict: false });

    const [filters, setFilters] = useState({ status: "", search: "" });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const updateStatusQuery = (status?: OrderStatus) => {
        updateQuery([{ key: "status", value: status ?? "" }]);
    };

    const applyFilters = () => {
        const query = [
            { key: "status", value: filters.status },
            { key: "search", value: filters.search },
        ];
        if (dateRange?.from) query.push({ key: "start_date", value: new Date(dateRange.from).toISOString() });
        if (dateRange?.to) query.push({ key: "end_date", value: new Date(dateRange.to).toISOString() });
        updateQuery(query);
    };

    const clearFilters = () => {
        setFilters({ status: "", search: "" });
        setDateRange(undefined);
        updateQuery([
            { key: "status", value: "" },
            { key: "search", value: "" },
            { key: "start_date", value: "" },
            { key: "end_date", value: "" },
        ]);
    };

    return (
        <div className="mb-4">
            <div className="hidden md:flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search orders..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>

                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(OrderStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                                {status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <DateRangePicker className="w-64" placeholder="Date range" value={dateRange} onChange={setDateRange} />

                <Button onClick={applyFilters} className="rounded-full gap-1.5">
                    <Filter className="h-3.5 w-3.5" />
                    Apply
                </Button>
                <Button variant="ghost" onClick={clearFilters} className="rounded-full gap-1.5 text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                    Clear
                </Button>
            </div>
            <div className="flex md:hidden gap-2 overflow-x-auto pb-1">
                <button
                    onClick={() => updateStatusQuery()}
                    className={`shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors ${!search.status
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background text-foreground border-border"
                        }`}
                >
                    All
                </button>
                {MOBILE_STATUSES.map((item) => (
                    <button
                        key={item.status}
                        onClick={() => updateStatusQuery(item.status as OrderStatus)}
                        className={`shrink-0 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors ${search.status === item.status
                                ? "bg-foreground text-background border-foreground"
                                : "bg-background text-foreground border-border"
                            }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OrderFilters;