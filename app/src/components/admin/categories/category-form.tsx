import type { Category } from "@/schemas/product";
import React, { forwardRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const CategoryFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    is_active: z.boolean().default(true),
    parent_id: z.number().nullable().optional(),
});

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;

interface Props {
    current?: Category;
    type?: "create" | "update";
    onClose?: () => void;
    hasParent?: boolean;
    parent_id?: number | null;
}

type ChildRef = {};

const CategoryForm = forwardRef<ChildRef, Props>(({ type = "create", onClose, current, hasParent = false, parent_id = null }, ref) => {
    const isCreate = type === "create";
    const defaultValues = React.useMemo<CategoryFormValues>(
        () => ({
            name: current?.name || "",
            is_active: current?.is_active ?? true,
            parent_id: hasParent && parent_id ? parent_id : (current?.parent_id ?? null),
        }),
        [current, parent_id, hasParent]
    );

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(CategoryFormSchema),
        defaultValues,
    });

    const { handleSubmit, reset, control } = form;

    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    useEffect(() => {
        if (createMutation.isSuccess || updateMutation.isSuccess) {
            reset();
            onClose?.();
        }
    }, [createMutation.isSuccess, updateMutation.isSuccess]);

    const onSubmit = async (data: CategoryFormValues) => {
        if (isCreate) {
            createMutation.mutate(data);
        } else if (current?.id) {
            updateMutation.mutate({ id: current.id, data });
        }
    };

    return (
        <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6 flex-1 overflow-scroll px-2 pb-4">
                    <FormField
                        control={control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex. Gown" {...field} disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border border-input px-4 py-2">
                                <div className="space-y-0.5">
                                    <FormLabel>Active</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} disabled={isPending} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {/* {hasParent && parent_id && <input type="hidden" {...form.register("parent_id", { value: parent_id })} />} */}
                </div>
                <div className="sheet-footer">
                    <Button aria-label="cancel" className="min-w-32" disabled={isPending} type="button" variant="destructive" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button aria-label="submit" className="min-w-32" isLoading={isPending} type="submit">
                        {isCreate ? "Submit" : "Update"}
                    </Button>
                </div>
            </form>
        </Form>
    );
});

CategoryForm.displayName = "CategoryForm";

export { CategoryForm };
