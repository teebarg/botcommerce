"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { CarouselBanner } from "@/schemas/carousel";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateCarouselBanner, useUpdateCarouselBanner } from "@/lib/hooks/useCarousel";

const bannerSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    buttonText: z.string().optional(),
    link: z.string().optional(),
    order: z.number().default(0),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerFormProps {
    banner?: CarouselBanner | null;
    onClose: () => void;
}

export default function BannerForm({ banner, onClose }: BannerFormProps) {
    const form = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema),
        defaultValues: {
            title: "",
            subtitle: "",
            description: "",
            buttonText: "",
            link: "",
            order: 0,
        },
    });

    const { handleSubmit, reset, formState } = form;

    const createBanner = useCreateCarouselBanner();
    const updateBanner = useUpdateCarouselBanner();

    useEffect(() => {
        reset({
            title: banner?.title || "",
            subtitle: banner?.subtitle || "",
            description: banner?.description || "",
            buttonText: banner?.buttonText || "",
            link: banner?.link || "",
            order: banner?.order || 0,
        });
    }, [banner, form]);

    const onSubmit = async (values: BannerFormValues) => {
        try {
            if (banner?.id) {
                await updateBanner.mutateAsync({ id: banner.id, data: values });
            } else {
                await createBanner.mutateAsync(values);
                onClose();
            }
        } catch {}
    };

    return (
        <div className="bg-card py-8 px-4 h-full">
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
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="destructive" onClick={onClose}>
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
