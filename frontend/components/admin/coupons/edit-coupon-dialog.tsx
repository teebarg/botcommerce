"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { useUpdateCoupon } from "@/lib/hooks/useCoupon";
import { Coupon } from "@/schemas";

const couponSchema = z.object({
    code: z.string().min(3).max(20),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value: z.number().min(1),
    minCartValue: z.number().optional(),
    minItemQuantity: z.number().optional(),
    validFrom: z.string(),
    validUntil: z.string(),
    maxUses: z.number().min(1),
    scope: z.enum(["GENERAL", "SPECIFIC_USERS"]),
    status: z.enum(["active", "inactive"]),
});

export type CouponFormValues = z.infer<typeof couponSchema>;

interface EditCouponDialogProps {
    coupon: Coupon;
}

export const EditCouponDialog = ({ coupon }: EditCouponDialogProps) => {
    const [open, setOpen] = useState(false);
    const updateMutation = useUpdateCoupon();

    const getDiscountType = (): "PERCENTAGE" | "FIXED_AMOUNT" => {
        if ((coupon as any).discount_type) return (coupon as any).discount_type;
        const type = (coupon as any).type;
        if (type === "percentage" || type === "PERCENTAGE") return "PERCENTAGE";
        return "FIXED_AMOUNT";
    };

    const getScope = (): "GENERAL" | "SPECIFIC_USERS" => {
        if ((coupon as any).scope) {
            const scope = (coupon as any).scope;
            if (scope === "GENERAL" || scope === "general") return "GENERAL";
            return "SPECIFIC_USERS";
        }
        return "GENERAL";
    };

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: coupon.code,
            type: getDiscountType(),
            value: coupon.discount_value || (coupon as any).value || 0,
            minCartValue: coupon.min_cart_value ?? (coupon as any).minCartValue ?? undefined,
            minItemQuantity: coupon.min_item_quantity ?? (coupon as any).minItemQuantity ?? undefined,
            maxUses: coupon.max_uses ?? (coupon as any).maxUses ?? 1,
            scope: getScope(),
            status: coupon.is_active ? "active" : "inactive",
            validFrom: coupon.valid_from
                ? new Date(coupon.valid_from).toISOString().split("T")[0]
                : (coupon as any).validFrom
                  ? new Date((coupon as any).validFrom).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0],
            validUntil: coupon.valid_until
                ? new Date(coupon.valid_until).toISOString().split("T")[0]
                : (coupon as any).validUntil
                  ? new Date((coupon as any).validUntil).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0],
        },
    });

    // Reset form when coupon changes
    useEffect(() => {
        if (open && coupon) {
            form.reset({
                code: coupon.code,
                type: getDiscountType(),
                value: coupon.discount_value ?? (coupon as any).value ?? 0,
                minCartValue: coupon.min_cart_value ?? (coupon as any).minCartValue ?? undefined,
                minItemQuantity: coupon.min_item_quantity ?? (coupon as any).minItemQuantity ?? undefined,
                maxUses: coupon.max_uses ?? (coupon as any).maxUses ?? 1,
                scope: getScope(),
                status: coupon.is_active ? "active" : "inactive",
                validFrom: coupon.valid_from
                    ? new Date(coupon.valid_from).toISOString().split("T")[0]
                    : (coupon as any).validFrom
                      ? new Date((coupon as any).validFrom).toISOString().split("T")[0]
                      : new Date().toISOString().split("T")[0],
                validUntil: coupon.valid_until
                    ? new Date(coupon.valid_until).toISOString().split("T")[0]
                    : (coupon as any).validUntil
                      ? new Date((coupon as any).validUntil).toISOString().split("T")[0]
                      : new Date().toISOString().split("T")[0],
            });
        }
    }, [coupon, open, form]);

    const onSubmit = async (data: CouponFormValues) => {
        try {
            // Transform frontend data to backend format
            const backendData = {
                code: data.code.toUpperCase(),
                discount_type: data.type,
                discount_value: data.value,
                min_cart_value: data.minCartValue && data.minCartValue > 0 ? data.minCartValue : null,
                min_item_quantity: data.minItemQuantity && data.minItemQuantity > 0 ? data.minItemQuantity : null,
                valid_from: new Date(data.validFrom + "T00:00:00Z").toISOString(),
                valid_until: new Date(data.validUntil + "T23:59:59Z").toISOString(),
                max_uses: data.maxUses,
                scope: data.scope,
                is_active: data.status === "active",
                assigned_users: data.scope === "SPECIFIC_USERS" ? [] : null,
            };

            await updateMutation.mutateAsync({ id: coupon.id, data: backendData });
            setOpen(false);
        } catch (error) {
            // Error is handled in the hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Coupon</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Coupon Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="SAVE20" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                                                <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{form.watch("type") === "PERCENTAGE" ? "Percentage" : "Amount (₦)"}</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <FormField
                                control={form.control}
                                name="minCartValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Cart Value (₦)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Optional"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormDescription>Minimum cart total to apply coupon</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="minItemQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Item Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Optional"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormDescription>Minimum items in cart</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <FormField
                                control={form.control}
                                name="validFrom"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valid From</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="validUntil"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valid Until</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <FormField
                                control={form.control}
                                name="maxUses"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Uses</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormDescription>Total times coupon can be used</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="scope"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Scope</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="GENERAL">General Use</SelectItem>
                                                <SelectItem value="SPECIFIC_USERS">Specific Users</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={updateMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Updating..." : "Update Coupon"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

