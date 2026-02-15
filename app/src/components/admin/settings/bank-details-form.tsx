import type React from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Message } from "@/schemas/common";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { clientApi } from "@/utils/api.client";

interface BankDetailsFormProps {
    onClose: () => void;
}

const formSchema = z.object({
    bank_name: z.string().min(1, { message: "Bank name is required" }),
    account_name: z.string().min(1, { message: "Account name is required" }),
    account_number: z
        .string()
        .min(10, { message: "Account number must be at least 10 characters long" })
        .max(12, { message: "Account number must be at most 12 characters long" }),
});

type BankDetailsFormValues = z.infer<typeof formSchema>;

const BankDetailsForm: React.FC<BankDetailsFormProps> = ({ onClose }) => {
    const form = useForm<BankDetailsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bank_name: "",
            account_name: "",
            account_number: "",
        },
    });

    const { mutate: createBankDetails, isPending } = useMutation({
        mutationFn: async (input: BankDetailsFormValues) => await clientApi.post<Message>("/bank-details/", input),
        onSuccess: () => {
            toast.success("Bank details added successfully");
            onClose();
            form.reset();
        },
        onError: (e) => {
            toast.error(`${e}` || "Failed to add bank details");
        },
    });

    const onSubmit = (values: BankDetailsFormValues) => {
        createBankDetails(values);
    };

    return (
        <Form {...form}>
            <form className="flex-1 flex flex-col overflow-hidden" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex-1 overflow-y-auto py-2 px-4 space-y-4">
                    <FormField
                        control={form.control}
                        name="bank_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter bank name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="account_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter account name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="account_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter account number" type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="sheet-footer">
                    <Button aria-label="close" className="min-w-36" type="button" variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button aria-label="delete" className="min-w-36" isLoading={isPending} type="submit">
                        Submit
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default BankDetailsForm;
