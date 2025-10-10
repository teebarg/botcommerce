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
// import { LocalizedClientLink } from "@/components/LocalizedClientLink";

const AdminAbandonedCarts = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");
    const [valueFilter, setValueFilter] = useState("all");

    const activeCarts: Cart[] = [];
    const abandonedCarts: Cart[] = [];

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
                                <SelectItem value="all">All time</SelectItem>
                                <SelectItem value="1h">Last hour</SelectItem>
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <Tabs defaultValue="active" className="mt-8">
                    <TabsList className="grid w-full md:w-[450px] grid-cols-3">
                        <TabsTrigger value="active">
                            Active{" "}
                            <Badge variant="secondary" className="ml-2">
                                5
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="abandoned">
                            Abandoned{" "}
                            <Badge variant="secondary" className="ml-2">
                                110
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
                                        <p className="text-muted-foreground">No recovered carts found</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminAbandonedCarts;
