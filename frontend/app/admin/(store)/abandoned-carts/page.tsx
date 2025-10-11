"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AbandonedCartCard } from "@/components/admin/abandoned-carts/card";
import { Cart } from "@/schemas";
import { useAbandonedCarts, useAbandonedCartStats, useSendCartReminders } from "@/lib/hooks/useAbandonedCart";
import ComponentLoader from "@/components/component-loader";
import PaginationUI from "@/components/pagination";
import { AbandonedCartStats } from "@/components/admin/abandoned-carts/stat";

const LIMIT = 20;

const AdminAbandonedCarts = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [timeFilter, setTimeFilter] = useState<string>("24");

    const searchParams = useSearchParams();
    const { mutate: sendReminders, isPending: sendRemindersLoading } = useSendCartReminders();

    const { data: stats, isLoading: statsLoading } = useAbandonedCartStats({
        hours_threshold: parseInt(timeFilter),
    });

    const { data: abandonedCartsData, isLoading: abandonedCartsLoading } = useAbandonedCarts({
        search: searchQuery || undefined,
        hours_threshold: parseInt(timeFilter),
        skip: Number(searchParams.get("skip")) || 0,
        limit: LIMIT,
    });

    const { carts: allCarts, ...pagination } = abandonedCartsData ?? {
        carts: [],
        skip: 0,
        limit: 0,
        total_pages: 0,
        total_count: 0,
    };

    const handleSendReminders = () => {
        sendReminders({ hours_threshold: parseInt(timeFilter) });
    };

    if (abandonedCartsLoading || statsLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-6 py-8">
                    <ComponentLoader className="h-100" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b bg-background sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold">Abandoned Carts</h1>
                        <p className="text-muted-foreground">Monitor and recover lost sales opportunities</p>
                    </div>

                    <div className="flex flex-col md:flex-row md:justify-between gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 z-10 text-muted-foreground" />
                            <Input
                                className="pl-10 bg-card"
                                placeholder="Search by customer name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={timeFilter} onValueChange={setTimeFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Time range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Last 1 hour</SelectItem>
                                    <SelectItem value="6">Last 6 hours</SelectItem>
                                    <SelectItem value="24">Last 24 hours</SelectItem>
                                    <SelectItem value="72">Last 3 days</SelectItem>
                                    <SelectItem value="168">Last 7 days</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button disabled={sendRemindersLoading} isLoading={sendRemindersLoading} onClick={handleSendReminders}>
                                Send Reminders
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {stats && <AbandonedCartStats stat={stats} />}

                <div className="mt-4 space-y-4">
                    {allCarts.length > 0 ? (
                        allCarts.map((cart: Cart) => <AbandonedCartCard key={cart.id} cart={cart} />)
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">No converted carts found, adjust the time range or search query</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
                {pagination.total_pages > 1 && (
                    <div className="mt-8">
                        <PaginationUI pagination={pagination} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAbandonedCarts;
