import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useUpdateCoupon } from "@/hooks/useCoupon";
import type { Coupon } from "@/schemas";
import { useOverlayTriggerState } from "react-stately";
import Overlay from "@/components/overlay";

const couponSchema = z.object({
    code: z.string().min(3).max(20),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    value: z.number().min(1),
    min_cart_value: z.number().optional(),
    min_item_quantity: z.number().optional(),
    valid_from: z.string(),
    valid_until: z.string(),
    max_uses: z.number().min(1),
    max_uses_per_user: z.number().min(1),
    scope: z.enum(["GENERAL", "SPECIFIC_USERS"]),
    status: z.enum(["active", "inactive"]),
});

export type CouponFormValues = z.infer<typeof couponSchema>;

interface EditCouponDialogProps {
    coupon: Coupon;
}

export const EditCouponDialog = ({ coupon }: EditCouponDialogProps) => {
    const state = useOverlayTriggerState({});
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
            value: coupon.discount_value || 0,
            min_cart_value: coupon.min_cart_value ?? undefined,
            min_item_quantity: coupon.min_item_quantity ?? undefined,
            max_uses: coupon.max_uses ?? 1,
            max_uses_per_user: coupon.max_uses_per_user ?? 1,
            scope: getScope(),
            status: coupon.is_active ? "active" : "inactive",
            valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        },
    });

    useEffect(() => {
        if (state.isOpen && coupon) {
            form.reset({
                code: coupon.code,
                type: getDiscountType(),
                value: coupon.discount_value ?? (coupon as any).value ?? 0,
                min_cart_value: coupon.min_cart_value ?? undefined,
                min_item_quantity: coupon.min_item_quantity ?? undefined,
                max_uses: coupon.max_uses ?? 1,
                max_uses_per_user: coupon.max_uses_per_user ?? 1,
                scope: getScope(),
                status: coupon.is_active ? "active" : "inactive",
                valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            });
        }
    }, [coupon, state.isOpen, form]);

    const onSubmit = async (data: CouponFormValues) => {
        try {
            const backendData = {
                code: data.code.toUpperCase(),
                discount_type: data.type,
                discount_value: data.value,
                min_cart_value: data.min_cart_value && data.min_cart_value > 0 ? data.min_cart_value : null,
                min_item_quantity: data.min_item_quantity && data.min_item_quantity > 0 ? data.min_item_quantity : null,
                valid_from: new Date(data.valid_from + "T00:00:00Z").toISOString(),
                valid_until: new Date(data.valid_until + "T23:59:59Z").toISOString(),
                max_uses: data.max_uses,
                max_uses_per_user: data.max_uses_per_user,
                scope: data.scope,
                is_active: data.status === "active",
            };

            await updateMutation.mutateAsync({ id: coupon.id, data: backendData });
            state.close();
        } catch (error) {}
    };

    return (
        <Overlay
            open={state.isOpen}
            title="Edit Coupon"
            trigger={
                <Button className="h-9 w-9" size="icon" variant="ghost">
                    <Edit className="h-4 w-4" />
                </Button>
            }
            sheetClassName="min-w-[35vw]"
            onOpenChange={state.setOpen}
        >
            <Form {...form}>
                <form className="space-y-4 px-2 md:px-4 pt-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Edit Coupon</h2>
                    </div>
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
                                    <Select value={field.value} onValueChange={field.onChange}>
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
                                    <Select value={field.value} onValueChange={field.onChange}>
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
                            name="min_cart_value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Min Cart Value (₦)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Optional"
                                            type="number"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormDescription>Minimum cart total to apply coupon</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="min_item_quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Min Item Quantity</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Optional"
                                            type="number"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                            name="valid_from"
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
                            name="valid_until"
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
                            name="max_uses"
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
                            name="max_uses_per_user"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Uses Per User</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormDescription>Total times coupon can be used</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <FormField
                            control={form.control}
                            name="scope"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Scope</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
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
                        <Button disabled={updateMutation.isPending} type="button" variant="outline" onClick={state.close}>
                            Cancel
                        </Button>
                        <Button disabled={updateMutation.isPending} type="submit">
                            {updateMutation.isPending ? "Updating..." : "Update Coupon"}
                        </Button>
                    </div>
                </form>
            </Form>
        </Overlay>
    );
};
