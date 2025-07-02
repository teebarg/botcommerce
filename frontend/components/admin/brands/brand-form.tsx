"use client";

import type { Brand } from "@/schemas/product";

import React, { forwardRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@components/ui/input";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateBrand, useUpdateBrand } from "@/lib/hooks/useBrand";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

const BrandFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    is_active: z.boolean().default(true),
});

export type BrandFormValues = z.infer<typeof BrandFormSchema>;

interface Props {
    current?: Brand;
    type?: "create" | "update";
    onClose?: () => void;
}

interface ChildRef {}

const BrandForm = forwardRef<ChildRef, Props>(({ type = "create", onClose, current }, ref) => {
    const isCreate = type === "create";
    const defaultValues: BrandFormValues = {
        name: current?.name || "",
        is_active: current?.is_active ?? true,
    };

    const form = useForm<BrandFormValues>({
        resolver: zodResolver(BrandFormSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = form;

    const createMutation = useCreateBrand();
    const updateMutation = useUpdateBrand();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        reset(defaultValues);
    }, [current]);

    useEffect(() => {
        if (createMutation.isSuccess || updateMutation.isSuccess) {
            reset();
            onClose?.();
        }
    }, [createMutation.isSuccess, updateMutation.isSuccess]);

    const onSubmit = async (data: BrandFormValues) => {
        if (isCreate) {
            createMutation.mutate(data);
        } else if (current?.id) {
            updateMutation.mutate({ id: current.id, data });
        }
    };

    return (
        <div className="mx-auto w-full px-2 py-6">
            <h2 className="text-xl font-semibold mb-4">{isCreate ? "Create Brand" : "Update Brand"}</h2>
            <Form {...form}>
                <form className="h-full flex flex-col" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                        <FormField
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex. Nike" {...field} disabled={isPending} />
                                    </FormControl>
                                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border border-divider px-4 py-2">
                                    <div className="space-y-0.5">
                                        <FormLabel>Active</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} disabled={isPending} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex items-center justify-end space-x-2 mt-6">
                        <Button aria-label="cancel" className="min-w-32" disabled={isPending} type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button aria-label="submit" className="min-w-32" isLoading={isPending} type="submit" variant="primary">
                            {isCreate ? "Submit" : "Update"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
});

BrandForm.displayName = "BrandForm";

export { BrandForm };
