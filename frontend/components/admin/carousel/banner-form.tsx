"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { CarouselBanner } from "@/schemas/carousel";
import { api } from "@/apis";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const bannerSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    buttonText: z.string().optional(),
    link: z.string().optional(),
    order: z.number().default(0),
    is_active: z.boolean().default(true),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerFormProps {
    open?: boolean;
    banner?: CarouselBanner | null;
    onSuccess?: () => void;
    onClose: () => void;
}

export default function BannerForm({ banner, onSuccess, onClose }: BannerFormProps) {
    const form = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema),
        defaultValues: {
            title: "",
            subtitle: "",
            description: "",
            buttonText: "",
            link: "",
            order: 0,
            is_active: true,
        },
    });

    const { handleSubmit, reset, formState } = form;

    useEffect(() => {
        if (banner) {
            reset({
                title: banner.title,
                subtitle: banner.subtitle || "",
                description: banner.description || "",
                buttonText: banner.buttonText || "",
                link: banner.link || "",
                order: banner.order,
                is_active: banner.is_active,
            });
        } else {
            reset({
                title: "",
                subtitle: "",
                description: "",
                buttonText: "",
                link: "",
                order: 0,
                is_active: true,
            });
        }
    }, [banner, form]);

    const onSubmit = async (values: BannerFormValues) => {
        try {
            if (banner) {
                await api.admin.carousel.update(banner.id, values);
            } else {
                await api.admin.carousel.create(values);
                onClose();
            }
            toast.success("Banner saved successfully");
            onSuccess?.();
        } catch (error) {
            toast.error("Failed to save banner");
        }
    };

    return (
        <div className="bg-card py-8 px-4">
            <Form {...form}>
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="subtitle"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subtitle</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="buttonText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Button Text</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="link"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Link</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="order"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Order</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
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
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button disabled={formState.isSubmitting} isLoading={formState.isSubmitting} type="submit" variant="primary">
                            {banner ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
