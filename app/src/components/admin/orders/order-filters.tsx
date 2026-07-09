import type React from "react";
import { useMemo } from "react";
import {
    Search,
    SlidersHorizontal,
    Clock,
    PackageSearch,
    Truck,
    CheckCircle2,
    RotateCcw,
    X,
    Filter,
} from "lucide-react";
import { useUpdateQuery } from "@/hooks/useUpdateQuery";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useSearch } from "@tanstack/react-router";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "@/components/ui/button";
import SheetDrawer from "@/components/sheet-drawer";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

const PIPELINE = [
    { status: "PENDING", label: "Pending", icon: Clock },
    { status: "PROCESSING", label: "Processing", icon: PackageSearch },
    { status: "SHIPPED", label: "Packed", icon: Truck },
    { status: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
    { status: "REFUNDED", label: "Refunded", icon: RotateCcw },
];

const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";

export const OrderFilters: React.FC = () => {
    const state = useOverlayTriggerState({});
    const { updateQuery } = useUpdateQuery(200);
    const search = useSearch({ strict: false }) as Record<string, string | undefined>;
    const { value: searchValue, onChange: onSearchChange } = useDebouncedSearch("search", search.search);

    const clearAll = () => {
        updateQuery([
            { key: "status", value: "" },
            { key: "search", value: "" },
            { key: "start_date", value: "" },
            { key: "end_date", value: "" },
        ]);
        onSearchChange("");
        state.close();
    };

    // Calculate dynamic badge counts to show how deep the filter stack is
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (search.status) count++;
        if (search.start_date) count++;
        return count;
    }, [search.status, search.start_date]);

    const activeFilterSummaryString = useMemo(() => {
        if (!search.status && !search.start_date) return "All Orders";
        const parts: string[] = [];
        if (search.status) {
            const found = PIPELINE.find(p => p.status === search.status);
            if (found) parts.push(found.label);
        }
        if (search.start_date) {
            parts.push(`${formatDate(search.start_date)}–${formatDate(search.end_date)}`);
        }
        return parts.join(" • ");
    }, [search.status, search.start_date, search.end_date]);

    const applyDatePreset = (days: number) => {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - days);
        updateQuery([
            { key: "start_date", value: from.toISOString() },
            { key: "end_date", value: to.toISOString() },
        ]);
    };

    return (
        <div className="w-full space-y-2 pb-4 border-b border-border bg-background">
            <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
                    <Input
                        className="pl-9 pr-8 h-10 rounded-xl border-border bg-muted/40 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/40 transition-all text-sm"
                        placeholder="Search by name, ID or SKU..."
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchValue && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                <SheetDrawer
                    open={state.isOpen}
                    sheetClassName="md:max-w-7xl"
                    title={
                        <div className="flex items-center justify-between">
                            <div className="text-base font-display font-bold flex items-center gap-2">
                                <Filter className="h-4 w-4 text-primary" />
                                Filter Controls
                            </div>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs font-semibold text-destructive hover:underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                    }
                    trigger={
                        <Button
                            size="md"
                            variant="outline"
                            className={`border text-xs rounded-xl tracking-wide ${activeFilterCount > 0
                                ? "bg-primary/5 text-primary border-primary/30 hover:text-primary"
                                : "bg-background text-foreground border-border hover:bg-muted/40"
                                }`}
                            onClick={state.open}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="hidden md:inline">Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground animate-scale-in">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    }
                    onOpenChange={state.setOpen}
                >
                    {state.isOpen && (
                        <div>
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Order Lifecycle Status
                                    </label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        <button
                                            onClick={() => updateQuery([{ key: "status", value: "" }])}
                                            className={`h-9 px-3 rounded-lg border text-left flex items-center gap-2 transition-all ${!search.status
                                                ? "bg-primary/5 border-primary text-primary"
                                                : "bg-card/40 border-border text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            <span className="text-[9px] font-extrabold tracking-wider opacity-70 shrink-0">ALL</span>
                                            <span className="text-xs font-medium tracking-tight truncate">All Orders</span>
                                        </button>

                                        {PIPELINE.map(({ status, label, icon: Icon }) => {
                                            const active = search.status === status;
                                            const isRefunded = status === "REFUNDED";
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => updateQuery([{ key: "status", value: active ? "" : status }])}
                                                    className={`h-9 px-3 rounded-lg border text-left flex items-center gap-2 transition-all ${active
                                                        ? isRefunded
                                                            ? "bg-destructive/5 border-destructive text-destructive"
                                                            : "bg-primary/5 border-primary text-primary"
                                                        : "bg-card/40 border-border text-muted-foreground hover:text-foreground"
                                                        }`}
                                                >
                                                    <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? "opacity-100" : "opacity-60"}`} />
                                                    <span className="text-xs font-medium tracking-tight truncate">{label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-2.5 pt-2 border-t border-border">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Creation Date Window</label>
                                    <div className="grid grid-cols-4 gap-1.5 text-xs">
                                        {[
                                            { key: 0, label: "Today" },
                                            { key: 7, label: "7 Days" },
                                            { key: 14, label: "14 Days" },
                                            { key: 30, label: "30 Days" }
                                        ].map((i) => (
                                            <button key={i.key} onClick={() => applyDatePreset(i.key)} className="h-9 rounded-lg border border-border bg-card/20 font-medium hover:bg-muted transition-colors">{i.label}</button>
                                        ))}
                                    </div>
                                    <DateRangePicker
                                        placeholder="Or select a custom range..."
                                        value={search.start_date ? { from: new Date(search.start_date), to: search.end_date ? new Date(search.end_date) : undefined } : undefined}
                                        onChange={(range) => {
                                            if (range?.from && range?.to) {
                                                updateQuery([
                                                    { key: "start_date", value: range.from.toISOString() },
                                                    { key: "end_date", value: range.to.toISOString() },
                                                ]);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t border-border bg-card/20 flex gap-2">
                                <Button
                                    size="lg"
                                    variant="inverse"
                                    onClick={state.close}
                                    className="flex-1 rounded-xl"
                                >
                                    View Results
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetDrawer>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 px-1 pt-0.5">
                <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${activeFilterCount > 0 ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
                    Scope: <span className="text-foreground font-semibold">{activeFilterSummaryString}</span>
                </span>
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="ml-auto text-muted-foreground hover:text-destructive flex items-center gap-0.5 transition-colors"
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderFilters;