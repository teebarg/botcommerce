"use client";

import { CreateCouponDialog } from "@/components/admin/coupons/coupon-form";
import { CouponList } from "@/components/admin/coupons/coupon-list";
import { Separator } from "@/components/ui/separator";
import { BarChart3 } from "lucide-react";
import LocalizedClientLink from "@/components/ui/link";

const Coupon = () => {
    return (
        <div className="container mx-auto max-w-5xl py-8 px-4">
            <div className="flex md:flex-row flex-col md:items-center md:justify-between mb-6 gap-2">
                <div>
                    <h1 className="text-3xl font-bold">Coupon Management</h1>
                    <p className="text-muted-foreground mt-1">Create, manage, and track your promotional coupons</p>
                </div>
                <div className="flex gap-2">
                    <LocalizedClientLink
                        href="/admin/coupons/analytics"
                        className="flex items-center gap-2 border border-input bg-background hover:bg-accent py-2 px-4 rounded-md"
                    >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Analytics
                    </LocalizedClientLink>
                    <CreateCouponDialog />
                </div>
            </div>
            <Separator className="mb-6" />
            <CouponList />
        </div>
    );
};

export default Coupon;
