"use client";

import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/apis";
import { useInvalidate } from "@/lib/hooks/useApi";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User } from "@/schemas";

interface ReviewFormProps {
    user?: User;
    onClose?: () => void;
}

const formSchema = z.object({
    first_name: z.string().min(2, {
        message: "First name must be at least 2 characters.",
    }),
    last_name: z.string().min(2, {
        message: "Last name must be at least 2 characters.",
    }),
    role: z.enum(["ADMIN", "CUSTOMER"]),
    status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]),
});

export default function CustomerForm({ user, onClose }: ReviewFormProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const invalidate = useInvalidate();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            role: user?.role || "CUSTOMER",
            status: user?.status || "PENDING",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        const { ...data } = values;

        setLoading(true);

        void (async () => {
            let res = null;

            if (user?.id) {
                res = await api.user.update(user.id, {
                    ...data,
                });
            } else {
                res = await api.user.create({
                    ...data,
                });
            }

            if (res.error) {
                toast.error(`Error - ${res.error}`);
            } else {
                invalidate("customers");
                toast.success(`User ${user?.id ? "updated" : "created"} successfully`);
            }
            // onClose?.();
            setLoading(false);
        })();
    }

    return (
        <div className="mx-auto w-full py-6 px-2">
            <h3 className="text-lg font-medium mb-4">Update Customer</h3>
            <Form {...form}>
                <form className="space-y-6 h-full flex-1" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="w-full h-full">
                        {/* Product Form */}
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter first name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter last name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <FormControl>
                                            <Select defaultValue={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                        <FormControl>
                                            <Select defaultValue={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PENDING">Pending</SelectItem>
                                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input readOnly value={user?.email} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            <div className="flex gap-2 justify-end md:col-span-2 pb-2">
                                <Button className="min-w-32" type="button" variant="destructive" onClick={() => onClose?.()}>
                                    Close
                                </Button>
                                <Button className="min-w-32" disabled={loading} isLoading={loading} type="submit" variant="primary">
                                    {user?.id ? "Update" : "Create"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
