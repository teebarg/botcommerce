"use client";

import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/apis/base";
import { FAQ } from "@/types/models";
import { useInvalidate } from "@/lib/hooks/useApi";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface FaqFormProps {
    faq?: FAQ | null;
    onCancel: () => void;
}

const formSchema = z.object({
    question: z.string().min(2, {
        message: "Question must be at least 2 characters.",
    }),
    answer: z.string().min(10, {
        message: "Answer must be at least 10 characters.",
    }),
    is_active: z.boolean().default(false),
    category: z.string().min(1, {
        message: "Please select a category.",
    }),
});

type FaqFormValues = z.infer<typeof formSchema>;

export function FaqForm({ faq, onCancel }: FaqFormProps) {
    const invalidate = useInvalidate();
    const [loading, setLoading] = useState<boolean>(false);

    const form = useForm<FaqFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: faq?.question || "",
            answer: faq?.answer || "",
            is_active: faq?.is_active || false,
            category: faq?.category || "",
        },
    });

    const onSubmit = async (values: FaqFormValues) => {
        setLoading(true);
        try {
            if (faq) {
                const { error } = await api.patch<FAQ>(`/faq/${faq.id}`, values);

                if (error) throw error;
                toast.success("FAQ updated successfully");
            } else {
                const { error } = await api.post<FAQ>(`/faq`, values);

                if (error) throw error;
                toast.success("FAQ created successfully");
            }

            onCancel();
            form.reset();
            invalidate("faqs");
        } catch (error) {
            toast.error("Failed to save FAQ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-6 px-3">
            <h2 className="text-xl font-semibold mb-4">{faq ? "Edit FAQ" : "Create New FAQ"}</h2>

            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="question"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter the question" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="answer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Answer</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter the answer" rows={4} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select defaultValue={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Category</SelectLabel>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="payment">Payment</SelectItem>
                                            <SelectItem value="shipping">Shipping</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Active</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end space-x-2">
                        <Button className="min-w-32" type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button disabled={loading} isLoading={loading} type="submit" variant="primary">
                            {faq ? "Update FAQ" : "Create FAQ"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
