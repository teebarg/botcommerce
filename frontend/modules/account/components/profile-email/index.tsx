"use client";

import React from "react";
import { Input } from "@components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import AccountInfo from "../account-info";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/apis";

const emailSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

type MyInformationProps = {
    customer: Omit<any, "password_hash">;
};

const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
    const [isPending, setIsPending] = React.useState<boolean>(false);

    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: customer.email || "",
        },
    });

    const clearState = () => {
        form.reset();
    };

    const onSubmit = async (updateData: EmailFormValues) => {
        setIsPending(true);

        const { error } = await api.user.update(customer.id, updateData);

        if (error) {
            toast.error(error);
            setIsPending(false);

            return;
        }

        setIsPending(false);
        toast.success("Billing address updated successfully");
    };

    return (
        <form className="w-full" onReset={() => clearState()} onSubmit={form.handleSubmit(onSubmit)}>
            <AccountInfo
                clearState={clearState}
                currentInfo={`${customer.email}`}
                data-testid="account-email-editor"
                isLoading={isPending}
                label="Email"
            >
                <div className="grid grid-cols-1 gap-y-2">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input required data-testid="email-input" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </AccountInfo>
        </form>
    );
};

export default ProfileEmail;
