"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AbandonedCartCard } from "@/components/admin/abandoned-carts/abandoned-cart-card";
import { Search, ArrowLeft } from "lucide-react";
import LocalizedClientLink from "@/components/ui/link";
import { Cart } from "@/schemas";
import { useAbandonedCarts, useAbandonedCartStats } from "@/lib/hooks/useAbandonedCart";
import ComponentLoader from "@/components/component-loader";
import PaginationUI from "@/components/pagination";
import { useSearchParams } from "next/navigation";

const LIMIT = 10;

const AdminAbandonedCarts = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState("24");
    const [valueFilter, setValueFilter] = useState("all");

    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;
    const status = searchParams.get("status") as string;

    // Get stats
    const { data: stats, isLoading: statsLoading } = useAbandonedCartStats();

    // Get abandoned carts
    const { data: abandonedCartsData, isLoading: abandonedCartsLoading } = useAbandonedCarts({
        status: status || undefined,
        search: searchQuery || undefined,
        hours_threshold: parseInt(timeFilter),
        skip: (page - 1) * LIMIT,
        limit: LIMIT
    });

    const { carts: allCarts, ...pagination } = abandonedCartsData ?? {
        carts: [],
        skip: 0,
        limit: 0,
        total_pages: 0,
        total_count: 0
    };

    // Filter carts by status for tabs
    const activeCarts = allCarts.filter(cart => cart.status === "ACTIVE");
    const abandonedCarts = allCarts.filter(cart => cart.status === "ABANDONED");

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
                    <div className="flex items-center gap-4 mb-4">
                        <LocalizedClientLink href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </LocalizedClientLink>
                        <div>
                            <h1 className="text-3xl font-bold">Abandoned Carts</h1>
                            <p className="text-muted-foreground">Monitor and recover lost sales opportunities</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by customer name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
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
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Stats Summary */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-muted-foreground">Active Carts</div>
                                <div className="text-2xl font-bold text-amber-600">{stats.active_count}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-muted-foreground">Abandoned Carts</div>
                                <div className="text-2xl font-bold text-red-600">{stats.abandoned_count}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-muted-foreground">Converted Carts</div>
                                <div className="text-2xl font-bold text-green-600">{stats.converted_count}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="text-sm text-muted-foreground">Recovery Rate</div>
                                <div className="text-2xl font-bold text-blue-600">{stats.recovery_rate}%</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <Tabs defaultValue="active" className="mt-8">
                    <TabsList className="grid w-full md:w-[450px] grid-cols-3">
                        <TabsTrigger value="active">
                            Active{" "}
                            <Badge variant="secondary" className="ml-2">
                                {stats?.active_count || 0}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="abandoned">
                            Abandoned{" "}
                            <Badge variant="secondary" className="ml-2">
                                {stats?.abandoned_count || 0}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="converted">
                            Converted{" "}
                            <Badge variant="secondary" className="ml-2">
                                {stats?.converted_count || 0}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="mt-6">
                        <div className="grid gap-4">
                            {activeCarts.length > 0 ? (
                                activeCarts.map((cart: Cart) => <AbandonedCartCard key={cart.id} cart={cart} />)
                            ) : (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <p className="text-muted-foreground">No active abandoned carts found</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="abandoned" className="mt-6">
                        <div className="grid gap-4">
                            {abandonedCarts.length > 0 ? (
                                abandonedCarts.map((cart: Cart) => <AbandonedCartCard key={cart.id} cart={cart} />)
                            ) : (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <p className="text-muted-foreground">No abandoned carts found</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="converted" className="mt-6">
                        <div className="grid gap-4">
                            {allCarts.filter(cart => cart.status === "CONVERTED").length > 0 ? (
                                allCarts
                                    .filter(cart => cart.status === "CONVERTED")
                                    .map((cart: Cart) => <AbandonedCartCard key={cart.id} cart={cart} />)
                            ) : (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <p className="text-muted-foreground">No converted carts found</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                    <div className="mt-8">
                        <PaginationUI
                            currentPage={page}
                            totalPages={pagination.total_pages}
                            baseUrl="/admin/abandoned-carts"
                            queryParams={{
                                status: status || undefined,
                                search: searchQuery || undefined,
                                hours_threshold: timeFilter !== "24" ? timeFilter : undefined
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAbandonedCarts;
