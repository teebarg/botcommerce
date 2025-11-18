import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCreateCoupon } from "@/lib/hooks/useCoupon";

const couponSchema = z.object({
    code: z.string().min(3).max(20).toUpperCase(),
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

export const CreateCouponDialog = () => {
    const [open, setOpen] = useState(false);
    const createMutation = useCreateCoupon();

    const form = useForm<CouponFormValues>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: "",
            type: "PERCENTAGE",
            value: 10,
            max_uses: 100,
            max_uses_per_user: 1,
            scope: "GENERAL",
            status: "active",
            valid_from: new Date().toISOString().split("T")[0],
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
    });

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

            await createMutation.mutateAsync(backendData);

            toast.success("Coupon Created", {
                description: `"${data.code}" has been created successfully`,
            });

            form.reset();
            setOpen(false);
        } catch (error) {
            // Error is handled in the hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Coupon
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Coupon</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Type</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
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

                        <div className="grid grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-2 gap-4">
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
                                        <FormDescription>Total times coupon can be used per user</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="scope"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Scope</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
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
                            <Button disabled={createMutation.isPending} type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button disabled={createMutation.isPending} type="submit">
                                {createMutation.isPending ? "Creating..." : "Create Coupon"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
