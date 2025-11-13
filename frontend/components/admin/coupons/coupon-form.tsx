import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreateCoupon } from "@/lib/hooks/useCoupon";

const couponSchema = z.object({
    code: z.string().min(3).max(20).toUpperCase(),
    type: z.enum(["percentage", "fixed"]),
    value: z.number().min(1),
    minCartValue: z.number().optional(),
    minItemQuantity: z.number().optional(),
    validFrom: z.string(),
    validUntil: z.string(),
    maxUses: z.number().min(1),
    scope: z.enum(["general", "specific_users"]),
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
            type: "percentage",
            value: 10,
            maxUses: 100,
            scope: "general",
            status: "active",
            validFrom: new Date().toISOString().split("T")[0],
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
    });

    const onSubmit = async (data: CouponFormValues) => {
        try {
            // Transform frontend data to backend format
            const backendData = {
                code: data.code.toUpperCase(),
                discount_type: data.type === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT",
                discount_value: data.value,
                min_cart_value: data.minCartValue && data.minCartValue > 0 ? data.minCartValue : null,
                min_item_quantity: data.minItemQuantity && data.minItemQuantity > 0 ? data.minItemQuantity : null,
                valid_from: new Date(data.validFrom + "T00:00:00Z").toISOString(),
                valid_until: new Date(data.validUntil + "T23:59:59Z").toISOString(),
                max_uses: data.maxUses,
                scope: data.scope === "general" ? "GENERAL" : "SPECIFIC_USERS",
                is_active: data.status === "active",
                assigned_users: data.scope === "specific_users" ? [] : null, // Can be populated later
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                                <SelectItem value="fixed">Fixed Amount</SelectItem>
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
                                        <FormLabel>{form.watch("type") === "percentage" ? "Percentage" : "Amount ($)"}</FormLabel>
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
                                name="minCartValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Cart Value ($)</FormLabel>
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

                        <div className="grid grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-2 gap-4">
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="general">General Use</SelectItem>
                                                <SelectItem value="specific_users">Specific Users</SelectItem>
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
                                disabled={createMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Creating..." : "Create Coupon"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
