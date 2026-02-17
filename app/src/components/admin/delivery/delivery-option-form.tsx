import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { DeliveryOption } from "@/schemas";
import { useInvalidate } from "@/hooks/useApi";
import { ShippingMethodSchema } from "@/schemas";
import { tryCatch } from "@/utils/try-catch";
import { clientApi } from "@/utils/api.client";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    method: ShippingMethodSchema,
    amount: z.number().min(0, "Amount must be greater than or equal to 0"),
    duration: z.string().min(1, "Duration is required"),
    is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface DeliveryOptionFormProps {
    onClose: () => void;
    initialData?: DeliveryOption | null;
}

export default function DeliveryOptionForm({ onClose, initialData }: DeliveryOptionFormProps) {
    const invalidate = useInvalidate();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            method: initialData?.method || "STANDARD",
            amount: initialData?.amount || 0,
            duration: initialData?.duration || "",
            is_active: initialData?.is_active || true,
        },
    });

    const handleSubmit = async (data: FormValues) => {
        let response = null;

        if (initialData?.id) {
            response = await tryCatch<DeliveryOption>(clientApi.patch<DeliveryOption>(`/delivery/${initialData.id}`, data));
        } else {
            response = await tryCatch<DeliveryOption>(clientApi.post<DeliveryOption>("/delivery/", data));
        }

        if (response.error) {
            toast.error(response.error);

            return;
        }

        toast.success(`${initialData ? "Updated" : "Created"} delivery option successfully`);
        invalidate("delivery");
        onClose();
    };

    return (
        <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden" onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="flex-1 overflow-y-auto py-2 px-4 space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ex: Express Delivery" />
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
                                    <Textarea {...field} placeholder="Ex: This is a description" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="method"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Method</FormLabel>
                                <Select defaultValue={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a method" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="STANDARD">Standard Delivery</SelectItem>
                                        <SelectItem value="EXPRESS">Express Delivery</SelectItem>
                                        <SelectItem value="PICKUP">Pickup</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <FormControl>
                                    <Input type="text" {...field} placeholder="Ex: 2-3 business days" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Active</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="sheet-footer">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button disabled={form.formState.isSubmitting} isLoading={form.formState.isSubmitting} type="submit">
                        {initialData ? "Update" : "Create"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
