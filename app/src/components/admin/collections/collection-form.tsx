import type { Collection } from "@/schemas/product";

import React, { forwardRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateCollection, useUpdateCollection } from "@/hooks/useCollection";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

const CollectionFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    is_active: z.boolean().default(true),
});

export type CollectionFormValues = z.infer<typeof CollectionFormSchema>;

interface Props {
    collection?: Collection;
    type?: "create" | "update";
    onClose?: () => void;
}

type ChildRef = {}

const CollectionForm = forwardRef<ChildRef, Props>(({ type = "create", onClose, collection }, ref) => {
    const isCreate = type === "create";
    const defaultValues: CollectionFormValues = {
        name: collection?.name || "",
        is_active: collection?.is_active ?? true,
    };

    const form = useForm<CollectionFormValues>({
        resolver: zodResolver(CollectionFormSchema),
        defaultValues,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = form;

    const createMutation = useCreateCollection();
    const updateMutation = useUpdateCollection();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        reset(defaultValues);
    }, [collection]);

    useEffect(() => {
        if (createMutation.isSuccess || updateMutation.isSuccess) {
            reset();
            onClose?.();
        }
    }, [createMutation.isSuccess, updateMutation.isSuccess]);

    const onSubmit = async (data: CollectionFormValues) => {
        if (isCreate) {
            createMutation.mutate(data);
        } else if (collection?.id) {
            updateMutation.mutate({ id: collection.id, data });
        }
    };

    return (
        <div className="py-4 px-4">
            <h3 className="text-lg font-medium mb-4">{isCreate ? "Create Collection" : "Update Collection"}</h3>
            <Form {...form}>
                <form className="h-full flex flex-col" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                        <div>
                            <Input
                                label="Name"
                                placeholder="Ex. Gown"
                                {...register("name")}
                                required
                                disabled={isPending}
                                error={errors.name?.message}
                            />
                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                        </div>
                        <FormField
                            control={control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border border-input px-4 py-2">
                                    <div className="space-y-0.5">
                                        <FormLabel>Active</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                        <Button aria-label="cancel" className="min-w-32" disabled={isPending} type="button" variant="destructive" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            aria-label={isCreate ? "submit" : "update"}
                            className="min-w-32"
                            disabled={isPending}
                            isLoading={isPending}
                            type="submit"
                        >
                            {isCreate ? "Submit" : "Update"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
});

CollectionForm.displayName = "CollectionForm";

export { CollectionForm };
