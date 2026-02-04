import type React from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BankDetailsSchema } from "@/schemas/common";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { createBankDetailsFn } from "@/server/generic.server";

interface BankDetailsFormProps {
    onClose: () => void;
}

const bankDetailsFormSchema = BankDetailsSchema.omit({
    id: true,
    is_active: true,
    created_at: true,
    updated_at: true,
});

type BankDetailsFormValues = z.infer<typeof bankDetailsFormSchema>;

const BankDetailsForm: React.FC<BankDetailsFormProps> = ({ onClose }) => {
    const form = useForm<BankDetailsFormValues>({
        resolver: zodResolver(bankDetailsFormSchema),
        defaultValues: {
            bank_name: "",
            account_name: "",
            account_number: "",
        },
    });

    const { mutate: createBankDetails, isPending } = useMutation({
        mutationFn: async (input: BankDetailsFormValues) => await createBankDetailsFn({ data: input }),
        onSuccess: () => {
            toast.success("Bank details added successfully");
            onClose();
            form.reset();
        },
        onError: () => {
            toast.error("Failed to add bank details");
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
