import React from "react";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DBCatalog } from "@/schemas";
import { useUpdateCatalog, useCreateCatalog } from "@/lib/hooks/useCollection";

interface SharedFormProps {
    current?: DBCatalog;
    onClose?: () => void;
}

export const FormSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    is_active: z.boolean(),
});

export type SharedFormValues = z.infer<typeof FormSchema>;

export const SharedForm: React.FC<SharedFormProps> = ({ current, onClose }) => {
    const form = useForm<SharedFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: current?.title || "",
            description: current?.description || "",
            is_active: current?.is_active ?? true,
        } as any,
    });

    const createShared = useCreateCatalog();
    const updateShared = useUpdateCatalog();

    const isLoading = createShared.isPending || updateShared.isPending;

    const { handleSubmit, control } = form;

    const onSubmit = async (values: SharedFormValues) => {
        if (current?.id) {
            updateShared.mutateAsync({ id: current?.id!, data: values });
        } else {
            createShared.mutateAsync(values).then(() => onClose?.());
        }
    };

    return (
        <div className="px-4 py-4">
            <h2 className="text-lg font-semibold mb-4">{current ? "Update": "Create"} Catalog</h2>
            <Form {...form}>
                <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                    <FormField
                        control={control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Catalog Title*</FormLabel>
                                <FormControl>
                                    <Input {...field} required placeholder="My Amazing Collection" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Describe your collection and what makes it special..." />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center justify-between p-4 bg-card rounded-lg">
                                    <div className="space-y-1">
                                        <FormLabel>Active Status</FormLabel>
                                        <p className="text-sm text-muted-foreground">Make this collection visible to others</p>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end gap-2">
                        {onClose && (
                            <Button type="button" variant="destructive" onClick={onClose}>
                                Cancel
                            </Button>
                        )}
                        <Button disabled={isLoading || !form.watch("title")} isLoading={isLoading} type="submit">
                            <Save className="h-5 w-5" />
                            {current ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
